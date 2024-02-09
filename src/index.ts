import { sendPubEmailNotifications } from "./notifications/notifications.sendEmail.controller";

const assert = require('assert');
const http = require('http');
const AWS = require('aws-sdk');

export async function handler(event: any, context: any): Promise<any> {
  const codepipeline = new AWS.CodePipeline();	
  const data = await sendPubEmailNotifications();
    
    // Retrieve the Job ID from the Lambda action
    var jobId = event["CodePipeline.job"].id;
    
    // Retrieve the value of UserParameters from the Lambda action configuration in CodePipeline, in this case a URL which will be
    // health checked by this function.
    var url = event["CodePipeline.job"].data.actionConfiguration.configuration.UserParameters; 
    
    // Notify CodePipeline of a successful job
    var putJobSuccess = function(message:string) {
        var params = {
            jobId: jobId
        };
        codepipeline.putJobSuccessResult(params, function(err:any, data:any) {
            if(err) {
                context.fail(err);      
            } else {
                context.succeed(message);      
            }
        });
    };
    
    // Notify CodePipeline of a failed job
    var putJobFailure = function(message:any) {
        var params = {
            jobId: jobId,
            failureDetails: {
                message: JSON.stringify(message),
                type: 'JobFailed',
                externalExecutionId: context.awsRequestId
            }
        };
        codepipeline.putJobFailureResult(params, function(err:any, data:any) {
            context.fail(message);      
        });
    };
    
    // Validate the URL passed in UserParameters
    if(!url || url.indexOf('http://') === -1) {
        putJobFailure('The UserParameters field must contain a valid URL address to test, including http:// or https://');  
        return;
    }
    
    // Helper function to make a HTTP GET request to the page.
    // The helper will test the response and succeed or fail the job accordingly 
    var getPage = function(url:string, callback:any) {
        var pageObject = {
            body: '',
            statusCode: 0,
            contains: function(search:any) {
                return this.body.indexOf(search) > -1;    
            }
        };
        http.get(url, function(response:any) {
            pageObject.body = '';
            pageObject.statusCode = response.statusCode;
            
            response.on('data', function (chunk:any) {
                pageObject.body += chunk;
            });
            
            response.on('end', function () {
                callback(pageObject);
            });
            
            response.resume(); 
        }).on('error', function(error:string) {
            // Fail the job if our request failed
            putJobFailure(error);    
        });           
    };
    
    getPage(url, function(returnedPage:any) {
        try {
            // Check if the HTTP response has a 200 status
            assert(returnedPage.statusCode === 200);
            // Check if the page contains the text "Congratulations"
            // You can change this to check for different text, or add other tests as required
            assert(returnedPage.contains('Congratulations'));  
            
            // Succeed the job
            putJobSuccess("Tests passed.");
        } catch (ex) {
            // If any of the assertions failed then fail the job
            putJobFailure(ex);    
        }
    });
 /* try {
        await codepipeline.putJobSuccessResult({
            jobId: event["ReciterPubMgrEmailNotificationTrigger.job"].id
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
  };*/
}



