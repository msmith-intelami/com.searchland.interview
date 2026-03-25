import "dotenv/config";
import { Client } from "@elastic/elasticsearch";

let client: Client | null | undefined;

export function getElasticsearchClient() {
  if (client !== undefined) {
    return client;
  }

  const node = process.env.ELASTICSEARCH_URL;

  if (!node) {
    client = null;
    return client;
  }

  client = new Client({
    node,
    auth: process.env.ELASTICSEARCH_API_KEY
      ? {
          apiKey: process.env.ELASTICSEARCH_API_KEY,
        }
      : undefined,
  });

  return client;
}
