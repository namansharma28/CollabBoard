import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple possible .env file locations
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Log the MONGODB_URI to debug
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const MONGODB_URI = process.env.MONGODB_URI;

async function createDummyData() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in .env file");
    return;
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();
  const teamId = "681e782a358e01d6e33f9654"; // Your team ID

  try {
    // Create dummy dashboard data
    await db.collection("dashboard").insertOne({
      teamId,
      stats: {
        totalTasks: 15,
        completedTasks: 8,
        pendingTasks: 7
      },
      recentActivity: [
        { type: "task", action: "completed", user: "John", timestamp: new Date() },
        { type: "note", action: "created", user: "Alice", timestamp: new Date() }
      ]
    });

    // Create dummy chat messages
    await db.collection("messages").insertMany([
      {
        teamId,
        sender: "John",
        content: "Hello team! How's the project going?",
        timestamp: new Date()
      },
      {
        teamId,
        sender: "Alice",
        content: "Going great! Just finished the dashboard",
        timestamp: new Date()
      }
    ]);

    // Create dummy boards
    await db.collection("boards").insertMany([
      {
        teamId,
        title: "Project Planning",
        tasks: [
          { id: 1, title: "Setup project", status: "completed" },
          { id: 2, title: "Design UI", status: "in-progress" }
        ]
      },
      {
        teamId,
        title: "Development",
        tasks: [
          { id: 3, title: "Implement auth", status: "completed" },
          { id: 4, title: "Add API routes", status: "pending" }
        ]
      }
    ]);

    // Create dummy notes
    await db.collection("notes").insertMany([
      {
        teamId,
        title: "Meeting Notes",
        content: "Discussed project timeline and milestones",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        teamId,
        title: "Ideas",
        content: "Potential features for next sprint",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log("Dummy data created successfully!");
  } catch (error) {
    console.error("Error creating dummy data:", error);
  } finally {
    await client.close();
  }
}

createDummyData().catch(console.error);