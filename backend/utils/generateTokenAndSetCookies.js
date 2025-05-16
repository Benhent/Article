import jwt from "jsonwebtoken";

export const generateTokenAndSetCookies = (res, userId) => {
    // Generate a JWT token with the userId as payload, expires in 7 days
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    // Set the JWT token in the cookies with security options
    res.cookie("token", token, {
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
        secure: process.env.NODE_ENV === "production", // Sends cookie over HTTPS only in production
        sameSite: "strict", // Ensures the cookie is sent only on same-site requests
        maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time set to 7 days
    });

    return token; // Return the generated token
}
