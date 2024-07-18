import Joi from 'joi';

export const addCompanySchema = Joi.object({
    companyName: Joi.string().required().messages({
      'string.empty': 'Company name is required.'
    }),
    description: Joi.string().required().messages({
      'string.empty': 'Description is required.'
    }),
    industry: Joi.string().required().messages({
      'string.empty': 'Industry is required.'
    }),
    address: Joi.string().required().messages({
      'string.empty': 'Address is required.'
    }),
    numberOfEmployees: Joi.string().valid(
      '1-10 employees',
      '11-20 employees',
      '21-50 employees',
      '51-100 employees',
      '101-200 employees',
      '201-500 employees',
      '501-1000 employees',
      '1001-5000 employees',
      '5001-10,000 employees',
      '10,001+ employees'
    ).required().messages({
      'any.only': 'Number of employees must be one of the specified values.'
    }),
    companyEmail: Joi.string().email().required().messages({
      'string.email': 'Company email must be a valid email address.',
      'string.empty': 'Company email is required.'
    }),
    companyHR: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
      'string.pattern.base': 'Company HR must be a valid MongoDB ObjectId.',
      'string.empty': 'Company HR is required.'
    })
});

export const updateCompanyDataSchema = Joi.object({
    companyName: Joi.string(),
    description: Joi.string(),
    industry: Joi.string(),
    address: Joi.string(),
    numberOfEmployees: Joi.string().valid(
      '1-10 employees',
      '11-20 employees',
      '21-50 employees',
      '51-100 employees',
      '101-200 employees',
      '201-500 employees',
      '501-1000 employees',
      '1001-5000 employees',
      '5001-10,000 employees',
      '10,001+ employees'
    ).messages({
      'any.only': 'Number of employees must be one of the specified values.'
    }),
    companyEmail: Joi.string().email().messages({
      'string.email': 'Company email must be a valid email address.',
    }),
    companyHR: Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
      'string.pattern.base': 'Company HR must be a valid ObjectId.',
    })
});

export const searchForCompanyWithNameSchema = Joi.object({
    companyName: Joi.string().required()
});

export const getCompanyDataSchema = Joi.object({
    id: Joi.string().required().messages({
      'string.empty': 'ID is required.',
      'any.required': 'ID is required.'
    })
});