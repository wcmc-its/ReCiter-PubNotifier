//import NodeMailer from "nodemailer";
import * as NodeMailer from 'nodemailer';

export function sendEmailNotification(mailOptions) {
  return new Promise((resolve,reject)=>{
    let transporter = NodeMailer.createTransport(({
      host: /* process.env.SMTP_HOST_NAME */ 'email-smtp.us-east-1.amazonaws.com',
      port: /*process.env.NODE_ENV === "production"  ? 465 :*/ 25,
      secure: /*process.env.NODE_ENV === "production" ? true :*/ false,
      logger: true,
      debug: true,
      auth: {
        user: /*process.env.SMTP_USER*/ 'AKIA4VN7QGRBDP6UUS2Q',
        pass: /*process.env.SMTP_PASSWORD*/ 'BJMlZzHyJV/vSnTDYOOW6EAXXk47LDVPhMXD9eUErDk7'
      },
      tls: {
        rejectUnAuthorized:/* process.env.NODE_ENV === "production" ? true :*/ false,
      }
    }))
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          console.log("error is "+err);
          resolve(false); 
        } 
        else {
            console.log('Email sent: ' + info.response);
            resolve(true);
        }
    });
    
  });
}