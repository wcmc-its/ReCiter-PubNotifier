import {initSequelizeModels} from '../db/sequelize';
import {initializeSequelize} from "../config/db.config";
import * as Handlebars from "handlebars";
import {sendEmailNotification} from '../utils/emailUtilityHelper';
import { Sequelize } from 'sequelize';

var acceptAndSuggestPubs:any[] = []; 
export const sendPubEmailNotifications = async (
  ) => {
  try {

    const sequelize:Sequelize = await initializeSequelize();
    const models:any = await initSequelizeModels();
    const generateEmailNotifications: any = await sequelize.query(
      "CALL generateEmailNotifications ('','')",
      {
        raw: true,
      }
    );

    if(generateEmailNotifications.length > 0){
        await processPubNotification(generateEmailNotifications);
        const result = await sequelize.transaction(async (t) => {
        return await models.AdminNotificationLog.bulkCreate(acceptAndSuggestPubs, { transaction: t,benchmark: true })
      });
      }else{
        let noData = {
          message: "Could not find any notifications"
        }
       
      }
										 
  } catch (e) {
    console.log(e);
  }
}


export async function processPubNotification(pubDetails:any) {
    
  const fromAddress =
    process.env.NODE_ENV === "production"
      ? '"Reciter Pub Manager" <publications@med.cornell.edu>'
      : '"Reciter Pub Manager Test" <doNotReply@med.cornell.edu>';
  let successEmailNotifPersonIdentifiers:string[] =[];
  let personIdentifierCount:number = 0;
  const data = pubDetails.map(async (pubRec:any) => {
     personIdentifierCount = personIdentifierCount + 1;
    let { admin_user_id,sender,recipient,subject,salutation, accepted_subject_headline,accepted_publications,suggested_subject_headline,suggested_publications,signature,max_accepted_publication_to_display,max_suggested_publication_to_display,personIdentifier,accepted_pub_count,suggested_pub_count,accepted_publication_det,suggested_publication_det,max_message_id } = JSON.parse(JSON.stringify(pubRec))
   
      let messageId = max_message_id + personIdentifierCount; 
      let acceptedPublicationArray = accepted_publications && accepted_publications.length > 0 && accepted_publications.indexOf('~!,') > -1 ? accepted_publications.split('~!,') : accepted_publications.split('~!');
      let suggestedPublicationArray = suggested_publications && suggested_publications.length > 0 && suggested_publications.indexOf('~!,') > -1 ? suggested_publications.split('~!,'): suggested_publications.split('~!');

      if ((acceptedPublicationArray && acceptedPublicationArray.length > 0) || (suggestedPublicationArray && suggestedPublicationArray.length > 0))
       {  
          const emailNotificationTemplate = `<div style="font-family: Arial; font-size : 11pt"><p>{{salutation}},</p>
                        <p>{{acceptedSubjectHeadline}}</p>
                        <div>{{#each_limit acceptedPublicationArray maxAcceptedPublicationToDisplay}}
                              <ul style="margin-bottom: 0 !important; padding-bottom:0 !important; margin:0">
                                  <li style="margin-bottom: 0 !important; padding:0 0 1em 0 !important" >{{this}}</li>
                              </ul>
                        {{/each_limit}}</div>
                        <p>{{suggestedSubjectHeadline}}</p>
                        <div>{{#each_limit suggestedPublicationArray maxSuggestedPublicationToDisplay}}
                            <ul style="margin-bottom: 0 !important; padding-bottom:0 !important; margin:0">
                                  <li style="margin-bottom: 0 !important; padding:0 0 1em 0 !important">{{this}}</li>
                            </ul>
                        {{/each_limit}}</div>
                        <p><b>Review and update:</b> {{seeMore acceptedPubCount suggestedPubCount personIdentifierProfileLink 'ACCEPTED' 'SUGGESTED' navigateToCurateSelfPage }}. To update your notification preferences, navigate to the Notifications tab.
                        <pre><span style="color:#00000; font-family: Arial; font-size : 11pt !important" >{{signature}}</span></pre>
                        </p></div>`;
          var template = Handlebars.compile(emailNotificationTemplate);
              var replacements = {
                  salutation : salutation,
                  acceptedSubjectHeadline : accepted_subject_headline,
                  acceptedPublicationArray : acceptedPublicationArray,
                  suggestedSubjectHeadline: suggested_subject_headline,
                  suggestedPublicationArray : suggestedPublicationArray,
                  signature : signature,
                  maxAcceptedPublicationToDisplay:max_accepted_publication_to_display,
                  maxSuggestedPublicationToDisplay:max_suggested_publication_to_display,
                  acceptedPubCount : accepted_pub_count,
                  suggestedPubCount : suggested_pub_count,
                  notificationsLink : '',
                  personIdentifierProfileLink : '',
                  navigateToCurateSelfPage : ''
              };
              var emailBody = template(replacements);     
          let mailOptions = {
            from: sender || fromAddress,
            to: recipient, // admin_users.email || recipient  to: 
            subject: subject,
            html: emailBody
          }
          let emailInfo = await sendEmailNotification(mailOptions) 
            if(emailInfo && personIdentifier)
            {
               // successEmailNotifPersonIdentifiers.push(personIdentifier);
                //calling upon sending successful email notifications
                await saveNotificationsLog(admin_user_id, recipient, accepted_pub_count,accepted_publication_det,suggested_pub_count, suggested_publication_det,messageId)
                
            }
      }
    
});

    const emailNotificationDetails = await Promise.all(data);
     //Preparing an object for the messages
     if(emailNotificationDetails)
     {
        let emailNotificationPubMsgDetails = 
        {
          "successEmailNotifMsg": successEmailNotifPersonIdentifiers && successEmailNotifPersonIdentifiers.length > 0 ? `Email for ${successEmailNotifPersonIdentifiers.join()} sent to` :'' 
        }
        return emailNotificationPubMsgDetails;
      }
 }


