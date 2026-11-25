import mongoose, { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { CATEGORY_SLUGS, PRODUCT_TYPES, SPEC_LABELS } from '../catalog/types';

/**
 * Registers a model once per server. In development the file reloads on every edit while mongoose
 * keeps the old model, which silently drops new fields; so there the old one is replaced.
 */
function define<T>(name: string, schema: Schema): Model<T> {
  if (models[name] && process.env.NODE_ENV !== 'production') mongoose.deleteModel(name);
  return (models[name] as Model<T>) ?? (model(name, schema) as unknown as Model<T>);
}

/**
 * MongoDB collections. Product records keep the same language-independent shape as
 * src/lib/catalog/types.ts (words are message keys), so one record serves every language.
 */

const SpecSchema = new Schema(
  {
    label: { type: String, enum: SPEC_LABELS, required: true },
    value: String,
    amount: Number,
    unit: { type: String, enum: ['gsm', 'oz', 'cm'] },
  },
  { _id: false },
);

const ProductSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    code: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: CATEGORY_SLUGS,
      index: true,
    },
    type: { type: String, required: true, enum: PRODUCT_TYPES },
    line: { type: String, trim: true },
    specs: { type: [SpecSchema], default: [] },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    visible: { type: Boolean, default: true },
    /** Position in lists; lower comes first. */
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

/** One text per website language; an empty one falls back to src/messages/<locale>.json. */
const LocalizedSchema = new Schema({ en: String, de: String, no: String, it: String, fr: String }, { _id: false });

/**
 * Category details edited in admin → Categories. The ten slugs (URLs) stay fixed in
 * src/lib/catalog/types.ts; everything a visitor reads or sees is stored here.
 */
const CategorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, enum: CATEGORY_SLUGS },
    name: { type: LocalizedSchema, default: () => ({}) },
    intro: { type: LocalizedSchema, default: () => ({}) },
    /** Cloudinary photo for the category card; empty uses the first featured product photo. */
    cover: { type: String, default: '' },
    /** False hides the category and its products from the website. */
    visible: { type: Boolean, default: true },
    /** Position in menus and lists; lower comes first. */
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const INQUIRY_STATUSES =['new', 'replied', 'sample', 'won', 'lost'] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

const InquirySchema = new Schema(
  {
    kind: { type: String, enum: ['quote', 'message'], required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: String,
    phone: String,
    country: String,
    /** Category slugs or product codes the visitor picked. */
    products: { type: [String], default: [] },
    product: String,
    quantity: String,
    sample: Boolean,
    branding: String,
    message: String,
    locale: String,
    status: {
      type: String,
      enum: INQUIRY_STATUSES,
      default: 'new',
      index: true,
    },
    /** Internal note for the sales team. */
    note: String,
    emailed: { type: Boolean, default: false },
  },
  { timestamps: true },
);
InquirySchema.index({ createdAt: -1 });

export const POST_TOPICS = ['guides', 'private-label', 'factory'] as const;

const PostSectionSchema = new Schema(
  {
    heading: String,
    paragraphs: { type: [String], default: [] },
    points: { type: [String], default: undefined },
  },
  { _id: false },
);

const PostSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    /** ISO date (yyyy-mm-dd) shown on the article; newest first. */
    date: { type: String, required: true, index: true },
    topic: { type: String, enum: POST_TOPICS, required: true },
    minutes: { type: Number, default: 3 },
    cover: { type: String, required: true },
    sections: { type: [PostSectionSchema], default: [] },
    /** False keeps it as a draft (admin only). */
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/** Company details edited in admin → Settings. One record (key "site"); empty fields fall back to src/config/site.ts. */
const SettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'site' },
    email: String,
    phone: String,
    whatsapp: String,
    street: String,
    city: String,
    postalCode: String,
    country: String,
    foundedYear: Number,
    staff: Number,
    clients: Number,
    /** Full profile URLs; empty ones are not shown. */
    social: { facebook: String, instagram: String, linkedin: String, youtube: String, tiktok: String },
  },
  { timestamps: true },
);

export type SettingsDoc = InferSchemaType<typeof SettingsSchema>;
export const SettingsModel = define<SettingsDoc>('Settings', SettingsSchema);

export type ProductDoc = InferSchemaType<typeof ProductSchema>;
export type InquiryDoc = InferSchemaType<typeof InquirySchema>;
export type PostDoc = InferSchemaType<typeof PostSchema>;
export const PostModel = define<PostDoc>('Post', PostSchema);

export const ProductModel = define<ProductDoc>('Product', ProductSchema);
export type CategoryDoc = InferSchemaType<typeof CategorySchema>;
export const CategoryModel = define<CategoryDoc>('Category', CategorySchema);
export const InquiryModel = define<InquiryDoc>('Inquiry', InquirySchema);
