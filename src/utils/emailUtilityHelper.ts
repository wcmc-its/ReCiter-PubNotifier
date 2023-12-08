import * as nodemailer from 'nodemailer';

export async function sendEmailNotification(mailOptions:any) {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host:  process.env.SMTP_HOST_NAME,  
      port: process.env.NODE_ENV === "production"  ? 465 : 25,
      secure: process.env.NODE_ENV === "production" ? true : false,
      logger: true,
      debug: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
  });

  // send mail with defined transport object
  return await transporter.sendMail({
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html
  }).then((info) => {
    console.info(`Mail sent successfully!!`);
    console.info(`[MailResponse]=${info.response} [MessageID]=${info.messageId}`);
    return info;
});
}