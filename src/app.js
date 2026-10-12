import express from "express";       // * Imports Express to build the backend
import cors from "cors";             // Imports CORS middleware
import cookieParser from "cookie-parser"; // Parses cookies from incoming requests

const app = express(); // Creates an Express application instance

// Configure CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN, // origin from environment variables
    credentials: true                // Allows credentialed CORS requests (e.g., cookies)
    // ! Credentialed CORS cannot use origin: "*"
}));

// Parse incoming JSON request bodies
app.use(express.json({
    limit: "16kb" // ! Rejects JSON bodies exceeding 16 KB
}));
// * Parsed data becomes available through req.body

// Parse URL-encoded form data
app.use(express.urlencoded({
    extended: true, // * Supports nested form data using the qs parser
    limit: "16kb"   // ! Limits URL-encoded request body size
}));

// Serve static files from the "public" directory
app.use(express.static("public"));
// ! Never store secrets or private files in this directory

// Parse incoming cookies
app.use(cookieParser());
// * Parsed cookies become available through req.cookies
// ! Parsing cookies does NOT authenticate the user



//routes import:
import userRoute from "./routes/user.routes.js"

//routes declaration
app.use("/api/v1/user", userRoute);

export default app; // Exports the app for server startup in another file
// * Separating app configuration from app.listen() makes testing easier

