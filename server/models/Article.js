import mongoose from 'mongoose';

export const ARTICLE_CATEGORIES = [
  'Cybersecurity',
  'Data Breaches',
  'Ethical Hacking',
  'Vulnerabilities & CVEs',
  'Artificial Intelligence',
  'Malware & Ransomware',
  'Cloud & Network Security',
  'Privacy & Policy',
  'Technology News',
];

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      maxlength: 220,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: [true, 'Article content is required'],
    },
    category: {
      type: String,
      required: true,
      enum: ARTICLE_CATEGORIES,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    cveId: {
      type: String,
      trim: true,
      default: '',
    },
    severity: {
      type: String,
      enum: ['', 'Critical', 'High', 'Medium', 'Low'],
      default: '',
    },
    featuredImage: {
      type: String,
      default: '',
    },
    featuredImageCaption: {
      type: String,
      default: '',
      trim: true,
    },
    author: {
      name: {
        type: String,
        default: 'Elena Vance',
        trim: true,
      },
      role: {
        type: String,
        default: 'Senior Security Correspondent',
        trim: true,
      },
      bio: {
        type: String,
        default: 'Covers zero-day research, nation-state threat actors, and critical infrastructure defense.',
        trim: true,
      },
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isBreaking: {
      type: Boolean,
      default: false,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    readingTime: {
      type: Number,
      default: 4,
      min: 1,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    seo: {
      metaTitle: { type: String, trim: true, default: '' },
      metaDescription: { type: String, trim: true, default: '' },
    },
  },
  { timestamps: true }
);

articleSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  category: 'text',
  cveId: 'text',
});

export default mongoose.model('Article', articleSchema);
