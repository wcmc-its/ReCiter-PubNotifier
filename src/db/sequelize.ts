import {sequelize} from "../config/db.config";
import { initModels } from './models/init-models';

const models = initModels(sequelize);

export default models;