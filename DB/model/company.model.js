import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  numberOfEmployees: {
    type: String,
    enum: [
      '1-10 employees',
      '11-20 employees',
      '21-50 employees',
      '51-100 employees',
      '101-200 employees',
      '201-500 employees',
      '501-1000 employees',
      '1001-5000 employees',
      '5001-10,000 employees',
      '10,001+ employees',
    ],
    required: true,
  },
  companyEmail: {
    type: String,
    required: true,
    unique: true,
  },
  companyHR: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  versionKey: false,
  timestamps: true,
});

const Company = mongoose.model('Company', CompanySchema);
export default Company;