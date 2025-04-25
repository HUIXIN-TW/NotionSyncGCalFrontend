import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@utils/db-connection";
import User from "@models/user";

const handler = NextAuth({
  debug: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Received credentials:", credentials.email);

        await connectToDatabase();

        const user = await User.findOne({ email: credentials.email });
        console.log("User found:", user);

        if (!user) {
          throw new Error("No user found with the email");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        console.log("Password valid:", isValid);

        if (!isValid) {
          throw new Error("Password is incorrect");
        }

        return {
          uuid: user.uuid,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uuid = user.uuid;
        token.email = user.email;
        token.username = user.username;
        token.role = user.role;
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
      };
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
  },
  pages: {
    signIn: "/authflow",
  },
});

export { handler as GET, handler as POST };
