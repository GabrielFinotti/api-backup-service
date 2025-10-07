import { GetLogsDTO } from "@/interface/backupDataInput.dto";
import BackupService from "@/services/backup.service";
import { Request, Response } from "express";

const getLogsController = async (req: Request, res: Response) => {
  try {
    const backupDataService = new BackupService();
    const body = req.body as GetLogsDTO;

    if (!body || !body.database) {
      return res.status(400).json({
        status: "error",
        statusCode: 400,
        message: "Requisição inválida. É necessário informar 'database'.",
        data: null,
      });
    }

    const result = await backupDataService.getLogs(body);

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

export default getLogsController;
