import mongoose, {Schema} from 'mongoose';

const DiscussionAttachmentSchema = new mongoose.Schema({
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
  }
});

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [DiscussionAttachmentSchema],
  sentAt: {
    type: Date,
    default: Date.now
  },
  readBy: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const DiscussionSchema = new mongoose.Schema({
  articleId: {
    type: Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  initiatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  round: {
    type: Number
  },
  messages: [MessageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  type: {
    type: String,
    enum: ['general', 'review', 'revision', 'editorial'],
    default: 'general'
  }
}, {
  timestamps: true
});

// Index để tối ưu truy vấn
DiscussionSchema.index({ articleId: 1 });
DiscussionSchema.index({ initiatorId: 1 });
DiscussionSchema.index({ participants: 1 });
DiscussionSchema.index({ articleId: 1, round: 1 });

// Methods
DiscussionSchema.methods.addMessage = function(senderId, content, attachments = []) {
  const message = {
    senderId,
    content,
    attachments,
    sentAt: new Date(),
    readBy: [{ userId: senderId, readAt: new Date() }]
  };
  
  this.messages.push(message);
  return this.save();
};

DiscussionSchema.methods.markAsRead = function(userId) {
  const unreadMessages = this.messages.filter(message => {
    return !message.readBy.some(reader => reader.userId.equals(userId));
  });
  
  unreadMessages.forEach(message => {
    message.readBy.push({ userId, readAt: new Date() });
  });
  
  return this.save();
};

export const Discussion = mongoose.model('Discussion', DiscussionSchema);