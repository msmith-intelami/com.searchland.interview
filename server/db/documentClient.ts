import "dotenv/config";
import { MongoClient } from "mongodb";
import { isAuditSystemEnabled } from "../utils/debug.js";

let clientPromise: Promise<MongoClient | null> | null = null;

export async function getDocumentClient() {
  if (!isAuditSystemEnabled()) {
    return null;
  }

  const url = process.env.MONGODB_URL;

  if (!url) {
    return null;
  }

  if (!clientPromise) {
    clientPromise = MongoClient.connect(url).catch((error: unknown) => {
      console.error("MongoDB connection failed", error);
      clientPromise = null;
      return null;
    });
  }

  return clientPromise;
}

export async function getDocumentCollection<TDocument extends object>(collectionName: string) {
  const client = await getDocumentClient();

  if (!client) {
    return null;
  }

  const databaseName = process.env.MONGODB_DB_NAME ?? "searchland";
  return client.db(databaseName).collection<TDocument>(collectionName);
}
