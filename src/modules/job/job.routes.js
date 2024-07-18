import { Router } from 'express'
import * as JC from './job.controller.js'
import { validate } from '../middlewares/validate.middleware.js';
import * as JV from './job.validations.js';
import { auth } from '../middlewares/auth.middlewares.js';
import upload from '../middlewares/multer.js';

const router = Router();

router.post('/addJob' ,auth('Company_HR'), validate(JV.addJobSchema), JC.addJob)
router.put('/updateJob/:id' ,auth('Company_HR'), validate(JV.updateJobSchema,['params','body']), JC.updateJob)
router.delete('/deleteJob/:id' ,auth('Company_HR'), validate(JV.deleteJobSchema,'params'), JC.deleteJob)
router.get('/JobsWithCompaniesInfo' ,auth(), JC.JobsWithCompaniesInfo)
router.get('/getAllJobsForSpecificCompany' ,auth(), validate(JV.getJobsForCompanySchema,'query'), JC.getAllJobsForSpecificCompany)
router.get('/getFilteredJobs' ,auth(), validate(JV.filterJobsSchema,'query'), JC.getFilteredJobs)
router.post('/applyToJob' ,auth('User'), upload.single('userResume'), validate(JV.applyJobSchema), JC.applyToJob)

export default router