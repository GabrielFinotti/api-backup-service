import { Request, Response } from "express";
import getDatabasesController from "../../src/controllers/getDatabases.controller";
import BackupService from "../../src/services/backup.service";

jest.mock("../../src/services/backup.service");

describe("getDatabasesController", () => {
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

  it("deve listar databases com sucesso", async () => {
    const mockGetDatabases = jest.fn().mockResolvedValue({
      status: "success",
      statusCode: 200,
      message: "Databases recuperados com sucesso",
      data: {
        databaseCount: 3,
        databases: [
          { name: "admin", sizeOnDisk: 40960, empty: false },
          { name: "testDB", sizeOnDisk: 8192000, empty: false },
          { name: "local", sizeOnDisk: 73728, empty: false },
        ],
      },
    });

    (
      BackupService as jest.MockedClass<typeof BackupService>
    ).mockImplementation(
      () =>
        ({
          getDatabases: mockGetDatabases,
        } as any)
    );

    await getDatabasesController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockGetDatabases).toHaveBeenCalled();
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      status: "success",
      statusCode: 200,
      message: "Databases recuperados com sucesso",
      data: expect.objectContaining({
        databaseCount: 3,
        databases: expect.any(Array),
      }),
    });
  });

  it("deve retornar erro 500 quando ocorrer exceção no service", async () => {
    const mockGetDatabases = jest
      .fn()
      .mockRejectedValue(new Error("Service error"));

    (
      BackupService as jest.MockedClass<typeof BackupService>
    ).mockImplementation(
      () =>
        ({
          getDatabases: mockGetDatabases,
        } as any)
    );

    await getDatabasesController(
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
    const mockGetDatabases = jest.fn().mockResolvedValue({
      status: "error",
      statusCode: 500,
      message: "Erro ao listar databases",
      data: null,
    });

    (
      BackupService as jest.MockedClass<typeof BackupService>
    ).mockImplementation(
      () =>
        ({
          getDatabases: mockGetDatabases,
        } as any)
    );

    await getDatabasesController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 500,
      message: "Erro ao listar databases",
      data: null,
    });
  });

  it("deve retornar lista vazia quando não há databases", async () => {
    const mockGetDatabases = jest.fn().mockResolvedValue({
      status: "success",
      statusCode: 200,
      message: "Databases recuperados com sucesso",
      data: {
        databaseCount: 0,
        databases: [],
      },
    });

    (
      BackupService as jest.MockedClass<typeof BackupService>
    ).mockImplementation(
      () =>
        ({
          getDatabases: mockGetDatabases,
        } as any)
    );

    await getDatabasesController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      status: "success",
      statusCode: 200,
      message: "Databases recuperados com sucesso",
      data: {
        databaseCount: 0,
        databases: [],
      },
    });
  });

  it("deve incluir informações corretas de cada database", async () => {
    const mockDatabase = {
      name: "myDatabase",
      sizeOnDisk: 1048576,
      empty: false,
    };

    const mockGetDatabases = jest.fn().mockResolvedValue({
      status: "success",
      statusCode: 200,
      message: "Databases recuperados com sucesso",
      data: {
        databaseCount: 1,
        databases: [mockDatabase],
      },
    });

    (
      BackupService as jest.MockedClass<typeof BackupService>
    ).mockImplementation(
      () =>
        ({
          getDatabases: mockGetDatabases,
        } as any)
    );

    await getDatabasesController(
      mockRequest as Request,
      mockResponse as Response
    );

    const responseData = mockJson.mock.calls[0][0];
    expect(responseData.data.databases[0]).toEqual(mockDatabase);
    expect(responseData.data.databases[0]).toHaveProperty("name");
    expect(responseData.data.databases[0]).toHaveProperty("sizeOnDisk");
    expect(responseData.data.databases[0]).toHaveProperty("empty");
  });

  it("deve lidar com erro de conexão ao MongoDB", async () => {
    const mockGetDatabases = jest.fn().mockResolvedValue({
      status: "error",
      statusCode: 500,
      message: "Não foi possível acessar o admin do MongoDB",
      data: null,
    });

    (
      BackupService as jest.MockedClass<typeof BackupService>
    ).mockImplementation(
      () =>
        ({
          getDatabases: mockGetDatabases,
        } as any)
    );

    await getDatabasesController(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockJson).toHaveBeenCalledWith({
      status: "error",
      statusCode: 500,
      message: "Não foi possível acessar o admin do MongoDB",
      data: null,
    });
  });
});
