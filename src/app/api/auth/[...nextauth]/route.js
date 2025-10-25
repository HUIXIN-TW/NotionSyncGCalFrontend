import logger, { isProdRuntime as isProd } from "@/utils/shared/logger";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { createUser, getUserByEmail, getUserByProviderSub } from "@models/user";

// Define and export NextAuth configuration for shared use
export const authOptions = {
  debug: !isProd,
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // fetch credential user
        const user = await getUserByEmail(credentials.email);
        if (!user || user.provider !== "credentials") {
          throw new Error("Invalid email or login method");
        }
        const validPassword = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );
        if (!validPassword) {
          throw new Error("Invalid email or password");
        }
        return {
          uuid: user.uuid,
          email: user.email,
          username: user.username,
          role: user.role,
          image: user.image,
          provider: "credentials",
        };
      },
    }),
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
          token.isNewUser = true;
          dbUser = await createUser({
            email: user.email,
            username: user.username || user.name || user.email.split("@")[0],
            provider: "google",
            providerSub: sub,
            image: user.image || "",
            role: "user",
          });
          // First-time login → create S3 templates (fire-and-forget)
          // Fire-and-forget template init
          try {
            const { createTemplates, uploadTemplates } = await import(
              "@/utils/server/s3-client"
            );
            const fn = createTemplates || uploadTemplates;
            if (fn)
              fn(dbUser.uuid).catch((err) =>
                logger.error("template init error", err),
              );
          } catch (e) {
            logger.warn("template init module load failed", e);
          }
        }
        token.uuid = dbUser.uuid;
        token.role = dbUser.role;
      }

      // —— Credentials sign-in path
      if (account?.provider === "credentials" && user) {
        token.provider = "credentials";
        // No providerSub for credentials
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
      session.isNewUser = Boolean(token.isNewUser);
      return session;
    },
  },

  pages: {
    signIn: "/authflow",
    signOut: "/",
    error: "/api/auth/error",
  },
};

// Initialize NextAuth with shared configuration
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
