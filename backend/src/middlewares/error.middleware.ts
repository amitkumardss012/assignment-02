import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { statusCode } from "../types/types.js";
import type { ErrorResponse } from "../utils/response.js";
import { zodError } from "../utils/utils.js";

export const errorMiddleware = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;

  // cast error
  if(err.name === "CastError") {
    err.message = "Invalid ID";
    err.statusCode = statusCode.Bad_Request;
  }

  if(err.name === "") {
    err.message = "Invoice already exists",
    err.statusCode = statusCode.Bad_Request;
  }

  const mongoError = err as any;

  if (mongoError.code === 11000) {
    const field = Object.keys(mongoError.keyValue)[0];
    const value = mongoError.keyValue[field || "Item"];

    err.message = `${field} "${value}" already exists`;
    err.statusCode = statusCode.Bad_Request;
  }

  // handle Zod error
  if (err instanceof ZodError) {
    const zodErr = zodError(err);
     res.status(statusCode.Bad_Request).json({
      success: false,
      message: "Validation Error",
      errors: zodErr,
    });
  }else {
    // Final Error Response
   res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
  }  
};


export default errorMiddleware;


type AsyncHandlerFunction<TReq extends Request> = (
  req: TReq,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler =
  <TReq extends Request>(fn: AsyncHandlerFunction<TReq>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as TReq, res, next)).catch(next);
  };



