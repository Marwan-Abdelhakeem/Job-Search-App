import Joi from 'joi';

export const signUpSchema = Joi.object({
    firstName: Joi.string().required().messages({
        'any.required': 'First name is required.'
    }),
    lastName: Joi.string().required().messages({
        'any.required': 'Last name is required.'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address.',
        'any.required': 'Email is required.'
    }),
    password: Joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)).required().messages({
        'string.pattern.base': 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.',
        'any.required': 'Password is required.'
    }),
    DOB: Joi.date().iso().max('now').required().messages({
        'date.format': 'Date of Birth must be in the format YYYY-MM-DD.',
        'date.max': 'Date of Birth cannot be in the future.',
        'any.required': 'Date of Birth is required.'
    }),
    mobileNumber: Joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)).required().messages({
        'string.pattern.base': 'Mobile number must be a valid Egyptian number (e.g., 00201XXXXXXXX or +201XXXXXXXX or 01XXXXXXXX).',
        'any.required': 'Mobile number is required.'
    }),
    recoveryEmail: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address.',
        'any.required': 'recoveryEmail is required.'
    }),
    role: Joi.string().valid('User', 'Company_HR').optional().messages({
        'any.only': 'Role must be either User or Company_HR.'
    })
});

export const signInSchema = Joi.object({
    emailOrRecoveryEmailOrMobile: Joi.string().required(),
    password: Joi.string().required(),
});

export const updateAccountSchema = Joi.object({
    firstName: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().email().messages({
        'string.email': 'Please provide a valid email address.'
    }),
    DOB: Joi.date().iso().max('now').messages({
        'date.format': 'Date of Birth must be in the format YYYY-MM-DD.',
        'date.max': 'Date of Birth cannot be in the future.'
    }),
    mobileNumber: Joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)).messages({
        'string.pattern.base': 'Mobile number must be a valid Egyptian number (e.g., 00201XXXXXXXX or +201XXXXXXXX or 01XXXXXXXX).',
    }),
    recoveryEmail: Joi.string().email().messages({
        'string.email': 'Please provide a valid email address.'
    })
});

export const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)).required().messages({
        'string.pattern.base': 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.',
        'any.required': 'currentPassword is required.'
    }),
    newPassword: Joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)).required().messages({
        'string.pattern.base': 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.',
        'any.required': 'newPassword is required.'
    })
});

export const verifyOTPAndSetNewPasswordSchema = Joi.object({
    emailOrMobile: Joi.string()
      .pattern(/^(002|\+2)?01[0125][0-9]{8}$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid mobile number or email address.'
      }),
    otp: Joi.string()
      .length(6)
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        'string.length': 'OTP must be exactly 6 digits.',
        'string.pattern.base': 'OTP must contain only digits.'
      }),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters long.',
        'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one digit.'
      })
});

export const getProfileDataSchema = Joi.object({
    userId: Joi.string().required().messages({
      'string.empty': 'ID is required.',
      'any.required': 'ID is required.'
    })
});

export const getAccountsByRecoveryEmailSchema = Joi.object({
    recoveryEmail: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address.',
        'any.required': 'recoveryEmail is required.'
    })
});

export const forgetPasswordSchema = Joi.object({
    emailOrMobile: Joi.string()
      .pattern(/^(002|\+2)?01[0125][0-9]{8}$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please provide a valid mobile number or email address.'
      })
});
