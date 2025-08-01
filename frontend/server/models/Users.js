const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  profileImage: String, // This will store the image URL
  email: { type: String, required: true, unique: true, index: true },
  password: String,
  signupdate: String,
  lastupdated: String,
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
    index: true
  },
  location: String,
  fullAddress: String,
  company: String,
  companiesinvested: String,
  role: String,
  phone: {
  type: Number,
  validate: {
    validator: function(v) {
      // Simple regex for phone number validation
      return /\d{10,15}/.test(v);
    },
    message: props => `${props.value} is not a valid phone number!`
  }},
  skillsets: [String],
  companiesworked: String,
  wantinvestment: String,
  about: String,
  lookingforwho : String,
  googleId: String,
  provider: { type: String, default: 'local' },
  
}, { 
  timestamps: false,
  versionKey: false
});

UserSchema.index({ username: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;