import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({

    service: 'gmail',
    auth: {
        user: 'marwan.abdelhakeem.ahmed@gmail.com',
        pass: 'tgolkpffrczadtqr'
    },
})