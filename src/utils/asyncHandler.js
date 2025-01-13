// Code to handle async errors in express routes

import e from "express";


const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await requestHandler(req, res, next);
    } catch (err) {
      res.status(500).json({
        statusCode: 500,
        data: {error: err.message},
        success: false,
        message: "Internal Server Error",

      });
      next();
    }
  };
};


export { asyncHandler };
