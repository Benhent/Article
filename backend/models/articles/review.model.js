import mongoose, {Schema} from 'mongoose';

const ReviewAttachmentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const ReviewSchema = new mongoose.Schema({
  articleId: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  round: {
    type: Number,
    default: 1,
    required: true
  },
  invitedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  responseDeadline: {
    type: Date,
    required: true
  },
  reviewDeadline: {
    type: Date,
    required: true
  },
  responseDate: {
    type: Date
  },
  submittedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['invited', 'accepted', 'declined', 'completed', 'expired'],
    default: 'invited'
  },
  recommendation: {
    type: String,
    enum: [
      'accept',                 // Chấp nhận bài gửi
      'minorRevision',          // Yêu cầu sửa chữa (ít)
      'majorRevision',          // Yêu cầu sửa chữa (nhiều)
      'resubmit',               // Gửi lại để đánh giá tiếp
      'rejectSuggestElsewhere', // Gửi bài cho tạp chí khác
      'reject',                 // Từ chối bài gửi
      'seeComments'             // Xem bình luận
    ]
  },
  comments: {
    forAuthor: {
      type: String
    },
    forEditor: {
      type: String
    },
    attachments: [ReviewAttachmentSchema]
  },
  reminderCount: {
    type: Number,
    default: 0
  },
  lastReminderDate: {
    type: Date
  },
  declineReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index để tối ưu truy vấn
ReviewSchema.index({ articleId: 1 });
ReviewSchema.index({ reviewerId: 1 });
ReviewSchema.index({ status: 1 });
ReviewSchema.index({ articleId: 1, round: 1 });

// Methods
ReviewSchema.methods.accept = function() {
  this.status = 'accepted';
  this.responseDate = new Date();
  return this.save();
};

ReviewSchema.methods.decline = function(reason) {
  this.status = 'declined';
  this.responseDate = new Date();
  this.declineReason = reason;
  return this.save();
};

ReviewSchema.methods.complete = function(recommendation, commentsForAuthor, commentsForEditor) {
  this.status = 'completed';
  this.submittedDate = new Date();
  this.recommendation = recommendation;
  
  if (commentsForAuthor) {
    this.comments.forAuthor = commentsForAuthor;
  }
  
  if (commentsForEditor) {
    this.comments.forEditor = commentsForEditor;
  }
  
  return this.save();
};

ReviewSchema.methods.sendReminder = function() {
  this.reminderCount += 1;
  this.lastReminderDate = new Date();
  return this.save();
};

export const Review = mongoose.model('Review', ReviewSchema);