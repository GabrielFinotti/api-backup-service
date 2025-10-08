import express from "express";
import dotenv from "dotenv";
import authMiddleware from "./middlewares/auth.middleware";
import backupRoute from "./routes/backup.route";
import { testConnection } from "./database/config/createConnection";

dotenv.config({ quiet: process.env.NODE_ENV === "production" });

const app = express();
const PORT = process.env.PORT;

if (!PORT) {
  throw new Error("Defina a variável de ambiente PORT no arquivo .env");
}

app.use(express.json());

app.get("/api/health", (_, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", authMiddleware, backupRoute);

app.listen(PORT, async () => {
  try {
    const isConnected = await testConnection();

    if (!isConnected) {
      throw new Error(
        "Não foi possível conectar ao banco de dados. Encerrando o serviço..."
      );
    }

    console.log(`Servidor rodando na porta ${PORT}`);
  } catch (error) {
    console.error("Falha ao iniciar o servidor:", error);

    process.exit(1);
  }
});
