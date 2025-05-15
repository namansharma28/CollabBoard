import NextAuth, { AuthOptions } from "next-auth";
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
      // Only try to enhance the session if the user is logged in
      if (session?.user?.email) {
        try {
          const { db } = await connectToDatabase();
          const user = await db.collection("users").findOne({ email: session.user.email });
          
          if (user) {
            // Update session with database user data
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
        
        // Check if user exists
        const existingUser = await db.collection("users").findOne({ email: user.email });
        
        // If user doesn't exist, create new user
        if (!existingUser) {
          await db.collection("users").insertOne({
            email: user.email,
            name: user.name,
            image: user.image,
            createdAt: new Date(),
          });
        } else {
          // Update login timestamp
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
    // Simple redirect to handle Google OAuth callback
    async redirect({ url, baseUrl }) {
      // If the url starts with the base url, allow it
      if (url.startsWith(baseUrl)) return url;
      // Otherwise, redirect to base url
      return baseUrl;
    }
  },
  // Use JWT strategy
  session: {
    strategy: "jwt",
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };