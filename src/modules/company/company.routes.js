import { Router } from 'express'
import * as CC from './company.controller.js'
import { validate } from '../middlewares/validate.middleware.js';
import * as CV from './company.validations.js';
import { auth } from '../middlewares/auth.middlewares.js';

const router = Router();

router.post('/addCompany' ,auth('Company_HR'), validate(CV.addCompanySchema), CC.addCompany)
router.put('/updateCompanyData' ,auth('Company_HR'), validate(CV.updateCompanyDataSchema), CC.updateCompanyData)
router.delete('/deleteCompanyData' ,auth('Company_HR'), CC.deleteCompanyData)
router.get('/searchForCompanyWithName' ,auth(), validate(CV.searchForCompanyWithNameSchema, 'query'), CC.searchForCompanyWithName)
router.get('/getCompanyData/:id' ,auth('Company_HR'), validate(CV.getCompanyDataSchema,'params'), CC.getCompanyData)

router.get('/getAllApplicationsForSpecificJob:id' ,auth('Company_HR'), CC.getAllApplicationsForSpecificJob)

export default router