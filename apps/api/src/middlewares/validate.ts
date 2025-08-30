import { NextFunction, Response } from "express";

// @ts-ignore
export const validate = (schema) => (req, res: Response, next: NextFunction) => {
    try {
      req.validated = schema.parse(req.body);
      next();
    } catch (err) {
      return res.status(400).json({ 
        error: 'Invalid request', 
        details: (err && typeof err === 'object' && 'errors' in err) ? (err as any).errors : err 
      });
    }
  };
