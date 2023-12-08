import { sendPubEmailNotifications } from "./notifications/notifications.sendEmail.controller";
/*export const handler = async (event: any): Promise<any> => {
  console.log('Email publication coming******************');
  const data = sendPubEmailNotifications();
  console.log('Email sent successfully');
  /*return {
    statusCode: 200,
    body: data
  };*/
//};*/
export async function handler(event: any, context: any): Promise<any> {
  console.log('Email publication coming******************');
  const data = await sendPubEmailNotifications();
  return {
    statusCode: 200,
    body: data
  };
}