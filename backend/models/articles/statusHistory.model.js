import mongoose, {Schema} from 'mongoose';

const StatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      'draft',
      'submitted',
      'underReview',
      'revisionRequired',
      'resubmitted',
      'accepted',
      'rejected',
      'published'
    ],
    required: true
  },
  changedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const StatusHistory = mongoose.model('StatusHistory', StatusHistorySchema);