import type { Sequelize } from "sequelize";
import { AdminNotificationLog } from "./AdminNotificationLog";
import type { AdminNotificationLogAttributes, AdminNotificationLogCreationAttributes } from "./AdminNotificationLog";
import { AdminNotificationPreference } from "./AdminNotificationPreference";
import type { AdminNotificationPreferenceAttributes, AdminNotificationPreferenceCreationAttributes } from "./AdminNotificationPreference";
import { AdminUser } from "./AdminUser";
import type { AdminUserAttributes, AdminUserCreationAttributes } from "./AdminUser";

export {
  AdminNotificationLog,
  AdminNotificationPreference,
  AdminUser,

};

export type {
  AdminNotificationLogAttributes,
  AdminNotificationLogCreationAttributes,
  AdminNotificationPreferenceAttributes,
  AdminNotificationPreferenceCreationAttributes,
  AdminUserAttributes,
  AdminUserCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  AdminNotificationLog.initModel(sequelize);
  AdminNotificationPreference.initModel(sequelize);
  AdminUser.initModel(sequelize);

  
  AdminNotificationLog.belongsTo(AdminUser, { as: "user", foreignKey: "userID"});
  AdminUser.hasMany(AdminNotificationLog, { as: "adminNotificationLogs", foreignKey: "userID"});
  AdminNotificationPreference.belongsTo(AdminUser, { as: "user", foreignKey: "userID"});
  AdminUser.hasMany(AdminNotificationPreference, { as: "adminNotificationPreferences", foreignKey: "userID"});
  
  return {
    
    AdminNotificationLog: AdminNotificationLog,
    AdminNotificationPreference: AdminNotificationPreference,
    AdminUser: AdminUser,
   
  };
}
