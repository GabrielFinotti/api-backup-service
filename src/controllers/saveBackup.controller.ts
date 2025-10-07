import { BackupDataInputDTO } from "@/interface/backupDataInput.dto";
import BackupService from "@/services/backup.service";
import { Request, Response } from "express";

const saveBackupController = async (req: Request, res: Response) => {
  try {
    const backupDataService = new BackupService();
    const body = req.body as BackupDataInputDTO;
    const requestUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

    if (!body) {
      return res.status(400).json({
        status: "error",
        statusCode: 400,
        message: "Requisição inválida",
        data: null,
      });
    }

    const result = await backupDataService.saveBackup(body, requestUrl);

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

export default saveBackupController;
