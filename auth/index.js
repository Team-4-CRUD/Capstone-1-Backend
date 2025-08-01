const express = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("../database");
const { Op } = require("sequelize");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to authenticate JWT tokens
const authenticateJWT = (req, res, next) => {
  //test postman
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.split(" ")[1]) || req.cookies.token;

  if (!token) {
    return res.status(401).send({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Auth0 authentication route
router.post("/auth0", async (req, res) => {
  try {
    const { auth0Id, email, username } = req.body;

    if (!auth0Id) {
      return res.status(400).send({ error: "Auth0 ID is required" });
    }

    // Try to find existing user by auth0Id first
    let user = await User.findOne({ where: { auth0Id } });

    if (!user && email) {
      // If no user found by auth0Id, try to find by email
      user = await User.findOne({ where: { email } });

      if (user) {
        // Update existing user with auth0Id
        user.auth0Id = auth0Id;
        await user.save();
      }
    }

    if (!user) {
      // Create new user if not found
      const userData = {
        auth0Id,
        email: email || null,
        username: username || email?.split("@")[0] || `user_${Date.now()}`, // Use email prefix as username if no username provided
        passwordHash: null, // Auth0 users don't have passwords
      };

      // Ensure username is unique
      let finalUsername = userData.username;
      let counter = 1;
      while (await User.findOne({ where: { username: finalUsername } })) {
        finalUsername = `${userData.username}_${counter}`;
        counter++;
      }
      userData.username = finalUsername;

      user = await User.create(userData);
    }

    // Generate JWT token with auth0Id included
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        auth0Id: user.auth0Id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.send({
      message: "Auth0 authentication successful",
      user: {
        id: user.id,
        username: user.username,
        auth0Id: user.auth0Id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Auth0 authentication error:", error);
    res.sendStatus(500);
  }
});

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { username, password, firstName, lastName, email, profilePicture } =
      req.body;

    if (!username || !password) {
      return res.status(400).send({
        error: "Username and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).send({
        error: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res
        .status(409)
        .send({ error: `Username "${username}" already exists` });
    }

    if (email) {
      const emailInUse = await User.findOne({ where: { email } });
      if (emailInUse) {
        return res
          .status(409)
          .send({ error: `Email "${email}" already in use` });
      }
    }

    const cleanedFirstName =
      firstName && firstName.trim() !== "" ? firstName.trim() : null;
    const cleanedLastName =
      lastName && lastName.trim() !== "" ? lastName.trim() : null;
    const cleanedEmail = email && email.trim() !== "" ? email.trim() : null;
    const passwordHash = User.hashPassword(password);

    const user = await User.create({
      username,
      passwordHash,
      firstName: cleanedFirstName,
      lastName: cleanedLastName,
      email: cleanedEmail,
      profilePicture,
    });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        auth0Id: user.auth0Id,
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.status(201).send({
      message: "User created successfully",
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    // login with email or username
    const { username: identifier, password } = req.body;

    if (!identifier || !password) {
      res
        .status(400)
        .send({ error: "Email/Username and password are required" });
      return;
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: identifier }, { email: identifier }],
      },
    });

    if (user.disabled) {
      return res.status(403).send({ error: "Your account is disabled." });
    }

    // Check password
    if (!user.checkPassword(password)) {
      return res.status(401).send({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        auth0Id: user.auth0Id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.send({
      message: "Login successful",
      user: { id: user.id, username: user.username },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.sendStatus(500);
  }
});

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.send({ message: "Logout successful" });
});

// Get current user route (protected)
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      isAdmin: user.isAdmin,
    });

    console.log("Fetched user in /me:", user.toJSON());
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

//admin

const adminAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.split(" ")[1]) || req.cookies.token;

  if (!token) {
    return res.status(401).send({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({ error: "Invalid or expired token" });
    }

    if (!user.isAdmin) {
      return res.status(403).send({ error: "Admin access required" });
    }

    req.user = user;
    next();
  });
};

const authenticateJWTIfAvailable = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.split(" ")[1]) || req.cookies.token;

  if (!token) {
    req.user = null; // Allow anonymous access
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null; // Token invalid, treat as guest
    } else {
      req.user = user;
    }
    next();
  });
};

module.exports = {
  router,
  authenticateJWT,
  adminAuthenticate,
  authenticateJWTIfAvailable,
};
