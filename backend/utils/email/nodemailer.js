const nodemailer = require("nodemailer");
const { Resend } = require("resend");
const jwt = require("jsonwebtoken");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
//   connectionTimeout: 10000,
//   greetingTimeout: 10000,
//   socketTimeout: 10000,
//   debug: true,
//   logger: true,
// });

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(email, token) {
  if (!email || !token) {
    console.log("Missing email and / or token!");
    throw new Error("Missing params!");
  }

  const url = `${process.env.API_BASE_URL}/auth/verify?token=${token}`;
  console.log("Sending verification email...");
  try {
    // await transporter.sendMail({
    //   from: `"TuneBacker" <${process.env.SMTP_USER}>`,
    //   to: email,
    //   subject: "Please Verify your email",
    //   html: `
    //     <h2>Welcome to SpotSave!</h2>
    //     <p>To Finish Registering Your Account, Click Below to Verify Your Email:</p>
    //     <a href="${url}">${url}</a>
    //     <p>This link expires in 24 hours.</p>
    //   `,
    // });
    await resend.emails.send({
      from: `TuneBacker <${process.env.SMTP_USER}>`, // must be verified on Resend
      to: email,
      subject: "Please Verify Your Email",
      html: `
        <h2>Welcome to TuneBacker!</h2>
        <p>Click below to verify your email:</p>
        <a href="${url}">${url}</a>
        <p>This link expires in 24 hours.</p>
      `,
    });
  } catch (error) {
    console.log("Error sending verification email: " + error);
    throw new Error("Error sending verification email!");
  }
}

module.exports = { sendVerificationEmail };
