import express from 'express'
import './DB/db.con.js'
import { AppError } from './src/utils/error.js'
import userRoutes from './src/modules/user/user.routes.js'
import companyRoutes from './src/modules/company/company.routes.js'
import jobRoutes from './src/modules/job/job.routes.js'
import dotenv from 'dotenv';
dotenv.config();

process.on('uncaughtException', () => console.log('error'))

const app = express()
const port = process.env.PORT || 3001;
app.use(express.json())

app.use('/user',userRoutes)
app.use('/company',companyRoutes)
app.use('/job',jobRoutes)

app.use('*', (req, res, next) => {
    next(new AppError(req.originalUrl + ' not found', 404))
})
app.use((err, req, res, next) => {
    const { message, statusCode } = err
    res.status(statusCode || 500).json({ message })
})

app.listen(port, () => console.log(`Job Search App listening on port ${port}!`))

process.on('uncaughtException', () => console.log('error'))