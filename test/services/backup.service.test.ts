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
    it("deve salvar o backup com sucesso", async () => {
      const mockCollection = {
        drop: jest.fn().mockResolvedValue(undefined),
        insertOne: jest.fn().mockResolvedValue(undefined),
      };

      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
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

      const url = "http://example.com";

      const result = await service.saveBackup(input, url);

      expect(mockCreateMongoConnection).toHaveBeenCalledWith("testDB");
      expect(mockDb.collection).toHaveBeenCalledWith("testCollection");
      expect(mockCollection.drop).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalledWith({
        ...input,
        date: expect.any(String),
        url,
      });
      expect(mockConnection.disconnect).toHaveBeenCalled();
      expect(result).toEqual({
        status: "success",
        statusCode: 200,
        message: "Backup salvo com sucesso",
        data: expect.objectContaining({
          ...input,
          date: expect.any(String),
          url,
        }),
      });
    });

    it("deve retornar erro se a conexão falhar", async () => {
      const error = new Error("Connection failed");
      mockCreateMongoConnection.mockRejectedValue(error);

      const input: BackupDataInputDTO = {
        database: "testDB",
        collectionsName: "testCollection",
        data: { key: "value" },
      };

      const url = "http://example.com";

      const result = await service.saveBackup(input, url);

      expect(result).toEqual({
        status: "error",
        statusCode: 500,
        message: "Connection failed",
        data: null,
      });
    });
  });
});
