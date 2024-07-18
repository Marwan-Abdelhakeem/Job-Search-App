import jwt from 'jsonwebtoken'
import { AppError, catchAsyncError } from '../../utils/error.js';

export const auth = (role)=> catchAsyncError(async(req, res, next)=>{

    const {token} = req.headers
    if(!token) throw new AppError('Please SignIn',401)
    
    jwt.verify(token, 'secret',(err,decoded)=>{
        if(err) throw new AppError('Invalid token',498)

        if(role !=undefined && decoded.role!==role) throw new AppError('Not enough privileges',403);

        req.user = decoded
        next()
    })   
});