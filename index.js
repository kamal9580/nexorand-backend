import express from "express";
import dotenv from "dotenv";
import session from "express-session";
import userRoutes from "./src/routes/userRoute.js";
import linkRoutes from "./src/routes/linkRoute.js";
import connectDB from "./src/config/dbConnection.js";
import passport from "passport";
import cors from "cors";
import { Strategy as OAuth2Strategy } from "passport-google-oauth2";
import { login, socialLogin } from "./src/controllers/userController.js";

// Load environment variables from .env file
dotenv.config();
console.log("PORT:", process.env.PORT); // Should log 3001




const app = express();
const PORT = process.env.PORT || 3000;

// CORS Middleware
app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Middleware for parsing JSON
app.use(express.json());

// Session Middleware
app.use(
  session({
    secret: "sdafasdfas", // Replace with a secure secret in production
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth2 Strategy
passport.use(
  new OAuth2Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      socialLogin(profile, done);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth2 Callback Route
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.FRONT_END_URL}/auth/validate`,
    failureRedirect: `${process.env.FRONT_END_URL}/auth/signin`,
  })
);

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/links", linkRoutes);

// 404 Error Handling
app.all("*", (req, res) => {
  return res.status(404).json({
    success: false,
    message: `Can't find ${req.originalUrl} on this server`,
  });
});

// Connect to Database and Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});
