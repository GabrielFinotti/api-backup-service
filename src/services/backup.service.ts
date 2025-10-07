import createMongoConnection from "@/database/config/createConnection";
import { BackupDataInputDTO } from "@/interface/backupDataInput.dto";

class BackupService {
  async saveBackup(data: BackupDataInputDTO, url: string) {
    try {
      const newConnection = await createMongoConnection(data.database);
      const db = newConnection.connection.db;
      const collection = db.collection(data.collectionsName);

      console.log("Iniciando o processo de backup...");

      try {
        console.log("Tentando dropar a coleção se existir...");

        await collection.drop();

        console.log("Coleção dropada com sucesso.");
      } catch (error) {
        console.log("Coleção não encontrada, criando uma nova...");
      }

      const backupData: BackupDataInputDTO & { date: string; url: string } = {
        ...data,
        date: new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        url,
      };

      await collection.insertOne(backupData);

      await newConnection.disconnect();

      return {
        status: "success",
        statusCode: 200,
        message: "Backup salvo com sucesso",
        data: backupData,
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error ao tentar salvar o backup: ${error.message}`);

        return {
          status: "error",
          statusCode: 500,
          message: error.message,
          data: null,
        };
      }

      return {
        status: "error",
        statusCode: 500,
        message: "Ocorreu um erro desconhecido ao tentar salvar o backup",
        data: null,
      };
    }
  }
}

export default BackupService;
