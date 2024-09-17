import { auth } from "@/auth";

export default auth((req) => {
  //   console.log(req.nextUrl);

  // console.log(req.auth);
  // If the user is not authenticated
  if (!req.auth) {
    const isPublicRoute = config.publicRoutes.some((pattern) =>
      new RegExp(pattern).test(req.nextUrl.pathname)
    );

    const isProtectedRoute = config.protectedRoutes.some((pattern) => 
      new RegExp(pattern).test(req.nextUrl.pathname)
    );
    
    const newUrl = new URL(
      "/signin?callbackUrl=" + req.nextUrl.pathname,
      req.nextUrl.origin
    );

    if (isProtectedRoute) {  
      return Response.redirect(newUrl)
    }

    // Redirect to signin if the route is not public
    // if (!isPublicRoute) {
    //   return Response.redirect(newUrl);
    // }
  }

  // If the user is authenticated and trying to access signin/signup, redirect away
  if (
    req.auth &&
    (req.nextUrl.pathname === "/signin" || req.nextUrl.pathname === "/signup")
  ) {
    return Response.redirect(new URL(req.nextUrl.origin, req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],

  protectedRoutes: [
    "/contributions$",
    "/contributions/new$",
  ],

  // Define public routes with regular expressions for dynamic segments
  publicRoutes: [
    "^/$",
    "^/signin$",
    "^/signup$",
    "^/challenges(/[^/]+)?$", // Match /challenges and /challenges/:slug
    "^/user(/[^/]+)?$", // Match /user and /user/:username
    "^/blog$"
  ],
};
