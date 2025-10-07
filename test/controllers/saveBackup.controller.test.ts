import { Request, Response } from "express";
import saveBackupController from "../../src/controllers/saveBackup.controller";
import BackupService from "../../src/services/backup.service";
import { BackupDataInputDTO } from "../../src/interface/backupDataInput.dto";

jest.mock("../../src/services/backup.service");

describe("saveBackupController", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
    jest.clearAllMocks();
  });

  it("deve salvar backup com sucesso com array de dados", async () => {
    const mockSaveBackup = jest.fn().mockResolvedValue({
      status: "success",
      statusCode: 200,
      message: "Backup salvo com sucesso",
      data: {
        itemCount: 2,
        log: {
          database: "testDB",
          collectionsName: "testCollection",
          date: "07/10/2025",
          timestamp: new Date(),
        },
      },
    });

    (BackupService as jest.MockedClass<typeof BackupService>).mockImplementation(
      () =>
        ({
          saveBackup: mockSaveBackup,
        } as any)
    );

    const body: BackupDataInputDTO = {
      database: "testDB",
      collectionsName: "testCollection",
      data: [{ key: "value1" }, { key: "value2" }],
    };

    mockRequest.body = body;

    await saveBackupController(mockRequest as Request, mockResponse as Response);

    expect(mockSaveBackup).toHaveBeenCalledWith(body);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      status: "success",
      statusCode: 200,
      message: "Backup salvo com sucesso",
      data: expect.objectContaining({
        itemCount: 2,
        log: expect.any(Object),
      }),
    });
  });

  it("deve salvar backup com sucesso com objeto único", async () => {
    const mockSaveBackup = jest.fn().mockResolvedValue({
      status: "success",
      statusCode: 200,
      message: "Backup salvo com sucesso",
      data: {
        itemCount: 1,
        log: {
          database: "testDB",
          collectionsName: "testCollection",
          date: "07/10/2025",
          timestamp: new Date(),
        },
      },
    });

    (BackupService as jest.MockedClass<typeof BackupService>).mockImplementation(
      () =>
        ({
          saveBackup: mockSaveBackup,
        } as any)
    );

    const body: BackupDataInputDTO = {
      database: "testDB",
      collectionsName: "testCollection",
      data: { key: "value" },
    };

    mockRequest.body = body;

    await saveBackupController(mockRequest as Request, mockResponse as Response);

    expect(mockSaveBackup).toHaveBeenCalledWith(body);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      status: "success",
      statusCode: 200,
      message: "Backup salvo com sucesso",
      data: expect.objectContaining({
        itemCount: 1,
      }),
    });
  });

  it("deve retornar erro 400 quando body estiver vazio", async () => {
    mockRequest.body = null;

    await saveBackupController(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 400,
      message: "Requisição inválida",
      data: null,
    });
  });

  it("deve retornar erro 400 quando body for undefined", async () => {
    mockRequest.body = undefined;

    await saveBackupController(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 400,
      message: "Requisição inválida",
      data: null,
    });
  });

  it("deve retornar erro 500 quando ocorrer exceção no service", async () => {
    const mockSaveBackup = jest
      .fn()
      .mockRejectedValue(new Error("Service error"));

    (BackupService as jest.MockedClass<typeof BackupService>).mockImplementation(
      () =>
        ({
          saveBackup: mockSaveBackup,
        } as any)
    );

    mockRequest.body = {
      database: "testDB",
      collectionsName: "testCollection",
      data: { key: "value" },
    };

    await saveBackupController(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 500,
      message: "Ocorreu um erro interno no servidor",
      data: null,
    });
  });

  it("deve retornar erro do service quando houver falha", async () => {
    const mockSaveBackup = jest.fn().mockResolvedValue({
      status: "error",
      statusCode: 500,
      message: "Erro ao salvar backup",
      data: null,
    });

    (BackupService as jest.MockedClass<typeof BackupService>).mockImplementation(
      () =>
        ({
          saveBackup: mockSaveBackup,
        } as any)
    );

    mockRequest.body = {
      database: "testDB",
      collectionsName: "testCollection",
      data: { key: "value" },
    };

    await saveBackupController(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 500,
      message: "Erro ao salvar backup",
      data: null,
    });
  });

  it("deve processar backup com array vazio", async () => {
    const mockSaveBackup = jest.fn().mockResolvedValue({
      status: "success",
      statusCode: 200,
      message: "Backup salvo com sucesso",
      data: {
        itemCount: 0,
        log: {
          database: "testDB",
          collectionsName: "emptyCollection",
          date: "07/10/2025",
          timestamp: new Date(),
        },
      },
    });

    (BackupService as jest.MockedClass<typeof BackupService>).mockImplementation(
      () =>
        ({
          saveBackup: mockSaveBackup,
        } as any)
    );

    mockRequest.body = {
      database: "testDB",
      collectionsName: "emptyCollection",
      data: [],
    };

    await saveBackupController(mockRequest as Request, mockResponse as Response);

    expect(mockSaveBackup).toHaveBeenCalledWith(mockRequest.body);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "success",
        data: expect.objectContaining({
          itemCount: 0,
        }),
      })
    );
  });

  it("deve processar backup com dados complexos", async () => {
    const complexData = [
      {
        id: 1,
        name: "Test",
        nested: { key: "value" },
        array: [1, 2, 3],
      },
      {
        id: 2,
        name: "Test2",
        nested: { key: "value2" },
        array: [4, 5, 6],
      },
    ];

    const mockSaveBackup = jest.fn().mockResolvedValue({
      status: "success",
      statusCode: 200,
      message: "Backup salvo com sucesso",
      data: {
        itemCount: 2,
        log: {
          database: "testDB",
          collectionsName: "complexCollection",
          date: "07/10/2025",
          timestamp: new Date(),
        },
      },
    });

    (BackupService as jest.MockedClass<typeof BackupService>).mockImplementation(
      () =>
        ({
          saveBackup: mockSaveBackup,
        } as any)
    );

    mockRequest.body = {
      database: "testDB",
      collectionsName: "complexCollection",
      data: complexData,
    };

    await saveBackupController(mockRequest as Request, mockResponse as Response);

    expect(mockSaveBackup).toHaveBeenCalledWith(mockRequest.body);
    expect(mockStatus).toHaveBeenCalledWith(200);
  });

  it("deve lidar com erro de conexão do MongoDB", async () => {
    const mockSaveBackup = jest.fn().mockResolvedValue({
      status: "error",
      statusCode: 500,
      message: "Connection failed",
      data: null,
    });

    (BackupService as jest.MockedClass<typeof BackupService>).mockImplementation(
      () =>
        ({
          saveBackup: mockSaveBackup,
        } as any)
    );

    mockRequest.body = {
      database: "testDB",
      collectionsName: "testCollection",
      data: { key: "value" },
    };

    await saveBackupController(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 500,
      message: "Connection failed",
      data: null,
    });
  });

  it("deve validar que o service foi chamado uma única vez", async () => {
    const mockSaveBackup = jest.fn().mockResolvedValue({
      status: "success",
      statusCode: 200,
      message: "Backup salvo com sucesso",
      data: {
        itemCount: 1,
        log: {
          database: "testDB",
          collectionsName: "testCollection",
          date: "07/10/2025",
          timestamp: new Date(),
        },
      },
    });

    (BackupService as jest.MockedClass<typeof BackupService>).mockImplementation(
      () =>
        ({
          saveBackup: mockSaveBackup,
        } as any)
    );

    mockRequest.body = {
      database: "testDB",
      collectionsName: "testCollection",
      data: { key: "value" },
    };

    await saveBackupController(mockRequest as Request, mockResponse as Response);

    expect(mockSaveBackup).toHaveBeenCalledTimes(1);
  });
});
