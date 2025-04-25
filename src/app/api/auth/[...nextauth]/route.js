import NextAuth from "next-auth";
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
        console.log("Current NODE_ENV:", process.env.NODE_ENV);
        console.log("authorize() triggered");

        // Optional: log presence of environment vars (not values)
        if (!isProd) {
          console.log("Environment check:");
          console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "[SET]" : "[MISSING]");
          console.log("AWS_ACCESS_KEY_ID:", process.env.MYAPP_AWS_ACCESS_KEY_ID ? "[SET]" : "[MISSING]");
        }

        try {
          await connectToDatabase();
          console.log("DynamoDB connected");

          const user = await User.findOne({ email: credentials.email });
          console.log("User found:", user?.email ?? "Not found");

          if (!user) {
            throw new Error("No user found with the email");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log("Password match:", isValid);

          if (!isValid) {
            throw new Error("Password is incorrect");
          }

          console.log("Login success for:", user.email);
          return {
            uuid: user.uuid,
            email: user.email,
            username: user.username,
            role: user.role,
          };
        } catch (err) {
          console.error("authorize() error:", err);
          throw err;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (!isProd) console.log("jwt() — token before:", token);
      if (user) {
        token.uuid = user.uuid;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
        if (!isProd) console.log("jwt() — user merged into token:", token);
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

    async signIn({ user }) {
      console.log("signIn() called — user:", user?.email ?? "unknown");
      return true;
    },
  },

  pages: {
    signIn: "/authflow",
  },
});

export { handler as GET, handler as POST };
