/**
 * Copies the built-in catalogue (src/data/products.ts) into MongoDB.
 *   npm run db:seed            adds products that are missing, leaves existing ones untouched
 *   npm run db:seed -- --force  also overwrites existing products with the built-in data
 * Reads MONGODB_URI (and MONGODB_DB) from .env.local or the environment.
 */
import { existsSync } from 'node:fs';
import mongoose from 'mongoose';
import { PRODUCTS } from '../src/data/products';
import { POSTS } from '../src/data/posts';
import { PostModel, ProductModel } from '../src/lib/db/models';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is not set. Add it to .env.local first.');
  process.exit(1);
}
const force = process.argv.includes('--force');

async function main() {
  await mongoose.connect(uri as string, {
    dbName: process.env.MONGODB_DB || 'spotex',
    serverSelectionTimeoutMS: 10000,
  });
  await ProductModel.syncIndexes();

  const ops = PRODUCTS.map((p, order) => {
    const doc = {
      ...p,
      order,
      featured: Boolean(p.featured),
      visible: p.visible !== false,
    };
    const now = new Date();
    return {
      updateOne: {
        filter: { slug: p.slug },
        // without --force, existing products (and their updatedAt) are left exactly as they are
        update: force ? { $set: doc } : { $setOnInsert: { ...doc, createdAt: now, updatedAt: now } },
        upsert: true,
        timestamps: force,
      },
    };
  });
  // mongoose casts the plain specs arrays into sub-documents at runtime
  const res = await ProductModel.bulkWrite(ops as unknown as Parameters<typeof ProductModel.bulkWrite>[0]);
  const total = await ProductModel.countDocuments();

  console.log(`Added ${res.upsertedCount}, updated ${res.modifiedCount}. Products in database: ${total}.`);

  // blog articles: same rule, existing ones are left alone unless --force
  await PostModel.syncIndexes();
  const postOps = POSTS.map((p) => {
    const doc = { ...p, published: p.published !== false };
    const now = new Date();
    return {
      updateOne: {
        filter: { slug: p.slug },
        update: force ? { $set: doc } : { $setOnInsert: { ...doc, createdAt: now, updatedAt: now } },
        upsert: true,
        timestamps: force,
      },
    };
  });
  const postRes = await PostModel.bulkWrite(postOps as unknown as Parameters<typeof PostModel.bulkWrite>[0]);
  console.log(`Blog: added ${postRes.upsertedCount}, updated ${postRes.modifiedCount}. Articles in database: ${await PostModel.countDocuments()}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
