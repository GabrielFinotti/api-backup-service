import { Request, Response } from "express";
import recoverDataController from "../../src/controllers/recoverData.controller";
import BackupService from "../../src/services/backup.service";
import { RecoverDataDTO } from "../../src/interface/backupDataInput.dto";

jest.mock("../../src/services/backup.service");

describe("recoverDataController", () => {
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

  it("deve recuperar dados com sucesso", async () => {
    const mockRecoverData = jest.fn().mockResolvedValue({
      status: "success",
      statusCode: 200,
      message: "Dados recuperados com sucesso",
      data: {
        collectionName: "testCollection",
        database: "testDB",
        documentCount: 2,
        documents: [{ id: 1 }, { id: 2 }],
      },
    });

    (
      BackupService as jest.MockedClass<typeof BackupService>
    ).mockImplementation(
      () =>
        ({
          recoverData: mockRecoverData,
        } as any)
    );

    const body: RecoverDataDTO = {
      database: "testDB",
      collectionName: "testCollection",
    };

    mockRequest.body = body;

    await recoverDataController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockRecoverData).toHaveBeenCalledWith(body);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      status: "success",
      statusCode: 200,
      message: "Dados recuperados com sucesso",
      data: {
        collectionName: "testCollection",
        database: "testDB",
        documentCount: 2,
        documents: [{ id: 1 }, { id: 2 }],
      },
    });
  });

  it("deve retornar erro 400 quando body estiver vazio", async () => {
    mockRequest.body = null;

    await recoverDataController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 400,
      message:
        "Requisição inválida. É necessário informar 'database' e 'collectionName'.",
      data: null,
    });
  });

  it("deve retornar erro 400 quando database não for informado", async () => {
    mockRequest.body = {
      collectionName: "testCollection",
    };

    await recoverDataController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 400,
      message:
        "Requisição inválida. É necessário informar 'database' e 'collectionName'.",
      data: null,
    });
  });

  it("deve retornar erro 400 quando collectionName não for informado", async () => {
    mockRequest.body = {
      database: "testDB",
    };

    await recoverDataController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(400);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 400,
      message:
        "Requisição inválida. É necessário informar 'database' e 'collectionName'.",
      data: null,
    });
  });

  it("deve retornar erro 500 quando ocorrer exceção no service", async () => {
    const mockRecoverData = jest
      .fn()
      .mockRejectedValue(new Error("Service error"));

    (
      BackupService as jest.MockedClass<typeof BackupService>
    ).mockImplementation(
      () =>
        ({
          recoverData: mockRecoverData,
        } as any)
    );

    mockRequest.body = {
      database: "testDB",
      collectionName: "testCollection",
    };

    await recoverDataController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 500,
      message: "Ocorreu um erro interno no servidor",
      data: null,
    });
  });

  it("deve retornar erro do service quando houver falha", async () => {
    const mockRecoverData = jest.fn().mockResolvedValue({
      status: "error",
      statusCode: 500,
      message: "Erro ao recuperar dados",
      data: null,
    });

    (
      BackupService as jest.MockedClass<typeof BackupService>
    ).mockImplementation(
      () =>
        ({
          recoverData: mockRecoverData,
        } as any)
    );

    mockRequest.body = {
      database: "testDB",
      collectionName: "testCollection",
    };

    await recoverDataController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 500,
      message: "Erro ao recuperar dados",
      data: null,
    });
  });
});
