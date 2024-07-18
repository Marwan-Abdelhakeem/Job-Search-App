import Company from "../../../DB/model/company.model.js"
import User from "../../../DB/model/user.model.js"
import Job from "../../../DB/model/job.model.js"
import { AppError, catchAsyncError } from '../../utils/error.js'
import Application from "../../../DB/model/application.model.js";

/**
 * @description Adds a new company to the database. Checks if the company with the same name or email already exists.
 * @route POST /addCompany
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if company already exists
 * @returns {Object} Response with success message
 */
export const addCompany = catchAsyncError(async (req, res) => {
  const { companyName, description, industry, address, numberOfEmployees, companyEmail, companyHR } = req.body;

  // Check if a company with the same name or email already exists
  const company = await Company.findOne({
    $or: [
      { companyName },
      { companyEmail },
    ],
  });

  if (company) 
    throw new AppError('Company already exists', 400);

  // Create a new company entry in the database
  await Company.create({ companyName, description, industry, address, numberOfEmployees, companyEmail, companyHR });

  // Respond with success message
  res.status(201).json({ message: 'Company added successfully' });
});

/**
 * @description Updates company data. Ensures that only the company owner can update the data and checks for duplicate company names or emails.
 * @route PUT /updateCompanyData
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if user is not authorized to update the data or if duplicate company data is found
 * @returns {Object} Response with success message and updated company data
 */
export const updateCompanyData = catchAsyncError(async (req, res) => {
  const { companyName, description, industry, address, numberOfEmployees, companyEmail, companyHR } = req.body;
  const updates = { companyName, description, industry, address, numberOfEmployees, companyEmail, companyHR };

  // Check if the user is the owner of the company
  const c = await Company.findOne({ companyHR: req.user.id });
  if (!c) throw new AppError('Only the company owner can update the data', 403);

  // Check for existing companies with the same name or email, excluding the current company
  const existingCompany = await Company.findOne({
    $or: [
      { companyName },
      { companyEmail }
    ],
    _id: { $ne: c._id }
  }).exec();

  if (existingCompany) {
    if (existingCompany.companyEmail === companyEmail) {
      throw new AppError('Email already in use', 409);
    }
    if (existingCompany.companyName === companyName) {
      throw new AppError('Company name already in use', 409);
    }
  }

  // Update company data in the database
  const company = await Company.findByIdAndUpdate({ _id: c._id }, updates, { new: true });

  // Respond with success message and updated company data
  res.status(200).json({
    message: 'Company data updated successfully',
    company
  });
});

/**
 * @description Deletes the company data. Ensures that only the company owner can delete the data.
 * @route DELETE /deleteCompanyData
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if user is not authorized to delete the data
 * @returns {Object} Response with success message and deleted company data
 */
export const deleteCompanyData = catchAsyncError(async (req, res) => {
  // Check if the user is the owner of the company
  const c = await Company.findOne({ companyHR: req.user.id });
  if (!c) throw new AppError('Only the company owner can delete the data', 403);

  // Delete the company data from the database
  const company = await Company.findByIdAndDelete({ _id: c._id });

  // Respond with success message and deleted company data
  res.status(200).json({
    message: 'Company data deleted successfully',
    company
  });
});

/**
 * @description Searches for a company by name.
 * @route GET /searchForCompanyWithName
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if company is not found
 * @returns {Object} Response with company data
 */
export const searchForCompanyWithName = catchAsyncError(async (req, res) => {
  const { companyName } = req.query;
  const company = await Company.findOne({ companyName });

  if (!company) {
    throw new AppError('Company not found', 404);
  }

  // Respond with company data
  res.status(200).json(company);
});

/**
 * @description Retrieves detailed company data and associated job listings by company ID.
 * @route GET /getCompanyData/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if company is not found
 * @returns {Object} Response with company data and its job listings
 */
export const getCompanyData = catchAsyncError(async (req, res) => {
  const { id } = req.params;
  const company = await Company.findById(id);
  if (!company) {
    throw new AppError('Company not found', 404);
  }

  // Retrieve jobs associated with the company
  const jobs = await Job.find({ addedBy: company.companyHR }, { addedBy: 0 }).populate('addedBy');

  // Respond with company data and job listings
  res.status(200).json({ company, jobs });
});

/**
 * @description Retrieves all job applications for a specific job. Ensures only the job owner can view the applications.
 * @route GET /getAllApplicationsForSpecificJob/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @throws {AppError} Throws error if job is not found or if user is not authorized to view applications
 * @returns {Object} Response with job applications
 */
export const getAllApplicationsForSpecificJob = catchAsyncError(async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  // Ensure that only the job owner can view the applications
  if (job.addedBy.toString() !== req.user.id) throw new AppError('Only the owner can view the applications for their jobs', 498);

  // Retrieve applications for the specified job
  const applications = await Application.find({ jobId: job._id }).populate('userId', '-_id -password -firstName -lastName -recoveryEmail -DOB -status');

  // Respond with job applications
  res.status(200).json({ applications });
});