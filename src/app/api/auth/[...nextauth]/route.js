import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@utils/db-connection";
import User from "@models/user";

const isProd = process.env.NODE_ENV === "production";

const handler = NextAuth({
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
        // connect and fetch credential user
        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email });
        if (!user || user.provider !== "credentials") {
          throw new Error("Invalid email or login method");
        }
        const validPassword = await bcrypt.compare(
          credentials.password,
          user.password,
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
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (!isProd) console.log("jwt() — token before:", token);

      if (user) {
        token.uuid = user.uuid || token.uuid;
        token.email = user.email || token.email;
        token.username =
        user.username || user.name || user.email?.split("@")[0];
        token.image = user.image || token.image;
        token.role = user.role || token.role;

        // If user signed in via Google
        if (account?.provider === "google") {
          token.provider = "google";

          // Fetch user from database to populate uuid and role
          await connectToDatabase();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) {
            token.uuid = dbUser.uuid;
            token.role = dbUser.role;
          } else {
            console.log("User not found in DB, creating new user...");
            // Create a new user in the database if not found
            token.uuid = user.uuid || "pending";
            token.role = user.role || "pending";
          }
        }

        // If user signed in via credentials
        if (account?.provider === "credentials") {
          token.provider = "credentials";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (!isProd) console.log("session() — token:", token);

      session.user = {
        ...session.user,
        uuid: token.uuid,
        email: token.email,
        username: token.username,
        role: token.role,
      };

      if (!isProd) console.log("session() — session returned:", session);
      return session;
    },
  },

  // Create or update user record when signing in via Google
  events: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        await connectToDatabase();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            email: user.email,
            username: user.username || user.name || user.email.split("@")[0],
            provider: "google",
            image: user.image || "",
            role: "user",
          });
        }
      }
    },
  },

  pages: {
    signIn: "/authflow",
    signOut: "/",
    error: "/not-found",
  },
});

export { handler as GET, handler as POST };
