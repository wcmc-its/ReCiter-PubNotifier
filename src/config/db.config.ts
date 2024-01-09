import { Sequelize } from "sequelize"
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.RECITER_DB_NAME || "",
    process.env.RECITER_DB_USERNAME || "",
    process.env.RECITER_DB_PASSWORD,
    {
        dialect: 'mysql',
        dialectOptions: {
            connectTimeout: 120000, // 60 seconds
        },
        host:  process.env.RECITER_DB_HOST  ,
        port: 3306,
        pool: {
            max: 20,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
})

export default sequelize