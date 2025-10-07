import BackupService from "../../src/services/backup.service";
import { BackupDataInputDTO } from "../../src/interface/backupDataInput.dto";
import createMongoConnection from "../../src/database/config/createConnection";

jest.mock("../../src/database/config/createConnection");
jest.mock("mongoose", () => ({
  disconnect: jest.fn(),
}));

describe("BackupService", () => {
  let service: BackupService;
  const mockCreateMongoConnection =
    createMongoConnection as jest.MockedFunction<typeof createMongoConnection>;

  beforeEach(() => {
    service = new BackupService();
    jest.clearAllMocks();
  });

  describe("saveBackup", () => {
    it("deve salvar o backup com sucesso com array de dados", async () => {
      const mockCollection = {
        drop: jest.fn().mockResolvedValue(undefined),
        insertMany: jest.fn().mockResolvedValue(undefined),
      };

      const mockLogsCollection = {
        updateOne: jest.fn().mockResolvedValue(undefined),
      };

      const mockDb = {
        collection: jest.fn((name: string) => {
          if (name === "backup_logs") {
            return mockLogsCollection;
          }
          return mockCollection;
        }),
      };

      const mockConnection = {
        connection: { db: mockDb },
        disconnect: jest.fn().mockResolvedValue(undefined),
      };

      mockCreateMongoConnection.mockResolvedValue(mockConnection as any);

      const input: BackupDataInputDTO = {
        database: "testDB",
        collectionsName: "testCollection",
        data: [{ key: "value1" }, { key: "value2" }],
      };

      const result = await service.saveBackup(input);

      expect(mockCreateMongoConnection).toHaveBeenCalledWith("testDB");
      expect(mockDb.collection).toHaveBeenCalledWith("testCollection");
      expect(mockDb.collection).toHaveBeenCalledWith("backup_logs");
      expect(mockCollection.drop).toHaveBeenCalled();
      expect(mockCollection.insertMany).toHaveBeenCalledWith(input.data);
      expect(mockLogsCollection.updateOne).toHaveBeenCalledWith(
        { collectionsName: "testCollection" },
        {
          $set: expect.objectContaining({
            database: "testDB",
            collectionsName: "testCollection",
            date: expect.any(String),
            timestamp: expect.any(Date),
          }),
        },
        { upsert: true }
      );
      expect(mockConnection.disconnect).toHaveBeenCalled();
      expect(result).toEqual({
        status: "success",
        statusCode: 200,
        message: "Backup salvo com sucesso",
        data: {
          itemCount: 2,
          log: expect.objectContaining({
            database: "testDB",
            collectionsName: "testCollection",
            date: expect.any(String),
            timestamp: expect.any(Date),
          }),
        },
      });
    });

    it("deve salvar o backup com sucesso com objeto único", async () => {
      const mockCollection = {
        drop: jest.fn().mockResolvedValue(undefined),
        insertOne: jest.fn().mockResolvedValue(undefined),
      };

      const mockLogsCollection = {
        updateOne: jest.fn().mockResolvedValue(undefined),
      };

      const mockDb = {
        collection: jest.fn((name: string) => {
          if (name === "backup_logs") {
            return mockLogsCollection;
          }
          return mockCollection;
        }),
      };

      const mockConnection = {
        connection: { db: mockDb },
        disconnect: jest.fn().mockResolvedValue(undefined),
      };

      mockCreateMongoConnection.mockResolvedValue(mockConnection as any);

      const input: BackupDataInputDTO = {
        database: "testDB",
        collectionsName: "testCollection",
        data: { key: "value" },
      };

      const result = await service.saveBackup(input);

      expect(mockCreateMongoConnection).toHaveBeenCalledWith("testDB");
      expect(mockDb.collection).toHaveBeenCalledWith("testCollection");
      expect(mockDb.collection).toHaveBeenCalledWith("backup_logs");
      expect(mockCollection.drop).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(input.data);
      expect(mockConnection.disconnect).toHaveBeenCalled();
      expect(result).toEqual({
        status: "success",
        statusCode: 200,
        message: "Backup salvo com sucesso",
        data: {
          itemCount: 1,
          log: expect.objectContaining({
            database: "testDB",
            collectionsName: "testCollection",
            date: expect.any(String),
            timestamp: expect.any(Date),
          }),
        },
      });
    });

    it("deve sanitizar dados com chaves começando com $", async () => {
      const mockCollection = {
        drop: jest.fn().mockResolvedValue(undefined),
        insertMany: jest.fn().mockResolvedValue(undefined),
      };

      const mockLogsCollection = {
        updateOne: jest.fn().mockResolvedValue(undefined),
      };

      const mockDb = {
        collection: jest.fn((name: string) => {
          if (name === "backup_logs") {
            return mockLogsCollection;
          }
          return mockCollection;
        }),
      };

      const mockConnection = {
        connection: { db: mockDb },
        disconnect: jest.fn().mockResolvedValue(undefined),
      };

      mockCreateMongoConnection.mockResolvedValue(mockConnection as any);

      const input: BackupDataInputDTO = {
        database: "testDB",
        collectionsName: "testCollection",
        data: [
          { key: "value1", $numberDecimal: "123.45" },
          { key: "value2", normalField: "test" }
        ],
      };

      const result = await service.saveBackup(input);

      // Verifica se as chaves com $ foram removidas
      expect(mockCollection.insertMany).toHaveBeenCalledWith([
        { key: "value1" },
        { key: "value2", normalField: "test" }
      ]);
      expect(result.status).toBe("success");
      expect(result.data?.itemCount).toBe(2);
    });

    it("deve retornar erro se a conexão falhar", async () => {
      const error = new Error("Connection failed");
      mockCreateMongoConnection.mockRejectedValue(error);

      const input: BackupDataInputDTO = {
        database: "testDB",
        collectionsName: "testCollection",
        data: { key: "value" },
      };

      const result = await service.saveBackup(input);

      expect(result).toEqual({
        status: "error",
        statusCode: 500,
        message: "Connection failed",
        data: null,
      });
    });
  });
});
