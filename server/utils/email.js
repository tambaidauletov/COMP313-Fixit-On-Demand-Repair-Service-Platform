const nodemailer = require('nodemailer');

// Create transporter based on environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send email function
const sendEmail = async (options) => {
  try {
    // Send mail with defined transport object
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Email could not be sent');
  }
};

// Welcome email template
const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to Fixit',
    html: `
      <h1>Welcome to Fixit, ${user.name}!</h1>
      <p>Thank you for joining our platform.</p>
      <p>You can now ${user.role === 'customer' ? 'create listings for repair needs' : 'browse listings and offer your services'}.</p>
      <p>Best regards,<br>The Fixit Team</p>
    `
  });
};

// Password reset email
const sendPasswordResetEmail = async (user, resetUrl) => {
  await sendEmail({
    to: user.email,
    subject: 'Password Reset',
    html: `
      <h1>You requested a password reset</h1>
      <p>Please click on the following link to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
}; 