import saveBackupController from "@/controllers/saveBackup.controller";
import recoverDataController from "@/controllers/recoverData.controller";
import getLogsController from "@/controllers/getLogs.controller";
import getDatabasesController from "@/controllers/getDatabases.controller";
import { Router } from "express";

const route = Router();

route.post("/backup", saveBackupController);
route.post("/recover", recoverDataController);
route.post("/logs", getLogsController);
route.get("/databases", getDatabasesController);

const backupRoute = route;

export default backupRoute;
