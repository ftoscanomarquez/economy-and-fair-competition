import { MongoClient, type Db } from "mongodb";
import { getEnv } from "./env";
import { childLogger } from "./logger";

const log = childLogger("db");

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const env = getEnv();
  const client = new MongoClient(env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  });

  return client.connect().then((connected) => {
    log.info("Conexión a MongoDB establecida");
    return connected;
  });
}

function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!global.__mongoClientPromise) {
      global.__mongoClientPromise = createClientPromise();
    }
    return global.__mongoClientPromise;
  }

  if (!cachedProdClientPromise) {
    cachedProdClientPromise = createClientPromise();
  }
  return cachedProdClientPromise;
}

let cachedProdClientPromise: Promise<MongoClient> | undefined;

export async function getDb(): Promise<Db> {
  const env = getEnv();
  const client = await getClientPromise();
  return client.db(env.MONGODB_DB);
}

export async function getMongoClient(): Promise<MongoClient> {
  return getClientPromise();
}
