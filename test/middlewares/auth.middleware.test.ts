import authMiddleware from "../../src/middlewares/auth.middleware";
import { Request, Response, NextFunction } from "express";

describe("authMiddleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    process.env.SECRET_USER = "testuser";
    process.env.SECRET_PASS = "testpass";
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.SECRET_USER;
    delete process.env.SECRET_PASS;
  });

  it("deve retornar 401 quando não há header de autorização", () => {
    mockReq.headers = {};

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "error",
      statusCode: 401,
      message: "Não autorizado",
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve retornar 401 quando SECRET_USER não está definido", () => {
    delete process.env.SECRET_USER;
    mockReq.headers = { authorization: "Basic dGVzdHVzZXI6dGVzdHBhc3M=" };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "error",
      statusCode: 401,
      message: "Não autorizado",
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve retornar 401 quando SECRET_PASS não está definido", () => {
    delete process.env.SECRET_PASS;
    mockReq.headers = { authorization: "Basic dGVzdHVzZXI6dGVzdHBhc3M=" };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "error",
      statusCode: 401,
      message: "Não autorizado",
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve retornar 401 quando o tipo de autenticação não é Basic", () => {
    mockReq.headers = { authorization: "Bearer token123" };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "error",
      statusCode: 401,
      message: "Não autorizado",
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve retornar 401 quando não há credenciais no header Basic", () => {
    mockReq.headers = { authorization: "Basic " };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "error",
      statusCode: 401,
      message: "Não autorizado",
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve retornar 401 quando as credenciais são inválidas", () => {
    // Base64 de "wronguser:wrongpass" = "d3Jvbmd1c2VyOndyb25ncGFzcw=="
    mockReq.headers = { authorization: "Basic d3Jvbmd1c2VyOndyb25ncGFzcw==" };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      status: "error",
      statusCode: 401,
      message: "Não autorizado",
      data: null,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("deve chamar next() quando as credenciais são válidas", () => {
    // Base64 de "testuser:testpass" = "dGVzdHVzZXI6dGVzdHBhc3M="
    mockReq.headers = { authorization: "Basic dGVzdHVzZXI6dGVzdHBhc3M=" };

    authMiddleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });
});
