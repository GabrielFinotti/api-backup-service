import { Request, Response } from "express";
import getLogsController from "../../src/controllers/getLogs.controller";
import BackupService from "../../src/services/backup.service";
import { GetLogsDTO } from "../../src/interface/backupDataInput.dto";

jest.mock("../../src/services/backup.service");

describe("getLogsController", () => {
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

  it("deve recuperar logs com sucesso", async () => {
    const mockGetLogs = jest.fn().mockResolvedValue({
      status: "success",
      statusCode: 200,
      message: "Logs recuperados com sucesso",
      data: {
        database: "testDB",
        logCount: 2,
        logs: [
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
        ],
      },
    });

    (
      BackupService as jest.MockedClass<typeof BackupService>
    ).mockImplementation(
      () =>
        ({
          getLogs: mockGetLogs,
        } as any)
    );

    const body: GetLogsDTO = {
      database: "testDB",
    };

    mockRequest.body = body;

    await getLogsController(mockRequest as Request, mockResponse as Response);

    expect(mockGetLogs).toHaveBeenCalledWith(body);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      status: "success",
      statusCode: 200,
      message: "Logs recuperados com sucesso",
      data: expect.objectContaining({
        database: "testDB",
        logCount: 2,
      }),
    });
  });

  it("deve retornar erro 400 quando body estiver vazio", async () => {
    mockRequest.body = null;

    await getLogsController(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 400,
      message: "Requisição inválida. É necessário informar 'database'.",
      data: null,
    });
  });

  it("deve retornar erro 400 quando database não for informado", async () => {
    mockRequest.body = {};

    await getLogsController(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 400,
      message: "Requisição inválida. É necessário informar 'database'.",
      data: null,
    });
  });

  it("deve retornar erro 500 quando ocorrer exceção no service", async () => {
    const mockGetLogs = jest.fn().mockRejectedValue(new Error("Service error"));

    (
      BackupService as jest.MockedClass<typeof BackupService>
    ).mockImplementation(
      () =>
        ({
          getLogs: mockGetLogs,
        } as any)
    );

    mockRequest.body = {
      database: "testDB",
    };

    await getLogsController(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 500,
      message: "Ocorreu um erro interno no servidor",
      data: null,
    });
  });

  it("deve retornar erro do service quando houver falha", async () => {
    const mockGetLogs = jest.fn().mockResolvedValue({
      status: "error",
      statusCode: 500,
      message: "Erro ao recuperar logs",
      data: null,
    });

    (
      BackupService as jest.MockedClass<typeof BackupService>
    ).mockImplementation(
      () =>
        ({
          getLogs: mockGetLogs,
        } as any)
    );

    mockRequest.body = {
      database: "testDB",
    };

    await getLogsController(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 500,
      message: "Erro ao recuperar logs",
      data: null,
    });
  });

  it("deve retornar array vazio quando não há logs", async () => {
    const mockGetLogs = jest.fn().mockResolvedValue({
      status: "success",
      statusCode: 200,
      message: "Logs recuperados com sucesso",
      data: {
        database: "testDB",
        logCount: 0,
        logs: [],
      },
    });

    (
      BackupService as jest.MockedClass<typeof BackupService>
    ).mockImplementation(
      () =>
        ({
          getLogs: mockGetLogs,
        } as any)
    );

    mockRequest.body = {
      database: "testDB",
    };

    await getLogsController(mockRequest as Request, mockResponse as Response);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      status: "success",
      statusCode: 200,
      message: "Logs recuperados com sucesso",
      data: {
        database: "testDB",
        logCount: 0,
        logs: [],
      },
    });
  });
});
