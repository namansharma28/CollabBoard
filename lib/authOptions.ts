import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/mongodb";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/error",
  },
  callbacks: {
    async session({ session }) {
      if (session?.user?.email) {
        try {
          const { db } = await connectToDatabase();
          const user = await db.collection("users").findOne({ email: session.user.email });

          if (user) {
            session.user.name = user.name || session.user.name;
            session.user.image = user.image || session.user.image;
          }
        } catch (error) {
          console.error("Error fetching user data for session:", error);
        }
      }
      return session;
    },
    async signIn({ user }) {
      if (!user?.email) return false;

      try {
        const { db } = await connectToDatabase();

        const existingUser = await db.collection("users").findOne({ email: user.email });

        if (!existingUser) {
          await db.collection("users").insertOne({
            email: user.email,
            name: user.name,
            image: user.image,
            createdAt: new Date(),
          });
        } else {
          await db.collection("users").updateOne(
            { email: user.email },
            { $set: { lastLogin: new Date() } }
          );
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
};
