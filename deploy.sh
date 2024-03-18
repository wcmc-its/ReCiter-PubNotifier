set -x -e

# DEVELOPMENT ALIAS VERSION
aws lambda get-alias \
 --function-name $DEPLOY_FUNCTION_NAME \
 --name $DEPLOY_ALIAS_NAME \
  > output.json
  
DEVELOPMENT_ALIAS_VERSION=$(cat output.json | jq -r '.FunctionVersion')

# UPDATE FUNCTION CODE
aws lambda update-function-code \
 --function-name $DEPLOY_FUNCTION_NAME \
 --s3-bucket reciterpubmgrnotifications \
 --s3-key Reciter-PubNotifier.zip \
 --publish \
 > output.json
 
LATEST_VERSION=$(cat output.json | jq -r '.Version')


# NO DEPLOYMENT NEEDED EXIT
if [[ $DEVELOPMENT_ALIAS_VERSION -ge $LATEST_VERSION ]] ; then
exit 0
fi

# CREATE APPSPEC FILE AND UPLOAD TO S3 BUCKET
cat > appspec.yml <<EOM
version: 0.0
Resources:
  - CDLambda:
      Type: AWS::Lambda::Function
      Properties:
        Name: "$DEPLOY_FUNCTION_NAME"
        Alias: "$DEPLOY_ALIAS_NAME"
        CurrentVersion: "$DEVELOPMENT_ALIAS_VERSION"
        TargetVersion: "$LATEST_VERSION"
EOM