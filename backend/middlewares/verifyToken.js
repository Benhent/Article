import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyToken = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.token;
        if (!token) {
            // Respond with 401 if no token is found
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }

        // Verify token using JWT secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userId) {
            // Respond with 401 if token does not contain userId
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        // Find user by decoded userId and exclude password
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            // Respond with 401 if no user is found
            return res.status(401).json({ success: false, message: "User not found" });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error("Error in verifyToken: ", error);
        if (error instanceof jwt.JsonWebTokenError) {
            // Handle JWT errors specifically
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        // Respond with 500 for other errors
        return res.status(500).json({ success: false, message: "Server error" });
    }
};