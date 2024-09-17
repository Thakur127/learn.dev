import { DefaultSession } from "next-auth";

interface Token {
  token: string;
  expires_at: Date;
  scheme: "bearer";
}

declare module "next-auth" {
  interface User {
    user: {
      id?: string;
      first_name?: string;
      last_name?: string;
      username?: string;
      email?: string;
      role?: "admin" | "user";
      is_email_verified?: boolean;
      is_active?: boolean;
      created_at?: Date;
      profile?: {
        image_url?: string;
        about?: string;
      };
    };
    access: Token;
    refresh: Token;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      email: string;
      role: "admin" | "user";
      is_email_verified: boolean;
    }; // & DefaultSession['user']
    accessToken: string;
    refreshToken?: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    username: string;
    email: string;
    role: "admin" | "user";
    is_email_verified: boolean;
    accessToken: string;
    refreshToken: string;
  }
}
