import nodemailer from 'nodemailer';

const createTransporter = async () => {
  // Use Ethereal for testing if no real SMTP credentials provided
  let testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: '"DairyFresh Organic" <welcome@dairyfresh.com>',
      to: userEmail,
      subject: 'Congratulations & Welcome to DairyFresh!',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #059669; margin: 0;">DairyFresh</h1>
          </div>
          <h2 style="color: #1e293b;">Welcome, ${userName}!</h2>
          <p style="color: #475569; line-height: 1.6;">
            Congratulations on successfully registering your account with DairyFresh. We are thrilled to have you!
          </p>
          <p style="color: #475569; line-height: 1.6;">
            Get ready to experience the purest, farm-to-table organic dairy products delivered straight to your doorstep every morning.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">Best Regards,</p>
            <p style="color: #0f172a; font-weight: bold; margin: 5px 0 0 0;">The DairyFresh Team</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent! Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
  }
};
