import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('Missing MONGODB_URI environment variable');
      throw new Error('Missing MONGODB_URI environment variable');
    }
    
    if (!process.env.MONGODB_DB) {
      console.error('Missing MONGODB_DB environment variable');
      throw new Error('Missing MONGODB_DB environment variable');
    }
    
    console.log('Attempting to connect to MongoDB...');
    const client = await clientPromise;
    console.log('MongoDB connection successful');
    
    const db = client.db(process.env.MONGODB_DB);
    return { db, client };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error(`Database connection failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export default clientPromise;