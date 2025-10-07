import { RecoverDataDTO } from "@/interface/backupDataInput.dto";
import BackupService from "@/services/backup.service";
import { Request, Response } from "express";

const recoverDataController = async (req: Request, res: Response) => {
  try {
    const backupDataService = new BackupService();
    const body = req.body as RecoverDataDTO;

    if (!body || !body.database || !body.collectionName) {
      return res.status(400).json({
        status: "error",
        statusCode: 400,
        message:
          "Requisição inválida. É necessário informar 'database' e 'collectionName'.",
        data: null,
      });
    }

    const result = await backupDataService.recoverData(body);

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

export default recoverDataController;
