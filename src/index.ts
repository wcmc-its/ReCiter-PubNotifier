import { sendPubEmailNotifications } from "./notifications/notifications.sendEmail.controller";

const AWS = require('aws-sdk');
const codepipeline = new AWS.CodePipeline();

export async function handler(event: any, context: any): Promise<any> {
  const data = await sendPubEmailNotifications();
  
  try {
        await codepipeline.putJobSuccessResult({
            jobId: event["ReCiter-PubNotifier.job"].id
        }).promise();
    } catch (err) {
        console.error('Error calling PutJobSuccessResult:', err);
        throw err; // Propagate the error
    }

    // Return any response if needed
    return {
        statusCode: 200,
        body: 'Lambda function executed successfully!'
    };
  return {
    statusCode: 200,
    body: data
  };
}