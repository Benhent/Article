import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from 'express-session';
import { createServer } from 'http';
import { initSocket } from './config/socket.js';
import { connectDB } from "./db/connectDB.js";

import authRoutes from "./routes/auth.route.js"
import profileRoutes from "./routes/profile.route.js";

import articleRoutes from "./routes/articlesRoutes/article.routes.js";
import articleAuthorRoutes from "./routes/articlesRoutes/articleAuthor.routes.js";
import articleFileRoutes from "./routes/articlesRoutes/articleFile.routes.js";
import reviewRoutes from "./routes/articlesRoutes/review.routes.js";
import statusHistoryRoutes from "./routes/articlesRoutes/statusHistory.routes.js";
import fieldRoutes from "./routes/articlesRoutes/field.route.js";
import issueRoutes from "./routes/articlesRoutes/issue.routes.js";
import discussionRoutes from "./routes/articlesRoutes/discussion.routes.js";
import contactRoutes from "./routes/contact.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const httpServer = createServer(app);

initSocket(httpServer);

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV,
        maxAge: 24 * 60 * 60 * 1000
    }
})); 

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/profile", profileRoutes)

app.use("/api/articles", articleRoutes)
app.use("/api/article-authors", articleAuthorRoutes)
app.use("/api/files", articleFileRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/status-history", statusHistoryRoutes)
app.use("/api/fields", fieldRoutes)
app.use("/api/issues", issueRoutes)
app.use("/api/discussions", discussionRoutes)
app.use("/api/contacts", contactRoutes)

httpServer.listen(PORT, () => {
    connectDB();
    console.log("Server is running on port: ", PORT);
})