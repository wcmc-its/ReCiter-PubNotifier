import { Sequelize } from "sequelize";
import {initializeSequelize} from "../config/db.config";
import { initModels } from './models/init-models';


export async function initSequelizeModels() {
const sequelize:Sequelize = await  initializeSequelize();  
 const models = initModels(sequelize);
 return models;
}