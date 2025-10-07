import mongoose from "mongoose";

const createMongoConnection = async (dbName: string) => {
  let retryCount = 0;

  try {
    await mongoose.connect(process.env.MONGO_URI as string, {
      dbName,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`Conectado ao MongoDB, Banco: ${dbName}`);
  } catch (error) {
    if (error instanceof mongoose.Error) {
      console.error("Erro ao conectar ao MongoDB:", error.message);

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

export default createMongoConnection;
