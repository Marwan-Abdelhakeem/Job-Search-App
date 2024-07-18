import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from "../../../DB/model/user.model.js"
import { transporter } from '../../utils/email.js'
import { AppError, catchAsyncError } from '../../utils/error.js'

/**
 * @description Handles user sign-up. Creates a new user with hashed password and default role if not specified.
 * @route POST /signup
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if email or mobile number already exists
 * @returns {Object} Response with success message
 */
export const signUp = catchAsyncError(async (req, res) => {
  // Extracting user details from the request body
  const { firstName, lastName, email, password, DOB, mobileNumber, recoveryEmail } = req.body;
  const username = `${firstName}${lastName}`;
  const role = req.body.role || 'User'; // Default role is 'User' if not provided

  // Check if a user with the same email or mobile number already exists
  const user = await User.findOne({
    $or: [
        { email },
        { mobileNumber }
    ],
  });
  
  if (user) throw new AppError('Email already exists', 400);

  // Hash the user's password
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  // Create a new user in the database
  await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    DOB,
    mobileNumber,
    recoveryEmail,
    role,
    username
  });

  // Respond with success message
  res.status(201).json({ message: 'signup successfully' });
});

/**
 * @description Handles user sign-in. Authenticates user and returns a JWT token.
 * @route POST /signin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if email or mobile number is incorrect or password is invalid
 * @returns {Object} Response with success message and JWT token
 */
export const SignIn = catchAsyncError(async (req, res) => {
  // Extract credentials from the request body
  const { emailOrRecoveryEmailOrMobile, password } = req.body;

  // Find user by email, recovery email, or mobile number
  const user = await User.findOne({
    $or: [
        { email: emailOrRecoveryEmailOrMobile },
        { mobileNumber: emailOrRecoveryEmailOrMobile },
        { recoveryEmail: emailOrRecoveryEmailOrMobile }
    ],
  });

  // Check if user exists and password matches
  if (!user || !bcrypt.compareSync(password, user.password))
    throw new AppError('Incorrect password or email', 400);

  // Update user's status to 'online'
  await User.findOneAndUpdate({
    $or: [
        { email: emailOrRecoveryEmailOrMobile },
        { mobileNumber: emailOrRecoveryEmailOrMobile },
        { recoveryEmail: emailOrRecoveryEmailOrMobile }
    ],
  }, { status: 'online' });

  // Generate JWT token
  const token = jwt.sign({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  // Respond with token
  res.json({ message: "SignIn successfully", token });
});

/**
 * @description Updates user account details. Ensures new email or mobile number does not conflict with existing data.
 * @route PUT /updateAccount
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if user is not logged in, offline, or if new email/mobile number is already in use
 * @returns {Object} Response with success message and updated user data
 */
export const updateAccount = catchAsyncError(async (req, res) => {
  // Extract updates from request body
  const { email, mobileNumber, recoveryEmail, DOB, lastName, firstName } = req.body;
  const updates = { email, mobileNumber, recoveryEmail, DOB, lastName, firstName };

  // Find the current user
  const x = await User.findById(req.user.id);
  if (!x) throw new AppError('Please SignUp', 401);
  if (x.status === 'offline') throw new AppError('LogIn first', 401);

  // Check for existing users with the new email or mobile number
  const existingUser = await User.findOne({
    $or: [
      { email },
      { mobileNumber }
    ],
    _id: { $ne: req.user.id }
  }).exec();

  if (existingUser) {
    if (existingUser.email === email) {
      throw new AppError('Email already in use', 409);
    }
    if (existingUser.mobileNumber === mobileNumber) {
      throw new AppError('Mobile number already in use', 409);
    }
  }

  // Update user details
  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true
  });

  // Respond with updated user data
  res.status(200).json({
    message: 'Account updated successfully',
    user
  });
});

/**
 * @description Deletes the user account. Ensures user is logged in before proceeding.
 * @route DELETE /deleteAccount
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if user is not logged in or is offline
 * @returns {Object} Response with success message and deleted user data
 */
export const deleteAccount = catchAsyncError(async (req, res) => {
  // Find the current user
  const x = await User.findById(req.user.id);
  if (!x) throw new AppError('Please SignUp', 401);
  if (x.status === 'offline') throw new AppError('LogIn first', 401);

  // Delete the user account
  const user = await User.findByIdAndDelete(req.user.id);

  // Respond with success message
  res.status(200).json({
    message: 'Account deleted successfully',
    user
  });
});

/**
 * @description Logs out the user by setting their status to offline. Ensures user is logged in before proceeding.
 * @route POST /logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if user is not logged in or is offline
 * @returns {Object} Response with success message
 */
export const logout = catchAsyncError(async (req, res) => {
  // Find the current user
  const x = await User.findById(req.user.id);
  if (!x) throw new AppError('Please SignUp', 401);
  if (x.status === 'offline') return res.status(200).json({ message: 'Logout successfully' });

  // Update user's status to 'offline'
  await User.findByIdAndUpdate(req.user.id, { status: 'offline' }, { new: true });

  // Respond with success message
  res.status(200).json({ message: 'Logout successfully' });
});

