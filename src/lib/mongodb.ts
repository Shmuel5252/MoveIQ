import { MongoClient, Db } from "mongodb";

const rawUri = process.env.MONGODB_URI;
if (!rawUri) throw new Error("MONGODB_URI is not defined in environment variables");
const uri: string = rawUri;

let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function connect(): Promise<MongoClient> {
  return new MongoClient(uri).connect();
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = connect();
}

export async function getDb(): Promise<Db> {
  try {
    const client = await clientPromise;
    return client.db();
  } catch (err) {
    // Don't let a single failed connection attempt poison the cached
    // singleton forever — clear it so the next call retries fresh.
    if (process.env.NODE_ENV === "development") {
      global._mongoClientPromise = undefined;
    }
    clientPromise = connect();
    throw err;
  }
}

// Ensures TTL and unique indexes exist. Safe to call on every request — MongoDB
// is a no-op when the index already exists.
let indexesEnsured = false;
export async function ensureIndexes(): Promise<void> {
  if (indexesEnsured) return;
  const db = await getDb();
  await Promise.all([
    db.collection("analysisCache").createIndex({ symbol: 1 }, { unique: true }),
    db.collection("analysisCache").createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 3600 } // 1 hour — move analysis goes stale fast
    ),
    db.collection("companyProfileCache").createIndex({ symbol: 1 }, { unique: true }),
    db.collection("companyProfileCache").createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 604800 } // 7 days — company profiles rarely change
    ),
    db.collection("sectorAnalysisCache").createIndex({ sectorId: 1 }, { unique: true }),
    db.collection("sectorAnalysisCache").createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 7200 } // 2 hours — sector-level state moves slower than a single stock
    ),
  ]);
  indexesEnsured = true;
}
