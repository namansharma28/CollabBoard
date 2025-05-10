import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { verifyJwt } from '@/lib/jwt';

export async function GET(request: Request) {
  try {
    // Get token from Authorization header
    const token = request.headers.get("Authorization")?.split(" ")[1];
    let userEmail;

    // Try to get user from NextAuth session
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      userEmail = session.user.email;
    }
    // If no session, try to get user from JWT
    else if (token) {
      const decoded = verifyJwt(token);
      userEmail = decoded.email;
    }

    if (!userEmail) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Find all teams where user is a member
    const teams = await db.collection("teams")
      .find({
        "members.email": userEmail
      })
      .toArray();

    // Get all unique member emails from all teams
    const memberEmails = teams.reduce((emails: string[], team) => {
      team.members.forEach(member => {
        if (!emails.includes(member.email)) {
          emails.push(member.email);
        }
      });
      return emails;
    }, []);

    // Fetch user details for all members
    const users = await db.collection("users")
      .find({ email: { $in: memberEmails } })
      .project({ email: 1, name: 1, image: 1 })
      .toArray();

    // Create a map of email to user details
    const userMap = users.reduce((map: any, user) => {
      map[user.email] = user;
      return map;
    }, {});

    // Add user details to team members
    const teamsWithUserDetails = teams.map(team => ({
      ...team,
      members: team.members.map(member => ({
        ...member,
        name: userMap[member.email]?.name,
        image: userMap[member.email]?.image
      }))
    }));

    return NextResponse.json({ teams: teamsWithUserDetails });
    
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}