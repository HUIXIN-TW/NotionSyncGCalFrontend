import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectToDatabase } from "@utils/database";
import User from "@models/user";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Received credentials:", credentials);

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

        // Return user object if authentication succeeds
        return {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  // Add any additional NextAuth configuration here
  callbacks: {
    async jwt({ token, user }) {
      // Add user email to JWT token if user object exists
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.username;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        email: token.email,
        name: token.name,
        role: token.role,
      };
      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      const redirectUrl = baseUrl + "/profile";
      console.log(`Redirecting to: ${redirectUrl}`);
      return redirectUrl;
    },
  },
  pages: {
    signIn: "/authflow",
  },
});

export { handler as GET, handler as POST };
