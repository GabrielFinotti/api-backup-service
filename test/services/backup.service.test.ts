import BackupService from "../../src/services/backup.service";
import {
  BackupDataInputDTO,
  RecoverDataDTO,
  GetLogsDTO,
} from "../../src/interface/backupDataInput.dto";
import createMongoConnection from "../../src/database/config/createConnection";
import mongoose from "mongoose";

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
          { key: "value2", normalField: "test" },
        ],
      };

      const result = await service.saveBackup(input);

      // Verifica se as chaves com $ foram removidas
      expect(mockCollection.insertMany).toHaveBeenCalledWith([
        { key: "value1" },
        { key: "value2", normalField: "test" },
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

  describe("recoverData", () => {
    it("deve recuperar dados com sucesso", async () => {
      const mockDocuments = [
        { _id: "1", name: "doc1", value: 100 },
        { _id: "2", name: "doc2", value: 200 },
      ];

      const mockCollection = {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockDocuments),
        }),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      const mockConnection = {
        connection: { db: mockDb },
        disconnect: jest.fn().mockResolvedValue(undefined),
      };

      mockCreateMongoConnection.mockResolvedValue(mockConnection as any);

      const input: RecoverDataDTO = {
        database: "testDB",
        collectionName: "testCollection",
      };

      const result = await service.recoverData(input);

      expect(mockCreateMongoConnection).toHaveBeenCalledWith("testDB");
      expect(mockDb.collection).toHaveBeenCalledWith("testCollection");
      expect(mockCollection.find).toHaveBeenCalledWith({});
      expect(mockConnection.disconnect).toHaveBeenCalled();
      expect(result).toEqual({
        status: "success",
        statusCode: 200,
        message: "Dados recuperados com sucesso",
        data: {
          collectionName: "testCollection",
          database: "testDB",
          documentCount: 2,
          documents: mockDocuments,
        },
      });
    });

    it("deve retornar array vazio quando não há documentos", async () => {
      const mockCollection = {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      const mockConnection = {
        connection: { db: mockDb },
        disconnect: jest.fn().mockResolvedValue(undefined),
      };

      mockCreateMongoConnection.mockResolvedValue(mockConnection as any);

      const input: RecoverDataDTO = {
        database: "testDB",
        collectionName: "emptyCollection",
      };

      const result = await service.recoverData(input);

      expect(result.status).toBe("success");
      expect(result.data?.documentCount).toBe(0);
      expect(result.data?.documents).toEqual([]);
    });

    it("deve retornar erro se a conexão falhar", async () => {
      const error = new Error("Connection failed");
      mockCreateMongoConnection.mockRejectedValue(error);

      const input: RecoverDataDTO = {
        database: "testDB",
        collectionName: "testCollection",
      };

      const result = await service.recoverData(input);

      expect(result).toEqual({
        status: "error",
        statusCode: 500,
        message: "Connection failed",
        data: null,
      });
    });
  });

  describe("getLogs", () => {
    it("deve recuperar logs com sucesso", async () => {
      const mockLogs = [
        {
          database: "testDB",
          collectionsName: "collection1",
          date: "01/01/2025",
          timestamp: new Date(),
        },
        {
          database: "testDB",
          collectionsName: "collection2",
          date: "02/01/2025",
          timestamp: new Date(),
        },
      ];

      const mockLogsCollection = {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockLogs),
        }),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockLogsCollection),
      };

      const mockConnection = {
        connection: { db: mockDb },
        disconnect: jest.fn().mockResolvedValue(undefined),
      };

      mockCreateMongoConnection.mockResolvedValue(mockConnection as any);

      const input: GetLogsDTO = {
        database: "testDB",
      };

      const result = await service.getLogs(input);

      expect(mockCreateMongoConnection).toHaveBeenCalledWith("testDB");
      expect(mockDb.collection).toHaveBeenCalledWith("backup_logs");
      expect(mockLogsCollection.find).toHaveBeenCalledWith({});
      expect(mockConnection.disconnect).toHaveBeenCalled();
      expect(result).toEqual({
        status: "success",
        statusCode: 200,
        message: "Logs recuperados com sucesso",
        data: {
          database: "testDB",
          logCount: 2,
          logs: mockLogs,
        },
      });
    });

    it("deve retornar array vazio quando não há logs", async () => {
      const mockLogsCollection = {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockLogsCollection),
      };

      const mockConnection = {
        connection: { db: mockDb },
        disconnect: jest.fn().mockResolvedValue(undefined),
      };

      mockCreateMongoConnection.mockResolvedValue(mockConnection as any);

      const input: GetLogsDTO = {
        database: "testDB",
      };

      const result = await service.getLogs(input);

      expect(result.status).toBe("success");
      expect(result.data?.logCount).toBe(0);
      expect(result.data?.logs).toEqual([]);
    });

    it("deve retornar erro se a conexão falhar", async () => {
      const error = new Error("Database connection error");
      mockCreateMongoConnection.mockRejectedValue(error);

      const input: GetLogsDTO = {
        database: "testDB",
      };

      const result = await service.getLogs(input);

      expect(result).toEqual({
        status: "error",
        statusCode: 500,
        message: "Database connection error",
        data: null,
      });
    });
  });

  describe("getDatabases", () => {
    it("deve listar databases com sucesso", async () => {
      const mockDatabases = [
        { name: "admin", sizeOnDisk: 40960, empty: false },
        { name: "testDB", sizeOnDisk: 8192000, empty: false },
        { name: "local", sizeOnDisk: 73728, empty: false },
      ];

      const mockAdmin = {
        listDatabases: jest.fn().mockResolvedValue({
          databases: mockDatabases,
          totalSize: 8306688,
          ok: 1,
        }),
      };

      const mockDb = {
        admin: jest.fn().mockReturnValue(mockAdmin),
      };

      const mockConnection = {
        connection: { db: mockDb },
        disconnect: jest.fn().mockResolvedValue(undefined),
      };

      // Mock do mongoose.connect
      (mongoose.connect as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockConnection);

      const result = await service.getDatabases();

      expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI, {
        dbName: "admin",
      });
      expect(mockDb.admin).toHaveBeenCalled();
      expect(mockAdmin.listDatabases).toHaveBeenCalled();
      expect(mockConnection.disconnect).toHaveBeenCalled();
      expect(result).toEqual({
        status: "success",
        statusCode: 200,
        message: "Databases recuperados com sucesso",
        data: {
          databaseCount: 3,
          databases: mockDatabases,
        },
      });
    });

    it("deve retornar erro se não conseguir acessar admin", async () => {
      const mockConnection = {
        connection: { db: undefined },
        disconnect: jest.fn().mockResolvedValue(undefined),
      };

      (mongoose.connect as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockConnection);

      const result = await service.getDatabases();

      expect(result).toEqual({
        status: "error",
        statusCode: 500,
        message: "Não foi possível acessar o admin do MongoDB",
        data: null,
      });
    });

    it("deve retornar erro se a conexão falhar", async () => {
      const error = new Error("MongoDB connection failed");
      (mongoose.connect as jest.Mock) = jest.fn().mockRejectedValue(error);

      const result = await service.getDatabases();

      expect(result).toEqual({
        status: "error",
        statusCode: 500,
        message: "MongoDB connection failed",
        data: null,
      });
    });

    it("deve formatar corretamente os dados dos databases", async () => {
      const mockDatabases = [
        {
          name: "testDB",
          sizeOnDisk: 1024,
          empty: true,
          extraField: "should be ignored",
        },
      ];

      const mockAdmin = {
        listDatabases: jest.fn().mockResolvedValue({
          databases: mockDatabases,
        }),
      };

      const mockDb = {
        admin: jest.fn().mockReturnValue(mockAdmin),
      };

      const mockConnection = {
        connection: { db: mockDb },
        disconnect: jest.fn().mockResolvedValue(undefined),
      };

      (mongoose.connect as jest.Mock) = jest
        .fn()
        .mockResolvedValue(mockConnection);

      const result = await service.getDatabases();

      expect(result.status).toBe("success");
      expect(result.data?.databases[0]).toEqual({
        name: "testDB",
        sizeOnDisk: 1024,
        empty: true,
      });
      // Verifica que campos extras não foram incluídos
      expect(result.data?.databases[0]).not.toHaveProperty("extraField");
    });
  });
});