/**
 * @description Retrieves the logged-in user's data. Ensures user is logged in before proceeding.
 * @route GET /getUserData
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if user is not logged in or is offline
 * @returns {Object} Response with success message and user data
 */
export const getUserData = catchAsyncError(async (req, res) => {
  // Find the current user
  const user = await User.findById(req.user.id);
  if (!user) throw new AppError('Please SignUp', 401);
  if (user.status === 'offline') throw new AppError('LogIn first', 401);

  // Respond with user data
  res.status(200).json({
    message: 'Success',
    user
  });
});

/**
 * @description Retrieves profile data of a specific user. Excludes sensitive information from the response.
 * @route GET /getProfileData
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if user is not found
 * @returns {Object} Response with user profile data
 */
export const getProfileData = catchAsyncError(async (req, res) => {
  // Extract userId from query parameters
  const { userId } = req.query;

  // Find the user by userId and exclude sensitive information
  const user = await User.findById(userId).select('-password -recoveryEmail -status -otp -otpExpire');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Respond with user profile data
  res.status(200).json(user);
});

/**
 * @description Updates the user's password. Ensures current password is correct and new password is different.
 * @route PUT /updatePassword
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if current password is incorrect, new password matches current password, or user is offline
 * @returns {Object} Response with success message
 */
export const updatePassword = catchAsyncError(async (req, res) => {
  // Extract current and new password from request body
  const { currentPassword, newPassword } = req.body;

  // Find the current user
  const user = await User.findById(req.user.id);
  if (!user) {
    throw new AppError('Please SignUp', 401);
  } else {
    if (user.status === 'offline') throw new AppError('LogIn first', 401);
    if (!bcrypt.compareSync(currentPassword, user.password)) throw new AppError('Current password is incorrect', 400);
    if (bcrypt.compareSync(newPassword, user.password)) throw new AppError('The current password matches the new password', 400);
  }

  // Hash the new password and update it in the database
  const hashedPassword = bcrypt.hashSync(newPassword, 8);
  await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

  // Respond with success message
  res.status(200).json({ message: 'Password updated successfully' });
});

/**
 * @description Retrieves all user accounts associated with a specific recovery email.
 * @route GET /getAccountsByRecoveryEmail
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if no accounts are found with the provided recovery email
 * @returns {Object} Response with list of users
 */
export const getAccountsByRecoveryEmail = catchAsyncError(async (req, res) => {
  // Extract recoveryEmail from query parameters
  const { recoveryEmail } = req.query;

  // Find users by recoveryEmail and exclude sensitive information
  const users = await User.find({ recoveryEmail }).select('-password -status -otp -otpExpire');

  if (!users || users.length === 0) {
    throw new AppError('No accounts found with the provided recovery email', 404);
  }

  // Respond with list of users
  res.status(200).json({ users });
});

/**
 * @description Sends an OTP to the user's recovery email for password reset. Ensures the provided email or mobile number exists.
 * @route POST /forgetPassword
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if email or mobile number is incorrect
 * @returns {Object} Response with success message
 */
export const forgetPassword = catchAsyncError(async (req, res) => {
  // Extract email or mobile number from request body
  const { emailOrMobile } = req.body;

  // Find user by email or mobile number
  const user = await User.findOne({
    $or: [
        { email: emailOrMobile },
        { mobileNumber: emailOrMobile }
    ],
  });

  if (!user) throw new AppError('Incorrect email or mobile number', 400);

  // Generate OTP and set expiry time
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpire = Date.now() + 10 * 60 * 1000;

  // Update user with OTP and expiry time
  await User.findByIdAndUpdate(user._id, { otp, otpExpire });
  
  // Send OTP to user's recovery email
  await transporter.sendMail({
    to: user.recoveryEmail,
    subject: 'Your OTP Code',
    html: `<p>Your OTP code is <strong>${otp}</strong></p>`
  });

  // Respond with success message
  res.status(201).json({ message: 'OTP has been sent successfully' });
});

/**
 * @description Verifies the OTP and updates the user's password. Ensures the OTP is valid and has not expired.
 * @route POST /verifyOTPAndSetNewPassword
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if OTP is invalid or expired, or if email or mobile number is incorrect
 * @returns {Object} Response with success message
 */
export const verifyOTPAndSetNewPassword = catchAsyncError(async (req, res) => {
  // Extract email, OTP, and new password from request body
  const { emailOrMobile, otp, newPassword } = req.body;

  // Find user by email or mobile number
  const user = await User.findOne({
    $or: [
        { email: emailOrMobile },
        { mobileNumber: emailOrMobile }
    ],
  });

  if (!user || user.otp !== otp) throw new AppError('Invalid email or OTP', 400);

  if (Date.now() > user.otpExpire) {
    throw new AppError('OTP expired', 400);
  }

  // Hash the new password and update it in the database
  const hashedPassword = bcrypt.hashSync(newPassword, 8);
  await User.findByIdAndUpdate(user._id, { password: hashedPassword, otp: null, otpExpire: null });

  // Respond with success message
  res.status(200).json({ message: 'Password updated successfully' });
});
