import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@utils/db-connection";
import User from "@models/user";

const handler = NextAuth({
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🟡 authorize() triggered");
        console.log("📥 Received credentials:", credentials);
        console.log("🔍 ENV CHECK:");
        console.log("🔹 NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET);
        console.log("🔹 NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
        console.log("🔹 MYAPP_AWS_ACCESS_KEY_ID:", process.env.MYAPP_AWS_ACCESS_KEY_ID);
        console.log("🔹 MYAPP_AWS_SECRET_ACCESS_KEY:", process.env.MYAPP_AWS_SECRET_ACCESS_KEY);
        console.log("🔹 MYAPP_AWS_REGION:", process.env.MYAPP_AWS_REGION);
        console.log("🔹 DYNAMODB_TABLE:", process.env.DYNAMODB_TABLE);

        try {
          await connectToDatabase();
          console.log("✅ DynamoDB connected");

          const user = await User.findOne({ email: credentials.email });
          console.log("🔍 User found:", user?.email ?? "❌ Not found");

          if (!user) {
            throw new Error("No user found with the email");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log("🔑 Password match:", isValid);

          if (!isValid) {
            throw new Error("Password is incorrect");
          }

          console.log("✅ Login success for:", user.email);
          return {
            uuid: user.uuid,
            email: user.email,
            username: user.username,
            role: user.role,
          };
        } catch (err) {
          console.error("❌ authorize() error:", err);
          throw err;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      console.log("🔁 jwt() callback — token before:", token);
      if (user) {
        token.uuid = user.uuid;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
        console.log("🔐 jwt() — user merged into token:", token);
      }
      return token;
    },

    async session({ session, token }) {
      console.log("📦 session() callback — token:", token);
      session.user = {
        ...session.user,
        uuid: token.uuid,
        email: token.email,
        username: token.username,
        role: token.role,
      };
      console.log("📤 session() — session returned:", session);
      return session;
    },

    async signIn({ user, account, profile, email, credentials }) {
      console.log("🟢 signIn() called — user:", user);
      return true;
    },
  },

  pages: {
    signIn: "/authflow",
  },
});

export { handler as GET, handler as POST };
