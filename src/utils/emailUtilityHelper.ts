import * as nodemailer from 'nodemailer';
import  {getSecret} from '../utils/secretsManager';

export async function sendEmailNotification(mailOptions:any) {
  // create reusable transporter object using the default SMTP transport
  let dbSecrets:any ='';
  const reciterPubNotifierSecretLoc = process.env.RECITER_PUB_NOTIFIER_SECRET_LOC || '';
  if(reciterPubNotifierSecretLoc && reciterPubNotifierSecretLoc =='AWS')
  {
        const reciterPubSecretManager = process.env.RECITER_PUB_SECRET_MANAGER || '';
        dbSecrets = await getSecret( reciterPubSecretManager);
  }
  const { SMTP_HOST_NAME,SMTP_ADMIN_EMAIL,SMTP_PASSWORD,SMTP_USER,SMTP_PORT, SMTP_SECURE } = dbSecrets;

  const transporter = nodemailer.createTransport({
    host:  SMTP_HOST_NAME || process.env.SMTP_HOST_NAME,  
      port: process.env.NODE_ENV === "production"  ? (SMTP_PORT?SMTP_PORT:465) : 25,
      secure: process.env.NODE_ENV === "production" ? (SMTP_SECURE?SMTP_SECURE:true) : false,
      logger: true,
      debug: true,
      auth: {
        user: SMTP_USER || process.env.SMTP_USER,
        pass: SMTP_PASSWORD || process.env.SMTP_PASSWORD
      },
  });

  // send mail with defined transport object
  return await transporter.sendMail({
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    html: mailOptions.html
  }).then((info) => {
    console.log(`Mail sent successfully!!`);
    console.log(`[MailResponse]=${info.response} [MessageID]=${info.messageId}`);
    return info;
});
}