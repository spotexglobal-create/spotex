import { Schema, model, models, type InferSchemaType, type Model } from 'mongoose';
import { CATEGORY_SLUGS, PRODUCT_TYPES, SPEC_LABELS } from '../catalog/types';

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

export const INQUIRY_STATUSES = ['new', 'replied', 'sample', 'won', 'lost'] as const;
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

export type ProductDoc = InferSchemaType<typeof ProductSchema>;
export type InquiryDoc = InferSchemaType<typeof InquirySchema>;
export type PostDoc = InferSchemaType<typeof PostSchema>;
export const PostModel = (models.Post as Model<PostDoc>) ?? model('Post', PostSchema);

export const ProductModel = (models.Product as Model<ProductDoc>) ?? model('Product', ProductSchema);
export const InquiryModel = (models.Inquiry as Model<InquiryDoc>) ?? model('Inquiry', InquirySchema);
