import { Router } from 'express'
import * as UC from './user.controller.js'
import { validate } from '../middlewares/validate.middleware.js';
import * as UV from './user.validations.js';
import { auth } from '../middlewares/auth.middlewares.js';

const router = Router();

router.post('/signup', validate(UV.signUpSchema), UC.signUp)
router.post('/SignIn', validate(UV.signInSchema), UC.SignIn)
router.get('/logout',auth(), UC.logout);
router.put('/updateAccount',auth(), validate(UV.updateAccountSchema), UC.updateAccount);
router.delete('/deleteAccount', auth(), UC.deleteAccount);
router.get('/getUserData', auth(), UC.getUserData);
router.get('/getProfileData', validate(UV.getProfileDataSchema ,'query'), UC.getProfileData);
router.get('/getAccountsByRecoveryEmail', validate(UV.getAccountsByRecoveryEmailSchema,'query'), UC.getAccountsByRecoveryEmail);
router.put('/updatePassword', auth(), validate(UV.updatePasswordSchema), UC.updatePassword);
router.post('/forgetPassword', validate(UV.forgetPasswordSchema),UC.forgetPassword);
router.put('/verifyOTPAndSetNewPassword', validate(UV.verifyOTPAndSetNewPasswordSchema),UC.verifyOTPAndSetNewPassword)

export default router