import { sendPubEmailNotifications } from "./notifications/notifications.sendEmail.controller";
export async function handler(event: any, context: any): Promise<any> {
  const data = await sendPubEmailNotifications();
  return {
    statusCode: 200,
    body: data
  };
}