import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
  {
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    title: { type: String, required: [true, 'list title is required'], trim: true },
    position: { type: Number, required: true, default: 0 },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

listSchema.index({ board: 1, position: 1 });

export default mongoose.model('List', listSchema);