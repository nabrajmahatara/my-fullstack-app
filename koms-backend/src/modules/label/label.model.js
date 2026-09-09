import mongoose from 'mongoose';

const labelSchema = new mongoose.Schema(
  {
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    name: { type: String, required: [true, 'label name is required'], trim: true },
    color: { type: String, required: true, default: '#61bd4f' },
  },
  { timestamps: true }
);

export default mongoose.model('Label', labelSchema);