import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import axiosInstance from "@/lib/axios";
import { redirect } from "next/navigation";

const refreshToken = async (token: any) => {
  try {
    // console.log("refreshing token using refresh token", token.refreshToken);
    const response = await axiosInstance.post(
      "/auth/refresh-token",
      {
        refresh_token: token.refreshToken,
      },
      {
        headers: {
          "Content-Type": " application/x-www-form-urlencoded",
          "X-RefreshToken-Request": true,
        },
        withCredentials: true,
      }
    );
    // set token in header
    axiosInstance.defaults.headers[
      "Authorization"
    ] = `Bearer ${response.data.access.token}`;

    // console.log("new Access Token", response.data.access);
    console.log(
      "new Access Token expiration time",
      new Date(response.data.access.expires_at).toLocaleTimeString()
    );

    return {
      ...token,
      accessToken: response.data.access.token,
      accessTokenExpiresAt: new Date(response.data.access.expires_at),
    };
  } catch (error) {
    // console.error("Refresh token error:", (error as any).response.data);
    redirect("/signout");
  }
};

export const authOptions: NextAuthConfig = {
  providers: [
    Google,
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username_email: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          // console.log("sending request for token with credentials", credentials)
          const response = await axiosInstance.post(
            "/auth/login/token",
            {
              username: credentials.username_email,
              password: credentials.password,
            },
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              withCredentials: true,
            }
          );


          if (response.status === 200 && response.data) {

            // set token in header
            axiosInstance.defaults.headers[
              "Authorization"
            ] = `Bearer ${response.data.access.token}`;

            return response.data;
          } else {
            // console.log(response.statusText);
            throw new Error('Login failed');
          }
        } catch (error: any) {
          // console.error("Login error:", error.response.data);
          throw new Error(error.response.data?.detail || "Login failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 15 * 24 * 60 * 60, // 15 days
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        // console.log("google account", account);
        // console.log("Google profile", profile);
        const response = await axiosInstance.post('/auth/google/login', {
          id_token: account?.id_token
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        })

        console.log(response.data)
        user.user = response.data.user
        user.access = response.data.access
        user.refresh = response.data.refresh
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // console.log('user in jwt', user);
        // Attach access and refresh tokens to the JWT
        token.id = user.user.id;
        token.name = user.user.first_name + " " + user.user?.last_name;
        token.username = user.user.username;
        token.email = user.user.email;
        token.role = user.user.role;
        token.is_email_verified = user.user.is_email_verified;
        token.is_active = user.user.is_active;

        token.accessToken = user.access?.token;
        token.accessTokenExpiresAt = new Date(user.access?.expires_at);
        token.refreshToken = user.refresh?.token;
        token.refreshTokenExpiresAt = new Date(user.refresh?.expires_at);

        // // set authorization token in cookies
        // cookies().set("access_token", user.access.token , {
        //   httpOnly: true,
        //   secure: true,
        //   sameSite: "none",
        //   expires: new Date(user?.access.expires_at)
        // })
        // cookies().set("refresh_token", user.refresh.token , {
        //   httpOnly: true,
        //   secure: true,
        //   sameSite: "none",
        //   expires:  new Date(user?.refresh.expires_at)
        // })
      }

      if (trigger === "update" && session) {
        token.username = session.user.username;
        token.name = session.user.name;
      }

      // if token not expired, return token
      if (
        token.accessToken &&
        new Date().getTime() <
          new Date(token.accessTokenExpiresAt as Date).getTime() - 10000
      ) {
        return token;
      }

      // if refreshToken expired, signout
      if (
        token.refreshToken &&
        new Date(token.refreshTokenExpiresAt as Date).getTime() <
          new Date().getTime()
      ) {
        redirect("/signout");
      }

      // if token expired, refresh token
      if (token.refreshToken) return refreshToken(token);

      // console.log("refresh token not found");
      // if no refresh Token found
      return token;
    },
    async session({ session, token }) {
      // Attach the access token to the session
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
        session.user.role = token.role as "admin" | "user";
        session.user.is_email_verified = token.is_email_verified as boolean;
        session.user.username = token.username as string;
        session.accessToken = token.accessToken as string;
        // session.refreshToken = token.refreshToken as unknown as string;
      }

      // console.log("token in session",token)
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    signOut: "/signout",
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
