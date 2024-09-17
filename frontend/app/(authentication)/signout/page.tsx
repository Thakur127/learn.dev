"use client";

import axiosInstance from "@/lib/axios";
import { signOut } from "next-auth/react";
import { useEffect } from "react";

const Page = () => {
  useEffect(() => {
    logout();
    signOut({
      callbackUrl: "/signin",
      redirect: true,
    });
  }, []);

  return (
    <div className="flex items-center justify-center h-svh ">
      <h3>Signing out</h3>
    </div>
  );
};
export default Page;

const logout = async () => {
  try {
    await axiosInstance.post("/auth/logout");
  } catch (error) {
    console.log(error);
  }
};
