import mongoose from 'mongoose';

/**
 * One shared MongoDB connection per server instance. On Vercel every function instance reuses it,
 * and in development it survives hot reloads (kept on globalThis).
 *   MONGODB_URI  Atlas connection string (mongodb+srv://…)
 *   MONGODB_DB   database name, default "spotex"
 */

declare global {
  var _spotexDb: Promise<typeof mongoose> | undefined;
}

/** True when a database is configured; without one the site uses its built-in catalogue. */
export const dbConfigured = () => Boolean(process.env.MONGODB_URI);

export function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');
  globalThis._spotexDb ??= mongoose
    .connect(uri, {
      dbName: process.env.MONGODB_DB || 'spotex',
      serverSelectionTimeoutMS: 8000,
      maxPoolSize: 5,
    })
    .catch((err) => {
      globalThis._spotexDb = undefined; // try again on the next request
      throw err;
    });
  return globalThis._spotexDb;
}
