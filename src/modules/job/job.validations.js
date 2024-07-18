import Joi from 'joi';

export const addJobSchema = Joi.object({
    jobTitle: Joi.string().required().messages({
      'string.empty': 'Job title is required'
    }),
    jobLocation: Joi.string().valid('onsite', 'remotely', 'hybrid').required().messages({
      'any.only': 'Job location must be one of onsite, remotely, hybrid',
      'string.empty': 'Job location is required'
    }),
    workingTime: Joi.string().valid('part-time', 'full-time').required().messages({
      'any.only': 'Working time must be one of part-time, full-time',
      'string.empty': 'Working time is required'
    }),
    seniorityLevel: Joi.string().valid('Junior', 'Mid-Level', 'Senior', 'Team-Lead', 'CTO').required().messages({
      'any.only': 'Seniority level must be one of Junior, Mid-Level, Senior, Team-Lead, CTO',
      'string.empty': 'Seniority level is required'
    }),
    jobDescription: Joi.string().required().messages({
      'string.empty': 'Job description is required'
    }),
    technicalSkills: Joi.array().items(Joi.string()).required().messages({
      'array.base': 'Technical skills must be an array of strings',
      'array.includesRequiredUnknowns': 'Technical skills cannot be empty'
    }),
    softSkills: Joi.array().items(Joi.string()).required().messages({
      'array.base': 'Soft skills must be an array of strings',
      'array.includesRequiredUnknowns': 'Soft skills cannot be empty'
    })
});

export const updateJobSchema = Joi.object({
    jobTitle: Joi.string(),
    jobLocation: Joi.string().valid('onsite', 'remotely', 'hybrid').messages({
      'any.only': 'Job location must be one of onsite, remotely, hybrid'
    }),
    workingTime: Joi.string().valid('part-time', 'full-time').messages({
      'any.only': 'Working time must be one of part-time, full-time'
    }),
    seniorityLevel: Joi.string().valid('Junior', 'Mid-Level', 'Senior', 'Team-Lead', 'CTO').messages({
      'any.only': 'Seniority level must be one of Junior, Mid-Level, Senior, Team-Lead, CTO'
    }),
    jobDescription: Joi.string(),
    technicalSkills: Joi.array().items(Joi.string()).messages({
      'array.base': 'Technical skills must be an array of strings'
    }),
    softSkills: Joi.array().items(Joi.string()).messages({
      'array.base': 'Soft skills must be an array of strings'
    })
});

export const deleteJobSchema = Joi.object({
    id: Joi.string().required().messages({
        'string.empty': 'params.id (user ID) is required',
      })
});

export const getJobsForCompanySchema = Joi.object({
    companyName: Joi.string().required().messages({
    'string.empty': 'Company name is required.'
      })
});

export const filterJobsSchema = Joi.object({
  workingTime: Joi.string().valid('part-time', 'full-time').optional(),
  jobLocation: Joi.string().valid('onsite', 'remotely', 'hybrid').optional(),
  seniorityLevel: Joi.string().valid('Junior', 'Mid-Level', 'Senior', 'Team-Lead', 'CTO').optional(),
  jobTitle: Joi.string().optional(),
  technicalSkills: Joi.array().items(Joi.string()).optional(),
});

export const applyJobSchema = Joi.object({
    jobId: Joi.string().required(),
    userTechSkills: Joi.string().required(),
    userSoftSkills: Joi.string().required(),
});