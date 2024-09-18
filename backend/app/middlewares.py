import time
from fastapi import FastAPI, Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware


class RateLimiterMiddleware(BaseHTTPMiddleware):
    request_counters: dict[str, dict] = {}

    def __init__(self, app: FastAPI, requests_limit: int, time_window: int):
        super().__init__(app)
        self.requests_limit = requests_limit
        self.time_window = time_window  # in seconds

    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "127.0.0.1"
        route_path = request.url.path
        current_time = int(time.time())
        key = f"{client_ip}:{route_path}"

        try:
            if key not in self.request_counters:
                self.request_counters[key] = {"timestamp": current_time, "count": 1}
            else:
                if (
                    current_time - self.request_counters[key]["timestamp"]
                    > self.time_window
                ):
                    self.request_counters[key] = {"timestamp": current_time, "count": 1}
                else:
                    if self.request_counters[key]["count"] >= self.requests_limit:
                        return Response(
                            status_code=429,
                            content="Rate limit exceeded. Please try again later.",
                            headers={
                                "X-RateLimit-Limit": str(self.requests_limit),
                                "X-RateLimit-Remaining": str(0),
                                "X-RateLimit-Reset": str(
                                    self.time_window
                                    - (
                                        current_time
                                        - self.request_counters[key]["timestamp"]
                                    )
                                ),
                            },
                        )
                    else:
                        self.request_counters[key]["count"] += 1

            # Clean up expired client data (optional)
            expired_keys = [
                k
                for k in self.request_counters
                if current_time - self.request_counters[k]["timestamp"]
                > self.time_window
            ]
            for k in expired_keys:
                del self.request_counters[k]

            # Prepare the response
            response = await call_next(request)

            # Add headers for rate limiting
            remaining_requests = (
                self.requests_limit - self.request_counters[key]["count"]
            )
            response.headers["X-RateLimit-Limit"] = str(self.requests_limit)
            response.headers["X-RateLimit-Remaining"] = str(remaining_requests)
            response.headers["X-RateLimit-Reset"] = str(
                self.time_window
                - (current_time - self.request_counters[key]["timestamp"])
            )

            return response

        except HTTPException as e:
            raise e  # Re-raise known HTTP exceptions
        except Exception as e:
            print(f"Unexpected error: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
