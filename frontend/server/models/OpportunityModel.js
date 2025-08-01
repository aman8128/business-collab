const mongoose = require("mongoose");

const OpportunitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  role: { type: String, enum: ["Business Owner", "Co-Founder", "Investor", "Freelancer/Worker"], required: true },
  title: String,
  description: String,
  investmentNeeded: String, // for Business Owner
  companyStage: String,     // for Co-Founder
  investmentRange: String,  // for Investor
  skillsRequired: [String], // for Freelancer/Worker
  createdAt: { type: Date, default: Date.now },
  firstname : String,
  lastname : String,
  username : String,
  email : String,
  location : String,
  profileImage : String,
  createdAt : String,
});

module.exports = mongoose.model("Opportunity", OpportunitySchema);
