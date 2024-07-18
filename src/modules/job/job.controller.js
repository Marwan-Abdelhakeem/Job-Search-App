import Job from "../../../DB/model/job.model.js"
import User from "../../../DB/model/user.model.js"
import Company from "../../../DB/model/company.model.js"
import Application from "../../../DB/model/application.model.js"
import { AppError, catchAsyncError } from '../../utils/error.js'
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

/**
 * @description Adds a new job to the database. Ensures that the job is added by the authenticated user.
 * @route POST /addJob
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if job data is invalid
 * @returns {Object} Response with success message
 */
export const addJob = catchAsyncError(async (req, res) => {
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills
  } = req.body;

  // Create a new job entry in the database
  await Job.create({
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    addedBy: req.user.id
  });

  // Respond with success message
  res.status(201).json({ message: 'Job added successfully' });
});

/**
 * @description Updates an existing job entry. Ensures only the company owner can update the job data.
 * @route PUT /updateJob/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if job not found or if user is not authorized to update the job
 * @returns {Object} Response with success message and updated job data
 */
export const updateJob = catchAsyncError(async (req, res) => {
  const { id } = req.params;
  const j = await Job.findById({ _id: id });

  if (!j) throw new AppError('Job not found', 404);
  if (j.addedBy.toString() !== req.user.id) throw new AppError('Only the company owner can update the data', 403);

  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills
  } = req.body;

  // Update job entry in the database
  const job = await Job.findByIdAndUpdate(j._id, {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    addedBy: req.user.id
  }, { new: true });

  // Respond with success message and updated job data
  res.status(200).json({
    message: 'Job data updated successfully',
    job
  });
});

/**
 * @description Deletes a job entry. Ensures only the company owner can delete the job data.
 * @route DELETE /deleteJob/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if job not found or if user is not authorized to delete the job
 * @returns {Object} Response with success message and deleted job data
 */
export const deleteJob = catchAsyncError(async (req, res) => {
  const { id } = req.params;
  const j = await Job.findById({ _id: id });

  if (!j) throw new AppError('Job not found', 404);
  if (j.addedBy.toString() !== req.user.id) throw new AppError('Only the company owner can delete the data', 403);

  // Delete job entry from the database
  const job = await Job.findByIdAndDelete(j._id);

  // Respond with success message and deleted job data
  res.status(200).json({
    message: 'Job data deleted successfully',
    job
  });
});

/**
 * @description Retrieves all companies along with their job listings.
 * @route GET /JobsWithCompaniesInfo
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if no companies are found
 * @returns {Object} Response with companies and their job listings
 */
export const JobsWithCompaniesInfo = catchAsyncError(async (req, res) => {
  const companies = await Company.find();

  if (!companies.length) {
    throw new AppError('No companies found', 404);
  }

  // Retrieve jobs for each company and merge with company data
  const companiesWithJobs = await Promise.all(companies.map(async company => {
    const jobs = await Job.find({ addedBy: company.companyHR._id }, { addedBy: 0, companyHR: 0 }).populate('addedBy', '-password');
    return { ...company.toObject(), jobs };
  }));

  // Respond with companies and their job listings
  res.status(200).json({ companies: companiesWithJobs });
});

/**
 * @description Retrieves all jobs for a specific company by company name.
 * @route GET /getAllJobsForSpecificCompany
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if company is not found
 * @returns {Object} Response with company details and its job listings
 */
export const getAllJobsForSpecificCompany = catchAsyncError(async (req, res) => {
  const { companyName } = req.query;
  const company = await Company.findOne({ companyName });

  if (!company) {
    throw new AppError('Company not found', 404);
  }

  // Retrieve jobs associated with the company
  const jobs = await Job.find({ addedBy: company.companyHR }).populate('addedBy', '-_id -password -firstName -lastName -recoveryEmail -DOB -status');

  // Respond with company details and job listings
  res.status(200).json({ company, jobs });
});

/**
 * @description Retrieves jobs based on various filters such as working time, location, seniority level, etc.
 * @route GET /getFilteredJobs
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if no jobs match the filters
 * @returns {Object} Response with filtered job listings
 */
export const getFilteredJobs = catchAsyncError(async (req, res) => {
  const { workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills } = req.query;

  // Construct the query based on the provided filters
  let query = {};

  if (workingTime) {
    query.workingTime = workingTime;
  }

  if (jobLocation) {
    query.jobLocation = jobLocation;
  }

  if (seniorityLevel) {
    query.seniorityLevel = seniorityLevel;
  }

  if (jobTitle) {
    query.jobTitle = { $regex: jobTitle, $options: 'i' };
  }

  if (technicalSkills) {
    query.technicalSkills = { $all: technicalSkills.split(',') };
  }

  // Find jobs based on the constructed query
  const jobs = await Job.find(query).populate('addedBy', '-_id -password -firstName -lastName -recoveryEmail -DOB -status');

  if (!jobs.length) {
    return res.status(404).json({ message: 'There are no jobs with these specifications' });
  }

  // Respond with filtered job listings
  res.status(200).json({ jobs });
});

/**
 * @description Allows users to apply for a job. Uploads resume to Cloudinary and saves the application in the database.
 * @route POST /applyToJob
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if job is not found or if resume file is missing
 * @returns {Object} Response with success message
 */
export const applyToJob = catchAsyncError(async (req, res) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Function to upload file to Cloudinary
  const uploadFileToCloudinary = async (filePath) => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(filePath, { resource_type: "auto" }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      });
    });
  };

  req.body.userTechSkills = JSON.parse(req.body.userTechSkills);
  req.body.userSoftSkills = JSON.parse(req.body.userSoftSkills);

  const { jobId, userTechSkills, userSoftSkills } = req.body;

  const job = await Job.findById(jobId);
  if (!job) throw new AppError('Job not found', 404);

  if (!req.file) {
    return res.status(400).json({ message: 'Resume file is required' });
  }

  // Upload resume file to Cloudinary
  const fileUrl = await uploadFileToCloudinary(req.file.path);

  // Create a new job application entry
  const newApplication = new Application({
    jobId: job._id,
    userId: req.user.id,
    userTechSkills,
    userSoftSkills,
    userResume: fileUrl,
  });

  await newApplication.save();

  // Remove local resume file
  fs.unlinkSync(req.file.path);

  // Respond with success message
  res.status(201).json({ message: 'Application submitted successfully' });
});

