import {StatusHistory} from '../models/articles/statusHistory.model.js';
import {User} from '../models/user.model.js';

export const createStatusHistory = async (req, res) => {
  try {
    const { status, changedBy, reason } = req.body;

    // Check if user exists
    const user = await User.findById(changedBy);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create new status history entry
    const statusHistory = new StatusHistory({
      status,
      changedBy,
      reason
    });

    await statusHistory.save();

    res.status(201).json({
      success: true,
      message: 'Status history created successfully',
      data: statusHistory
    });
  } catch (error) {
    console.error("Error in createStatusHistory:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating status history"
    });
  }
};

export const getAllStatusHistory = async (req, res) => {
  try {
    const { status, changedBy } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (changedBy) filter.changedBy = changedBy;

    const statusHistoryEntries = await StatusHistory.find(filter)
      .populate('changedBy', 'name email')
      .sort('-timestamp');

    res.status(200).json({
      success: true,
      count: statusHistoryEntries.length,
      data: statusHistoryEntries
    });
  } catch (error) {
    console.error("Error in getAllStatusHistory:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching status history"
    });
  }
};

export const getStatusHistory = async (req, res) => {
  try {
    const statusHistory = await StatusHistory.findById(req.params.id)
      .populate('changedBy', 'name email');

    if (!statusHistory) {
      return res.status(404).json({
        success: false,
        message: 'Status history entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status history fetched successfully',
      data: statusHistory
    });
  } catch (error) {
    console.error("Error in getStatusHistory:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching status history"
    });
  }
};

export const updateStatusHistory = async (req, res) => {
  try {
    const { changedBy } = req.body;
    
    // If changedBy is being updated, check if user exists
    if (changedBy) {
      const user = await User.findById(changedBy);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    }

    const statusHistory = await StatusHistory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!statusHistory) {
      return res.status(404).json({
        success: false,
        message: 'Status history entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status history updated successfully',
      data: statusHistory
    });
  } catch (error) {
    console.error("Error in updateStatusHistory:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating status history"
    });
  }
};

export const deleteStatusHistory = async (req, res, next) => {
  try {
    const statusHistory = await StatusHistory.findById(req.params.id);

    if (!statusHistory) {
      return res.status(404).json({
        success: false,
        message: 'Status history entry not found'
      });
    }

    await statusHistory.remove();

    res.status(200).json({
      success: true,
      message: 'Status history deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error("Error in deleteStatusHistory:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting status history"
    });
  }
};

export const getStatusHistoryByArticle = async (req, res, next) => {
  try {
    // This function assumes there's a relationship between articles and status history
    // You may need to adjust this based on your actual data model
    const statusHistoryEntries = await StatusHistory.find({ articleId: req.params.articleId })
      .populate('changedBy', 'name email')
      .sort('-timestamp');

    res.status(200).json({
      success: true,
      message: 'Status history fetched successfully',
      count: statusHistoryEntries.length,
      data: statusHistoryEntries
    });
  } catch (error) {
    console.error("Error in getStatusHistoryByArticle:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching status history by article"
    });
  }
}; 