import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

// GET /api/teams/[teamId] - Get team data
export async function GET(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate teamId
    if (!ObjectId.isValid(params.teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Find team and ensure user is a member
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(params.teamId),
      "members.email": session.user.email
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found or you're not a member" }, { status: 404 });
    }

    return NextResponse.json(team);

  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Failed to fetch team data" },
      { status: 500 }
    );
  }
}

// PATCH /api/teams/[teamId] - Update team settings
export async function PATCH(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  console.log('PATCH request received for teamId:', params.teamId);
  
  try {
    console.log('Checking authentication...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('Unauthorized: No session or email');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log('Authenticated user:', session.user.email);

    // Validate teamId
    console.log('Validating teamId...');
    if (!ObjectId.isValid(params.teamId)) {
      console.log('Invalid team ID:', params.teamId);
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }
    console.log('TeamId is valid');

    console.log('Connecting to database...');
    let db;
    try {
      const dbConnection = await connectToDatabase();
      db = dbConnection.db;
      console.log('Connected to database');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ 
        error: "Database connection failed", 
        details: dbError instanceof Error ? dbError.message : String(dbError) 
      }, { status: 500 });
    }
    
    // Find team and check if user is an admin
    console.log('Finding team and checking admin status...');
    let team;
    try {
      team = await db.collection("teams").findOne({
        _id: new ObjectId(params.teamId),
        "members": { 
          $elemMatch: { 
            email: session.user.email,
            role: "admin"
          } 
        }
      });
      
      console.log('Team search result:', team ? 'found' : 'not found');
      
      if (!team) {
        return NextResponse.json({ 
          error: "Team not found or you don't have admin privileges",
          details: {
            teamId: params.teamId,
            userEmail: session.user.email
          }
        }, { status: 403 });
      }
    } catch (findError) {
      console.error('Error finding team:', findError);
      return NextResponse.json({ 
        error: "Error finding team", 
        details: findError instanceof Error ? findError.message : String(findError) 
      }, { status: 500 });
    }

    // Parse request body
    console.log('Parsing request body...');
    let requestData;
    try {
      const bodyText = await request.text();
      console.log('Raw request body:', bodyText);
      requestData = JSON.parse(bodyText);
      console.log('Parsed request body:', requestData);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ 
        error: "Invalid request body", 
        details: parseError instanceof Error ? parseError.message : String(parseError) 
      }, { status: 400 });
    }
    
    // Validate request data
    console.log('Validating request data...');
    if (requestData.name && typeof requestData.name !== 'string') {
      console.log('Invalid team name:', requestData.name);
      return NextResponse.json({ error: "Invalid team name" }, { status: 400 });
    }
    
    // Prepare update object
    console.log('Preparing update object...');
    const updateData: any = {};
    
    // Update basic team info
    if (requestData.name) updateData.name = requestData.name;
    if (requestData.description !== undefined) updateData.description = requestData.description;
    
    // Update settings
    if (requestData.settings) {
      console.log('Updating settings...');
      // Fetch current settings first to avoid overwriting existing settings
      const currentSettings = team.settings || {};
      console.log('Current settings:', currentSettings);
      
      updateData.settings = {
        ...currentSettings,
        // Update only the notifications setting
        ...(requestData.settings.notifications !== undefined ? { notifications: !!requestData.settings.notifications } : {}),
      };
    }

    console.log('Final update data:', JSON.stringify(updateData, null, 2));

    // Update team in database
    console.log('Updating team in database...');
    let result;
    try {
      result = await db.collection("teams").updateOne(
        { _id: new ObjectId(params.teamId) },
        { $set: updateData }
      );
      
      console.log('Update result:', {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount
      });
      
      if (result.matchedCount === 0) {
        console.log('Team not found for update');
        return NextResponse.json({ 
          error: "Team not found for update",
          details: {
            teamId: params.teamId
          }
        }, { status: 404 });
      }
      
      if (result.modifiedCount === 0) {
        console.log('No changes were made to the team');
        // Return the current team data with a success status
        // instead of returning a 304 status which causes client issues
        return NextResponse.json({ 
          message: "No changes were needed",
          team
        }, { status: 200 });
      }
    } catch (updateError) {
      console.error('Error updating team:', updateError);
      return NextResponse.json({ 
        error: "Error updating team", 
        details: updateError instanceof Error ? updateError.message : String(updateError) 
      }, { status: 500 });
    }

    // Fetch updated team data
    console.log('Fetching updated team data...');
    let updatedTeam;
    try {
      updatedTeam = await db.collection("teams").findOne({
        _id: new ObjectId(params.teamId)
      });
      
      console.log('Updated team found:', !!updatedTeam);
      
      if (!updatedTeam) {
        return NextResponse.json({ 
          error: "Failed to fetch updated team data",
          details: {
            teamId: params.teamId
          }
        }, { status: 500 });
      }
    } catch (fetchError) {
      console.error('Error fetching updated team:', fetchError);
      return NextResponse.json({ 
        error: "Error fetching updated team", 
        details: fetchError instanceof Error ? fetchError.message : String(fetchError) 
      }, { status: 500 });
    }

    console.log('Successfully updated team, returning response');
    return NextResponse.json(updatedTeam);

  } catch (error) {
    console.error("Unhandled error updating team:", error);
    return NextResponse.json(
      { 
        error: "Failed to update team settings",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[teamId] - Delete a team
export async function DELETE(
  request: Request,
  { params }: { params: { teamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate teamId
    if (!ObjectId.isValid(params.teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Find team and check if user is the creator
    const team = await db.collection("teams").findOne({
      _id: new ObjectId(params.teamId),
      "creator.email": session.user.email
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found or you're not the creator" }, { status: 403 });
    }

    // Delete all boards belonging to this team
    await db.collection("boards").deleteMany({
      teamId: params.teamId
    });
    
    // Delete all tasks belonging to this team
    await db.collection("tasks").deleteMany({
      teamId: params.teamId
    });
    
    // Delete all notes belonging to this team
    await db.collection("notes").deleteMany({
      teamId: params.teamId
    });
    
    // Delete the team
    const result = await db.collection("teams").deleteOne({
      _id: new ObjectId(params.teamId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
    }

    return NextResponse.json({ message: "Team and all associated data deleted successfully" });

  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 }
    );
  }
} 