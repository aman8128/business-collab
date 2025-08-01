const { MongoClient } = require("mongodb");
const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const UserModel = require("./models/Users");
const { ObjectId } = mongoose.Types;
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");
const OpportunityModel = require("./models/OpportunityModel");
const { data } = require("react-router-dom");
const MessageModel = require("./MessageModel");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const GOOGLE_CLIENT_ID = "Your_Mongodb_Client_ID";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.post("/social-login", async (req, res) => {
  const { provider, token } = req.body;

  try {
    let userData;

    if (provider === "google") {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      userData = {
        email: payload.email,
        firstname: payload.given_name,
        lastname: payload.family_name,
        profileImage: payload.picture,
        uid: payload.sub,
        provider: "google",
      };

    } else if (provider === "facebook") {
      const fbUrl = `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture`;
      const response = await axios.get(fbUrl);

      const nameParts = response.data.name.split(" ");
      userData = {
        email: response.data.email || `${response.data.id}@facebook.com`,
        firstname: nameParts[0],
        lastname: nameParts[1] || "",
        profileImage: response.data.picture?.data?.url,
        uid: response.data.id,
        provider: "facebook",
      };
    } else {
      return res.status(400).json({ success: false, message: "Invalid provider" });
    }

    let user = await UserModel.findOne({ email: userData.email });

    if (!user) {
      user = new UserModel({
        ...userData,
        username: userData.email.split("@")[0],
        signupdate: getIndianTime(),
        lastupdated: getIndianTime(),
        location: "",
        fullAddress: "",
        password: "", // social login users ke liye password blank
      });
      await user.save();
    }

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ success: true, user: userObj });
  } catch (error) {
    console.error("Social login error:", error);
    res.status(500).json({ success: false, message: "Social login failed" });
  }
});

// GET /user-public-profile/:userId
app.get("/user-public-profile/:userId", async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId).select("firstname lastname username location fullAddress skillsets company companiesinvested role companiesworked about lookingforwho wantinvestment profileImage email signupdate"); // only public fields
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const MONGO_URI = "Your_Mongodb_URI";

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("✅ MongoDB connected");
    UserModel.init();
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

const getIndianTime = () => {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
};

const extractCityStateCountry = (fullAddress) => {
  if (!fullAddress) return '';
  try {
    const parts = fullAddress.split(',');
    const relevantParts = parts.slice(0, 3);
    return relevantParts.map(part => part.trim()).join(', ');
  } catch (e) {
    return fullAddress;
  }
};

app.post("/post-opportunity", async (req, res) => {
  try {
    const { userId, role, title, description, wantinvestment, companyStage, investmentRange, skillsRequired , firstname} = req.body;

    if (!userId || !role || !title || !description) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const user = await UserModel.findById(userId).select("firstname lastname username location fullAddress profileImage");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const opportunity = new OpportunityModel({
      userId,
      role,
      title,
      description,
      wantinvestment,
      companyStage,
      investmentRange,
      skillsRequired,
      firstname : user.firstname,
      lastname : user.lastname,
      username: user.username,
      location: user.location,
      fullAddress : user.fullAddress,
      email: user.email,
      profileImage: user.profileImage,
      createdAt: getIndianTime(),
    });

    await opportunity.save();

    res.status(201).json({ success: true, message: "Opportunity posted successfully", opportunity });
  } catch (error) {
    console.error("Post opportunity error:", error);
    res.status(500).json({ success: false, message: "Failed to post opportunity" });
  }
});

app.get("/browse-opportunities", async (req, res) => {
  try {
    const opportunities = await OpportunityModel.find()
      .populate({
        path: "userId",
        select: "firstname lastname username location fullAddress",
        options: { strictPopulate: false } // allows skipping broken refs
      });

    res.json({ success: true, opportunities });
  } catch (err) {
    console.error("Error in /browse-opportunities:", err.message);
    // Optional: Add detailed logging
    const debugData = await OpportunityModel.find();
    console.error("Raw opportunities:", debugData);

    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

app.get("/check-username", async (req, res) => {
  const { username } = req.query;
  if (!username || username.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters" });
  }

  const existing = await UserModel.findOne({
    username: { $regex: new RegExp(`^${username.trim()}$`, "i") }
  });

  res.json({
    exists: !!existing,
    message: existing ? "Username already taken" : "Username available"
  });
});

// 🟢 Send a new message
app.post("/send-message", async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const message = new MessageModel({
      senderId,
      receiverId,
      content,
    });

    await message.save();

    res.status(201).json({ success: true, message: "Message sent", data: message });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

// 🟡 Get all messages between two users (conversation)
app.get("/get-messages", async (req, res) => {
  try {
    const { user1, user2 } = req.query;

    if (!user1 || !user2) {
      return res.status(400).json({ success: false, message: "Both user IDs are required" });
    }

    const messages = await MessageModel.find({
      $or: [
        { senderId: user1, receiverId: user2 },
        { senderId: user2, receiverId: user1 },
      ],
    }).sort({ createdAt: 1 }); // ascending time order

    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ success: false, message: "Error fetching messages" });
  }
});

// Get recent chats list for a user (latest message per conversation)
app.get("/recent-chats/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const messages = await MessageModel.aggregate([
      {
        $match: {
          $or: [
            { senderId: new ObjectId(userId) },
            { receiverId: new ObjectId(userId) },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            sender: "$senderId",
            receiver: "$receiverId",
          },
          latestMessage: { $first: "$$ROOT" }
        },
      },
      {
        $replaceRoot: { newRoot: "$latestMessage" }
      }
    ]);

    // Unique other user IDs
    const chatUsers = new Map();

    for (let msg of messages) {
      const isSender = msg.senderId.toString() === userId;
      const otherUserId = isSender ? msg.receiverId : msg.senderId;

      if (!chatUsers.has(otherUserId.toString())) {
        const user = await UserModel.findById(otherUserId).select("username firstname profileImage");
        
        if (user) {
          chatUsers.set(otherUserId.toString(), {
            userId: otherUserId,
            name: user.username,
            firstname: user.firstname,
            profileImage: user.profileImage,
            lastMessage: msg.content,
            createdAt: msg.createdAt,
          });
        }
      }
    }

    res.json({ success: true, chats: Array.from(chatUsers.values()) });
  } catch (err) {
    console.error("Inbox error:", err);
    res.status(500).json({ success: false, message: "Could not get chats" });
  }
});

