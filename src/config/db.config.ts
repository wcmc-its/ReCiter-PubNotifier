import { Sequelize} from "sequelize";
import  {getSecret} from '../utils/secretsManager';

require("dotenv").config();

   
export async function initializeSequelize() {

    try {
        // Retrieve secrets from AWS Secrets Manager
            const reciterPubSecretManager = process.env.RECITER_PUB_SECRET_MANAGER || '';
            const dbSecrets = await getSecret( reciterPubSecretManager);
            const { RECITER_DB_NAME,RECITER_DB_USERNAME,RECITER_DB_PASSWORD,RECITER_DB_HOST,RECITER_DB_REGION, RECITER_DB_PORT } = dbSecrets;
            const sequelize = new Sequelize(
                RECITER_DB_NAME || process.env.RECITER_DB_NAME || "",
                RECITER_DB_USERNAME || process.env.RECITER_DB_USERNAME || "",
                RECITER_DB_PASSWORD || process.env.RECITER_DB_PASSWORD || "",
                {
                    dialect: 'mysql',
                    dialectOptions: {
                        connectTimeout: 120000, // 60 seconds
                    },
                    host: RECITER_DB_HOST || process.env.RECITER_DB_HOST  ,
                    port:  RECITER_DB_PORT || 3306,
                    pool: {
                        max: 20,
                        min: 0,
                        acquire: 30000,
                        idle: 10000
                    }
                }
            );
            return sequelize; 
        }
        catch (error) {
            console.error('Error initializing Sequelize:', error);
            throw error;
          }
    }