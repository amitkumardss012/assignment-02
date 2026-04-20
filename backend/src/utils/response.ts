import type { Response } from "express";

export class ErrorResponse extends Error {
    constructor(public message: string, public statusCode: number) {
      super(message);
      this.statusCode = statusCode;

      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export const SuccessResponse = (
    res: Response,
    message: string,
    data: any = {},
    statusCode: number = 200
  ) => {
    let normalizedData = data;
    try {
      normalizedData = normalizeBigInt(data);
    } catch (error) {
      console.error("Error normalizing BigInt in SuccessResponse:", error);
    }

    return res.status(statusCode).json({
      success: true,
      message,
      data: normalizedData,
    });
  };

 export function normalizeBigInt(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    try {
      return JSON.parse(
        JSON.stringify(obj, (key, value) => {
          if (typeof value === "bigint") {
            return value.toString();
          }
          return value;
        })
      );
    } catch (error) {
      console.error("Error in normalizeBigInt:", error);
      return obj;
    }
  }
  
  