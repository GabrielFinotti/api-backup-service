import express from "express";
import dotenv from "dotenv";
import createMongoConnection from "./database/config/createConnection";

dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT;

if (!PORT) {
  throw new Error("Defina a variável de ambiente PORT no arquivo .env");
}

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, async () => {
  try {
    await createMongoConnection("backup_service");

    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  } catch (error) {
    console.error("Falha ao iniciar o servidor:", error);
  }
});

export { app };
