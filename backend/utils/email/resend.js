const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function resendEmail(email, token) {
  if (!email || !token) {
    console.log("Missing email and / or token!");
    throw new Error("Missing params!");
  }

  const url = `${process.env.API_BASE_URL}/auth/verify?token=${token}`;
  const sender = process.env.SMTP_USER;
  console.log("Sending verification email...");

  try {
    await resend.emails.send({
      from: sender,
      to: email,
      subject: "Verify your TuneBacker account",
      html: `<p>Click <a href="${url}">here</a> to verify your account.</p>`,
    });
  } catch (resendError) {
    console.error("Failed to resend email:", resendError);
    throw new Error("Failed to resend email");
  }
}

module.exports = { resendEmail };