export async function saveNotificationsLog (admin_user_id:string,recipient:string,accepted_pub_count:number,accepted_publication_det:any,suggested_pub_count:number,suggested_publication_det:any,messageId:number) {
  
  try {
    //let acceptAndSuggestPubs:any[] = [];
    if(accepted_pub_count > 0 && !accepted_publication_det) console.error('Unable to save Notification log due to missing accepted publication details',admin_user_id, (accepted_publication_det? accepted_publication_det.length:0));  

    accepted_publication_det && JSON.parse(accepted_publication_det)  && JSON.parse(accepted_publication_det).length > 0 && JSON.parse(accepted_publication_det).map((pub:any)=>{
    let obj = {
          'messageID': messageId,
          'pmid': pub.PMID,
          'articleScore': pub.totalArticleScoreStandardized,
          'email': recipient, 
          'userID': admin_user_id,
          'dateSent': new Date(),
          'createTimestamp': new Date(),
          'notificationType': 'Accepted'
    }
      acceptAndSuggestPubs.push(obj)
    }
    )
    if(suggested_pub_count > 0 && !suggested_publication_det) console.error('Unable to save Notification log due to missing suggested publication details',admin_user_id,(suggested_publication_det?suggested_publication_det.length : 0));

    suggested_publication_det && JSON.parse(suggested_publication_det) && JSON.parse(suggested_publication_det).length > 0 && JSON.parse(suggested_publication_det).map((pub:any)=>{
      let obj = {
            'messageID': messageId ,
            'pmid': pub.PMID,
            'articleScore': pub.totalArticleScoreStandardized,
            'email': recipient, 
            'userID': admin_user_id,
            'dateSent': new Date(),
            'createTimestamp': new Date(),
            'notificationType':'Suggested'
      }
        acceptAndSuggestPubs.push(obj);
      }
      )

  } catch (e) {
      console.log(e);
      
  }
  
}

Handlebars.registerHelper('each_limit', function(ary:any, max:number, options:any) {
  if(!ary || ary.length == 0 || ary=='')
      return options.inverse();

  var result = [];
  for(var i = 0; i < max && i < ary.length; ++i)
  {
      result.push(options.fn(ary[i]));
  }
  return result.length > 0?result.join(''):'';
});


Handlebars.registerHelper("link", function(text, url) {
  let url1 = Handlebars.escapeExpression(url),
      text1 = Handlebars.escapeExpression(text)
      
 return new Handlebars.SafeString("<a href='" + url1 + "' style='text-decoration:none' "+" target='_blank'>" + text1 +"</a>");
});

Handlebars.registerHelper("seeMore", function(acceptedPubCount, suggestedPubCount, personIdentifierProfileLink, accepetedText, suggestedText,navigateToCurateSelfPage ) {
  let acceptedPubCount1 = Handlebars.escapeExpression(acceptedPubCount),
      suggestedPubCount1 = Handlebars.escapeExpression(suggestedPubCount),
      personIdentifierProfileLink1 = Handlebars.escapeExpression(personIdentifierProfileLink),
      accepetedText1 = Handlebars.escapeExpression(accepetedText),
      suggestedText1 = Handlebars.escapeExpression(suggestedText),
      navigateToCurateSelfPage1 = Handlebars.escapeExpression(navigateToCurateSelfPage)

      if(acceptedPubCount1  && suggestedPubCount1){
        return new Handlebars.SafeString("There are currently "+ suggestedPubCount1 +" pending and "+ acceptedPubCount1 +" newly accepted publications linked to <a href='" + navigateToCurateSelfPage1 + "' style='text-decoration:none; font-size: 11pt' "+" target='_blank'> your profile</a>") 
      }else if(!acceptedPubCount1  && suggestedPubCount1){
        return new Handlebars.SafeString("There are currently "+ suggestedPubCount1 +" pending publications linked to <a href='" + personIdentifierProfileLink1 + "' style='text-decoration:none; font-size: 11pt' "+" target='_blank'> your profile</a>") 
      }else if(acceptedPubCount1  && !suggestedPubCount1){
        return new Handlebars.SafeString("There are currently "+ acceptedPubCount1 +" newly accepted publications linked to <a href='" + personIdentifierProfileLink1 + "' style='text-decoration:none; font-size: 11pt' "+" target='_blank'> your profile</a>") 
      }
});
