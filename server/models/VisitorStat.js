import mongoose from 'mongoose';

const visitorStatSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    visits: {
      type: Number,
      default: 0,
      min: 0,
    },
    articleViews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('VisitorStat', visitorStatSchema);
