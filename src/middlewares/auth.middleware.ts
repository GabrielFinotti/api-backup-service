import { Request, Response, NextFunction } from "express";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const secretUser = process.env.SECRET_USER;
  const secretPass = process.env.SECRET_PASS;

  if (!authHeader || !secretUser || !secretPass) {
    res.status(401).json({
      status: "error",
      statusCode: 401,
      message: "Não autorizado",
      data: null,
    });

    return;
  }

  const [type, credentials] = authHeader.split(" ");

  if (type !== "Basic" || !credentials) {
    res.status(401).json({
      status: "error",
      statusCode: 401,
      message: "Não autorizado",
      data: null,
    });

    return;
  }

  const decodedCredentials = Buffer.from(credentials, "base64").toString(
    "utf-8"
  );
  const [username, password] = decodedCredentials.split(":");

  if (username !== secretUser || password !== secretPass) {
    res.status(401).json({
      status: "error",
      statusCode: 401,
      message: "Não autorizado",
      data: null,
    });

    return;
  }

  next();
};

export default authMiddleware;
