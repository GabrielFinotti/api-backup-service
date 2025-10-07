import saveBackupController from "@/controllers/saveBackup.controller";
import { Router } from "express";

const route = Router();

route.post("/backup", saveBackupController);

const backupRoute = route;

export default backupRoute;
