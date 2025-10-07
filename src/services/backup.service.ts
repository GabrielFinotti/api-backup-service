import createMongoConnection from "@/database/config/createConnection";
import { BackupDataInputDTO } from "@/interface/backupDataInput.dto";

class BackupService {
  async saveBackup(data: BackupDataInputDTO) {
    try {
      const newConnection = await createMongoConnection(data.database);
      const db = newConnection.connection.db;
      const collection = db.collection(data.collectionsName);
      const logsCollection = db.collection("backup_logs");

      console.log(
        `Iniciando o processo de backup da coleção ${data.collectionsName}...`
      );

      try {
        console.log(
          `Tentando dropar a coleção ${data.collectionsName} se existir...`
        );

        await collection.drop();

        console.log(`Coleção ${data.collectionsName} dropada com sucesso.`);
      } catch (error) {
        console.log(
          `Coleção ${data.collectionsName} não encontrada, criando uma nova...`
        );
      }

      // Sanitiza os dados removendo chaves que começam com $ (MongoDB reserved)
      const sanitizeData = (obj: any): any => {
        if (obj === null || obj === undefined) return obj;

        if (Array.isArray(obj)) {
          return obj.map((item) => sanitizeData(item));
        }

        if (typeof obj === "object" && obj.constructor === Object) {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(obj)) {
            // Remove chaves que começam com $ ou são tipos internos do MongoDB
            if (!key.startsWith("$")) {
              sanitized[key] = sanitizeData(value);
            }
          }
          return sanitized;
        }

        return obj;
      };

      const sanitizedData = sanitizeData(data.data);

      // Usa insertMany para arrays, insertOne para objetos únicos
      let itemCount: number;
      if (Array.isArray(sanitizedData)) {
        if (sanitizedData.length > 0) {
          await collection.insertMany(sanitizedData);
          itemCount = sanitizedData.length;
        } else {
          itemCount = 0;
        }
      } else {
        await collection.insertOne(sanitizedData);
        itemCount = 1;
      }

      // Atualiza os logs em uma coleção separada
      const logEntry = {
        database: data.database,
        collectionsName: data.collectionsName,
        date: new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        timestamp: new Date(),
      };

      await logsCollection.updateOne(
        { collectionsName: data.collectionsName },
        { $set: logEntry },
        { upsert: true }
      );

      await newConnection.disconnect();

      console.log(`Backup da coleção ${data.collectionsName} salvo com sucesso.`);

      return {
        status: "success",
        statusCode: 200,
        message: "Backup salvo com sucesso",
        data: {
          itemCount,
          log: logEntry,
        },
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
