"use client";

import React, { useState } from "react";
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
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

interface Credentials {
  username_email: string;
  password: string;
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Credentials>();

  const onSubmit = async (data: Credentials) => {
    setIsPending(true);
    try {
      const result = await signIn("credentials", {
        // callbackUrl: searchParams.get("callbackUrl") || "/",
        // redirect: false,
        username_email: data.username_email,
        password: data.password,
      });

      // console.log(result);
      if (result?.error) {
        // If there's an error, set the error message
        toast({
          title: "Sign In Failed",
          description: result.error, // Use the error message from result
          variant: "destructive",
        });
      } else {
        window.location.href = searchParams.get("callbackUrl") || "/";
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: (error as any).response.data.detail,
        variant: "destructive",
      });
    }
    setIsPending(false);
  };

  return (
    <div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <CodeXml className="h-6 w-6 mr-2" />
            <CardTitle className="text-2xl font-bold">learn.dev</CardTitle>
          </div>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username_email">Username or Email</label>
              <Input
                id="username_email"
                placeholder="johndoe or john@example.com"
                {...register("username_email", {
                  required: "Username or Email is required",
                })}
              />
              {errors.username_email && (
                <p className="text-red-600 text-sm">
                  {errors.username_email.message}
                </p>
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
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    maxLength: {
                      value: 20,
                      message: "Password must be less than 20 characters",
                    },
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={(e) => setShowPassword(!showPassword)}
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
                <p className="text-red-600 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              Sign In
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
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
