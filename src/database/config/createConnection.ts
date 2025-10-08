import mongoose from "mongoose";

const createMongoConnection = async (dbName: string) => {
  let retryCount = 0;

  try {
    const instance = await mongoose.connect(process.env.MONGO_URI as string, {
      dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`Conectado ao MongoDB, Banco: ${dbName}`);

    return instance;
  } catch (error) {
    if (error instanceof mongoose.Error) {
      if (retryCount <= 5) {
        console.log(
          `Tentando reconectar ao MongoDB... (tentativa ${retryCount + 1})`
        );

        retryCount += 1;

        setTimeout(() => createMongoConnection(dbName), 5000);
      }

      throw new Error(
        `Não foi possível conectar ao MongoDB após várias tentativas. Erro: ${error.message}`
      );
    }

    throw error;
  }
};

export const testConnection = async (): Promise<boolean> => {
  try {
    console.log("Testando conexão com MongoDB...");

    const instance = await mongoose.connect(process.env.MONGO_URI as string, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(" Conexão com MongoDB estabelecida com sucesso!");

    await instance.disconnect();

    return true;
  } catch (error) {
    if (error instanceof mongoose.Error) {
      console.error(`Falha ao conectar ao MongoDB: ${error.message}`);
    } else {
      console.error(`Erro desconhecido ao testar conexão: ${error}`);
    }

    return false;
  }
};

export default createMongoConnection;
