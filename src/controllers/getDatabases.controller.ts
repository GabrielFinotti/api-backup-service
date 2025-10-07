import BackupService from "@/services/backup.service";
import { Request, Response } from "express";

const getDatabasesController = async (_req: Request, res: Response) => {
  try {
    const backupDataService = new BackupService();

    const result = await backupDataService.getDatabases();

    return res.status(result.statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      statusCode: 500,
      message: "Ocorreu um erro interno no servidor",
      data: null,
    });
  }
};

export default getDatabasesController;
