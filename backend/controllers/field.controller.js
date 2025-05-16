import { Field } from '../models/articles/field.model.js';
import mongoose from 'mongoose';

// Get all fields with optional filtering
export const getFields = async (req, res) => {
  try {
    const { isActive, level, parent } = req.query;
    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (level) {
      query.level = parseInt(level);
    }
    if (parent) {
      query.parent = parent;
    }

    const fields = await Field.find(query)
      .populate('parent', 'name code')
      .sort({ level: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      data: fields
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching fields',
      error: error.message 
    });
  }
};

// Get a single field by ID
export const getFieldById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid field ID' 
      });
    }

    const field = await Field.findById(req.params.id)
      .populate('parent', 'name code');
    
    if (!field) {
      return res.status(404).json({ 
        success: false,
        message: 'Field not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      data: field
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching field',
      error: error.message 
    });
  }
};

// Create a new field
export const createField = async (req, res) => {
  try {
    const { name, code, parent, level } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and code are required fields' 
      });
    }

    // Check if field with same name or code exists
    const existingField = await Field.findOne({
      $or: [{ name }, { code }]
    });

    if (existingField) {
      return res.status(400).json({ 
        success: false,
        message: 'Field with this name or code already exists' 
      });
    }

    // Validate parent if provided
    if (parent) {
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid parent ID' 
        });
      }
      const parentField = await Field.findById(parent);
      if (!parentField) {
        return res.status(400).json({ 
          success: false,
          message: 'Parent field not found' 
        });
      }
    }

    const field = new Field({
      ...req.body,
      level: level || 1
    });

    await field.save();
    res.status(201).json({
      success: true,
      data: field
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error creating field',
      error: error.message 
    });
  }
};

// Update a field
export const updateField = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid field ID' 
      });
    }

    const { name, code, parent } = req.body;

    // Check if field exists
    const field = await Field.findById(req.params.id);
    if (!field) {
      return res.status(404).json({ 
        success: false,
        message: 'Field not found' 
      });
    }

    // Check for duplicate name or code
    if (name || code) {
      const existingField = await Field.findOne({
        $or: [
          { name: name || field.name },
          { code: code || field.code }
        ],
        _id: { $ne: field._id }
      });

      if (existingField) {
        return res.status(400).json({ 
          success: false,
          message: 'Field with this name or code already exists' 
        });
      }
    }

    // Validate parent if provided
    if (parent) {
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid parent ID' 
        });
      }
      const parentField = await Field.findById(parent);
      if (!parentField) {
        return res.status(400).json({ 
          success: false,
          message: 'Parent field not found' 
        });
      }
    }

    const updatedField = await Field.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedField
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error updating field',
      error: error.message 
    });
  }
};

// Delete a field
export const deleteField = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid field ID' 
      });
    }

    const field = await Field.findById(req.params.id);
    if (!field) {
      return res.status(404).json({ 
        success: false,
        message: 'Field not found' 
      });
    }

    // Check if field has children
    const hasChildren = await Field.exists({ parent: field._id });
    if (hasChildren) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete field with children. Please delete children first.' 
      });
    }

    await Field.findByIdAndDelete(req.params.id);
    res.status(200).json({ 
      success: true,
      message: 'Field deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting field',
      error: error.message 
    });
  }
};

// Get all children fields (recursive)
export const getChildrenFields = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid field ID' 
      });
    }

    const field = await Field.findById(req.params.id);
    if (!field) {
      return res.status(404).json({ 
        success: false,
        message: 'Field not found' 
      });
    }

    const includeInactive = req.query.includeInactive === 'true';
    const children = await field.getAllChildren(includeInactive);
    
    res.status(200).json({
      success: true,
      data: children
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching children fields',
      error: error.message 
    });
  }
};

// Get fields by level
export const getFieldsByLevel = async (req, res) => {
  try {
    const level = parseInt(req.params.level);
    if (isNaN(level) || level < 1) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid level parameter' 
      });
    }

    const fields = await Field.find({ level })
      .populate('parent', 'name code')
      .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      data: fields
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching fields by level',
      error: error.message 
    });
  }
};

// Get active fields
export const getActiveFields = async (req, res) => {
  try {
    const fields = await Field.find({ isActive: true })
      .populate('parent', 'name code')
      .sort({ level: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      data: fields
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching active fields',
      error: error.message 
    });
  }
};

// Toggle field status
export const toggleFieldStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid field ID' 
      });
    }

    const field = await Field.findById(req.params.id);
    if (!field) {
      return res.status(404).json({ 
        success: false,
        message: 'Field not found' 
      });
    }

    field.isActive = !field.isActive;
    await field.save();
    
    res.status(200).json({
      success: true,
      data: field
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error toggling field status',
      error: error.message 
    });
  }
};