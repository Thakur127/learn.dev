import { auth } from "@/auth";
import axios from "axios";
import { getSession } from "next-auth/react";

const BASEURL = process.env.NEXT_PUBLIC_API_URL + '/api/v1';

const axiosInstance = axios.create({
  baseURL: BASEURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    if (!config.headers["X-RefreshToken-Request"]) {
      let session = null;
      try {
        session = await getSession();
      } catch (error) {
        session = await auth();
      }

      // console.log("axios", session);
      if (session?.accessToken) {
        config.headers["Authorization"] = `Bearer ${session?.accessToken}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
