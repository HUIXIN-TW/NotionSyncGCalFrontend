import "server-only";

import logger, { isProdRuntime as isProd } from "@utils/shared/logger";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import {
  createUser,
  getUserByProviderSub,
  updateLastLogin,
} from "@models/user";
import { cookies } from "next/headers";
import { uploadNotionConfigTemplateByUuid } from "@models/user";

// Define and export NextAuth configuration for shared use
export const authOptions = {
  debug: !isProd,
  secret: process.env.NEXTAUTH_SECRET,
  // Allow NextAuth session cookies inside the Notion iframe. SameSite=None is
  // required so third-party requests (the embed) can include the session, and
  // Secure/httpOnly keeps the cookie scoped to HTTPS only. The embed itself is
  // restricted to Notion domains via next.config.js `frame-ancestors`.
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
      },
    },
    callbackUrl: {
      name: "__Secure-next-auth.callback-url",
      options: {
        sameSite: "none",
        secure: true,
        path: "/",
      },
    },
    csrfToken: {
      name: "__Host-next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
      },
    },
  },

  providers: [
    GoogleProvider({
      name: "Google",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile",
          prompt: "select_account",
        },
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // —— Google OAuth sign-in path
      if (account?.provider === "google" && user) {
        // google oauth login
        token.provider = "google";
        const sub = account.providerAccountId;
        token.providerSub = sub;

        // Upsert user by providerSub
        let dbUser = await getUserByProviderSub("google", sub);
        if (!dbUser) {
          token.isNewUser = true; // Mark as new user
          dbUser = await createUser({
            email: user.email,
            username: user.username || user.name || user.email.split("@")[0],
            provider: "google",
            providerSub: sub,
            image: user.image || "",
            role: "user",
          });
          try {
            await uploadNotionConfigTemplateByUuid(dbUser.uuid);
          } catch (e) {
            logger.warn("template init failed", e);
          }
        }
        token.uuid = dbUser.uuid;
        token.role = dbUser.role;
      }

      // —— Common population when `user` exists (first sign-in)
      if (user) {
        token.email = user.email || token.email;
        token.username =
          user.username ||
          user.name ||
          user.email?.split("@")[0] ||
          token.username;
        token.image = user.image || token.image;
        token.uuid = user.uuid || token.uuid;
        token.role = user.role || token.role;
      }

      if (!token.username && token.email) {
        token.username = token.email.split("@")[0];
      }

      return token;
    },

    async session({ session, token }) {
      // mark new user in session
      session.isNewUser = !!token.isNewUser;

      // Remove isNewUser from token to avoid persistence
      // if (token.isNewUser) delete token.isNewUser;
      session.user = {
        ...session.user,
        uuid: token.uuid,
        email: token.email,
        username: token.username,
        role: token.role,
        image: token.image,
        provider: token.provider,
        providerSub: token.providerSub,
      };
      return session;
    },
  },

  events: {
    async signIn({ user, account }) {
      try {
        let dbUser = null;

        if (account?.provider === "google") {
          dbUser = await getUserByProviderSub(
            "google",
            account.providerAccountId,
          );
        }

        if (dbUser) {
          // Update lastLoginAt and lastLoginLocation
          const cookieStore = await cookies();
          const ip = cookieStore.get("client_ip")?.value ?? "unknown";
          logger.info("updateLastLogin", { uuid: dbUser.uuid, ip });
          await updateLastLogin(dbUser.uuid, ip);
        }
      } catch (err) {
        logger.warn("Failed to update lastLogin / location", err);
      }
    },
  },

  pages: {
    signIn: "/",
    signOut: "/",
    error: "/error",
  },
};

// Initialize NextAuth with shared configuration
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
