import mongoose from "mongoose";

const memoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  memoType: {
    type: Number,
    required: true,
    enum: [1, 2], 
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: function () {
      return this.memoType === 1; 
    },
  },
  images: {
    type: [String],
    validate: {
      validator: function(images) {
        return !images || (Array.isArray(images) && images.every(img => typeof img === 'string'));
      },
      message: 'Images must be an array of strings if provided.',
    },
  },
  audio: {
    type: String,
    required: function () {
      return this.memoType === 2;
    },
  },
  additionalNotes: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Text Memo', 'Voice Memo', 'favorites', 'notes', 'recycle bin', 'deleted'],
    default: function () {
      return this.memoType === 1 ? 'Text Memo' : this.memoType === 2 ? 'Voice Memo' : 'favorites';
    },
  },
});


export default mongoose.model('Memo', memoSchema);