import { Discussion } from '../models/articles/discussion.model.js';
import { Article } from '../models/articles/article.model.js';
import { User } from '../models/user.model.js';

// Create a new discussion
const createDiscussion = async (req, res) => {
  try {
    const { articleId, subject, type = 'general' } = req.body;
    const initiatorId = req.user._id;

    // Check if article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

    // Create discussion
    const discussion = await Discussion.create({
      articleId,
      subject,
      initiatorId,
      participants: [initiatorId],
      type,
      round: 1
    });

    return res.status(201).json({
      success: true,
      message: "Discussion created successfully",
      data: discussion
    });
  } catch (error) {
    console.log("Error in createDiscussion:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating discussion"
    });
  }
};

// Get all discussions for an article
const getArticleDiscussions = async (req, res) => {
  try {
    const { articleId } = req.params;

    const discussions = await Discussion.find({ articleId })
      .populate('initiatorId', 'username email')
      .populate('participants', 'username email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Discussions retrieved successfully",
      data: discussions
    });
  } catch (error) {
    console.log("Error in getArticleDiscussions:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving discussions"
    });
  }
};

// Get a single discussion by ID
const getDiscussionById = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussion = await Discussion.findById(discussionId)
      .populate('initiatorId', 'username email')
      .populate('participants', 'username email')
      .populate('messages.senderId', 'username email')
      .populate('messages.readBy.userId', 'username email');

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Discussion retrieved successfully",
      data: discussion
    });
  } catch (error) {
    console.log("Error in getDiscussionById:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error retrieving discussion"
    });
  }
};

// Add a message to discussion
const addMessage = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content, attachments = [] } = req.body;
    const senderId = req.user._id;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }

    // Check if user is a participant
    if (!discussion.participants.includes(senderId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a participant in this discussion"
      });
    }

    await discussion.addMessage(senderId, content, attachments);

    return res.status(200).json({
      success: true,
      message: "Message added successfully",
      data: discussion
    });
  } catch (error) {
    console.log("Error in addMessage:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error adding message"
    });
  }
};

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const userId = req.user._id;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }

    await discussion.markAsRead(userId);

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
      data: discussion
    });
  } catch (error) {
    console.log("Error in markMessagesAsRead:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error marking messages as read"
    });
  }
};

// Add participant to discussion
const addParticipant = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { userId } = req.body;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user is already a participant
    if (discussion.participants.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is already a participant"
      });
    }

    discussion.participants.push(userId);
    await discussion.save();

    return res.status(200).json({
      success: true,
      message: "Participant added successfully",
      data: discussion
    });
  } catch (error) {
    console.log("Error in addParticipant:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error adding participant"
    });
  }
};

// Remove participant from discussion
const removeParticipant = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { userId } = req.body;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }

    // Cannot remove initiator
    if (discussion.initiatorId.equals(userId)) {
      return res.status(400).json({
        success: false,
        message: "Cannot remove discussion initiator"
      });
    }

    discussion.participants = discussion.participants.filter(
      participant => !participant.equals(userId)
    );
    await discussion.save();

    return res.status(200).json({
      success: true,
      message: "Participant removed successfully",
      data: discussion
    });
  } catch (error) {
    console.log("Error in removeParticipant:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error removing participant"
    });
  }
};

// Update discussion
const updateDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { subject, type, isActive } = req.body;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }

    // Only initiator can update
    if (!discussion.initiatorId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Only discussion initiator can update"
      });
    }

    if (subject) discussion.subject = subject;
    if (type) discussion.type = type;
    if (typeof isActive === 'boolean') discussion.isActive = isActive;

    await discussion.save();

    return res.status(200).json({
      success: true,
      message: "Discussion updated successfully",
      data: discussion
    });
  } catch (error) {
    console.log("Error in updateDiscussion:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating discussion"
    });
  }
};

// Delete discussion
const deleteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found"
      });
    }

    // Only initiator can delete
    if (!discussion.initiatorId.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Only discussion initiator can delete"
      });
    }

    await discussion.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Discussion deleted successfully",
      data: discussion
    });
  } catch (error) {
    console.log("Error in deleteDiscussion:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error deleting discussion"
    });
  }
};

export {
  createDiscussion,
  getArticleDiscussions,
  getDiscussionById,
  addMessage,
  markMessagesAsRead,
  addParticipant,
  removeParticipant,
  updateDiscussion,
  deleteDiscussion
}; 