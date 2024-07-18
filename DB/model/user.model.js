import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  recoveryEmail: {
    type: String,
    lowercase: true,
    required: true,
  },
  DOB: {
    type: Date,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ['User', 'Company_HR'],
    default: 'User'
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  otp: {
    type: String
  },
  otpExpire: {
    type: Date
  }
}, {
  versionKey: false
});

const User = mongoose.model('User', UserSchema);
export default User;