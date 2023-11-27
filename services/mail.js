// mail.js
const nodemailer = require('nodemailer');
require("dotenv").config();


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      text,
    });

    console.log('Email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