// In your backend (e.g., server.js or routes file)
app.get('/search-users', async (req, res) => {
  const { query } = req.query;
  try {
    const users = await UserModel.find().select("username firstname lastname profileImage role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});


app.get("/getUsers", async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Error fetching users" });
  }
});

app.post("/updateProfile", upload.single("profileImage"), async (req, res) => {
  try {
    const {
      _id, firstname, lastname, email, about,location,
      role, phone, company, companiesinvested,
      wantinvestment, skillsets,lookingforwho
    } = req.body;

    if (!_id) return res.status(400).json({ message: "User ID is required" });

    const lastupdated = getIndianTime();
    const fullAddress = location;
    const loc = extractCityStateCountry(location)

    const updateFields = {
      firstname, lastname, email, location:loc, about,
      role, phone, company, companiesinvested,
      wantinvestment, lastupdated,
      skillsets: Array.isArray(skillsets) ? skillsets : [],
      lookingforwho, fullAddress
    };

    if (req.file) {
      updateFields.profileImage = `/uploads/${req.file.filename}`;
    }

    await UserModel.updateOne({ _id: new ObjectId(_id) }, { $set: updateFields });

    res.json({ message: "Profile updated successfully", imageUrl: updateFields.profileImage });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
});

// EXPRESS server for React APIs
const expressServer = app.listen(5001, () => {
  console.log("🚀 Express server running on http://localhost:5001");
});

// HTTP server for signup/login
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/signup") {
    let body = "";
    req.on("data", chunk => body += chunk.toString());
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);

        if (!data.username || !data.email || !data.password) {
          return res.writeHead(400).end(JSON.stringify({
            success: false, message: "Username, email, and password are required"
          }));
        }

        const existingUsername = await UserModel.findOne({
          username: { $regex: new RegExp(`^${data.username.trim()}$`, 'i') }
        });
        if (existingUsername) {
          return res.writeHead(400).end(JSON.stringify({
            success: false, message: "Username already exists"
          }));
        }

        const existingEmail = await UserModel.findOne({
          email: { $regex: new RegExp(`^${data.email.trim()}$`, 'i') }
        });
        if (existingEmail) {
          return res.writeHead(400).end(JSON.stringify({
            success: false, message: "Email already registered"
          }));
        }

        const location = extractCityStateCountry(data.location);

        const newUser = new UserModel({
          ...data,
          firstname: data.firstname?.trim(),
          lastname: data.lastname?.trim(),
          username: data.username.trim().toLowerCase(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
          lookingforwho: data.lookingforwho,
          signupdate: getIndianTime(),
          lastupdated: getIndianTime(),
          location,
          fullAddress : data.location,
          provider: 'local',
        });

        if (["freelancer", "worker"].includes(data.role?.toLowerCase())) {
          userPayload.skillsets = data.skillsets || [];
        }

        await newUser.save();

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: "User created successfully" }));

      } catch (error) {
        console.error("Signup error:", error);
        res.writeHead(500).end(JSON.stringify({
          success: false, message: "Error creating user"
        }));
      }
    });

  } else if (req.method === "POST" && req.url === "/login") {
    let body = "";
    req.on("data", chunk => body += chunk.toString());
    req.on("end", async () => {
      try {
        const { email, password } = JSON.parse(body);

        if (!email || !password) {
          return res.writeHead(400).end(JSON.stringify({
            success: false, message: "Email and password are required"
          }));
        }

        const user = await UserModel.findOne({
          email: { $regex: new RegExp(`^${email.trim()}$`, 'i') }
        });

        if (!user) {
          return res.writeHead(401).end(JSON.stringify({
            success: false, message: "User not found"
          }));
        }

        if (user.password !== password) {
          return res.writeHead(401).end(JSON.stringify({
            success: false, message: "Invalid password"
          }));
        }

        const userData = user.toObject();
        delete userData.password;

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, user: userData }));

      } catch (error) {
        console.error("Login error:", error);
        res.writeHead(500).end(JSON.stringify({
          success: false, message: "Server error during login"
        }));
      }
    });

  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, message: "Endpoint not found" }));
  }
});

server.listen(5000, () => {
  console.log("🔗 HTTP server running on http://localhost:5000");
});

const shutdown = () => {
  expressServer.close();
  server.close();
  mongoose.connection.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);