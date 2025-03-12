import { Request, Response, NextFunction } from 'express';
//  function to wrap async route handlers and catch errors
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
