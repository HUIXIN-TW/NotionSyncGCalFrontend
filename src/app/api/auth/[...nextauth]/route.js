import logger, { isProdRuntime as isProd } from "@utils/logger";
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
      if (!user) return token;

      if (account?.provider === "google") {
        token.provider = "google";
        const sub = account.providerAccountId;

        // Upsert user
        let dbUser = await getUserByProviderSub?.("google", sub);
        const isNew = !dbUser;
        if (isNew) {
          dbUser = await createUser({
            email: user.email,
            username: user.username || user.name || user.email.split("@")[0],
            provider: "google",
            providerSub: sub,
            image: user.image || "",
            role: "user",
          });

          // First-time login → create S3 templates (fire-and-forget)
          import("@/utils/server/s3-client").then(
            ({ createTemplates, uploadTemplates }) => {
              const fn = createTemplates || uploadTemplates;
              fn &&
                fn(dbUser.uuid).catch((err) =>
                  logger.error("template init error", err),
                );
            },
          );
        }

        token.uuid = dbUser.uuid;
        token.role = dbUser.role;
      }

      if (account?.provider === "credentials") {
        token.provider = "credentials";
        token.uuid = user.uuid || token.uuid;
        token.role = user.role || token.role;
      }

      // common fields
      token.email = user.email || token.email;
      token.username =
        user.username ||
        user.name ||
        user.email?.split("@")[0] ||
        token.username;
      token.image = user.image || token.image;

      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        uuid: token.uuid,
        email: token.email,
        username: token.username,
        role: token.role,
      };
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
