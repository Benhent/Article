import { User } from "../models/user.model.js";


export const getProfileById = async (req, res) => {
    try {
      // Find user by ID
      const user = await User.findById(req.user._id).select("-password");
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
  
      res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          link: user.link,
          national: user.national,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Error in getProfile:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching profile"
      });
    }
};

export const updateProfile = async (req, res) => {
    try {
      const { name, username, avatarUrl, link, national } = req.body;
      const userId = req.user._id;
  
      // Find user
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
  
      // Check if username is being changed and if it's already taken
      if (username && username !== user.username) {
        const existingUser = await User.findOne({ username });
        
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Username already taken"
          });
        }
      }
  
      // Update user fields
      if (name) user.name = name;
      if (username) user.username = username;
      if (avatarUrl) user.avatarUrl = avatarUrl; // URL from Cloudinary uploaded by frontend
      if (link) user.link = link;
      if (national) user.national = national;
  
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl,
          link: user.link,
          national: user.national,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Error in updateProfile:", error);
      res.status(500).json({
        success: false,
        message: "Server error while updating profile"
      });
    }
};