export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        // If the user is an admin, allow the request to proceed.
        next();
    } else {
        // If the user is not an admin, return a 403 status with a message indicating that admin rights are required.
        res.status(403).json({ success: false, message: "Access denied. Admin rights required." });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Check if the user's role is in the list of authorized roles
        if (!roles.includes(req.user.role)) {
            // If the user's role is not authorized, return a 403 status with a message indicating that the role is not authorized
            return res.status(403).json({ 
                message: `Role (${req.user.role}) is not authorized to access this resource` 
            });
        }
        // If the user's role is authorized, allow the request to proceed
        next();
    };
};
