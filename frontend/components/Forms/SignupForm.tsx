"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EyeIcon, EyeOffIcon, Github, CodeXml } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import axiosInstance from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { redirect, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { signIn } from "next-auth/react";

interface Inputs {
  first_name: string;
  last_name?: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  // const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
  //   null
  // );

  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm<Inputs>();

  // const username = watch("username"); // Directly watch the username field

  // // Debounce logic for checking username availability
  // const checkUsernameAvailability = useCallback(async () => {
  //   console.log("Checking username availability");
  //   if (!username) return;
  //   try {
  //     const response = await axiosInstance.get(
  //       `/user/check-username-availability/${username}`
  //     );
  //     if (response.status === 204) {
  //       setUsernameAvailable(true);
  //     } else if (response.status === 409) {
  //       setUsernameAvailable(false);
  //     }
  //   } catch (error) {
  //     console.error("Error checking username availability", error);
  //   }
  // }, [username]);

  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     if (username) {
  //       checkUsernameAvailability();
  //     }
  //   }, 500); // Set a 500ms debounce

  //   // Cleanup the timeout when the component unmounts or username changes
  //   return () => {
  //     clearTimeout(handler);
  //   };
  // }, [username, checkUsernameAvailability]);

  const mutation = useMutation({
    mutationFn: async (data: Inputs) => {
      const response = await axiosInstance.post("/auth/signup", data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return response.data;
    },
    onSuccess(data, variables, context) {
      // TODO: Add success toast

      toast({
        title: "Success",
        description: "Sign up successful. Please sign in to continue.",
        variant: "success",
      });

      router.push("/signin");
    },

    onError(error, variables, context) {
      // TODO: Add error toast
      console.log(error);
      toast({
        title: "Error",
        description: (error as any).response.data.detail,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: Inputs) => {
    // console.log("Form Data: ", data);
    // Here you can send `data` to your API endpoint for signup
    mutation.mutate(data);
  };

  return (
    <div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <CodeXml className="h-6 w-6 mr-2" />
            <CardTitle className="text-2xl font-bold">learn.dev</CardTitle>
          </div>
          <CardDescription>Create an account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="first_name">First Name</label>
                <Input
                  id="first_name"
                  placeholder="John"
                  {...register("first_name", {
                    required: "This field is required",
                  })}
                />
                {errors.first_name && (
                  <p className="text-red-500 text-xs">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="last_name">Last Name</label>
                <Input
                  id="last_name"
                  placeholder="Doe"
                  {...register("last_name")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="username">Username</label>
              {/* {username &&
                (usernameAvailable === false ? (
                  <p className="text-red-500 text-xs">
                    <span className="font-bold">{username}</span> is already
                    taken
                  </p>
                ) : (
                  usernameAvailable === true && (
                    <p className="text-green-500 text-xs">
                      <span className="font-bold">{username}</span> is
                      available.
                    </p>
                  )
                ))} */}
              <Input
                id="username"
                placeholder="johndoe"
                {...register("username", {
                  required: "This field is required",
                })}
              />

              {errors.username && (
                <p className="text-red-500 text-xs">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register("email", { required: "This field is required" })}
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password">Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "This field is required",
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm_password">Confirm Password</label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirm_password", {
                    required: "This field is required",
                    validate: (value) =>
                      value === watch("password") ||
                      "The passwords do not match",
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? "Hide password" : "Show password"}
                  </span>
                </Button>
              </div>
              {errors.confirm_password && (
                <p className="text-red-500 text-xs">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              Sign Up
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={(e) => signIn("google")}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="w-full" disabled={true}>
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full">
            Already have an account?{" "}
            <Link href="/signin" className="text-primary hover:underline">
              Signin
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
