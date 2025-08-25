import type { Request, Response } from 'express';

export function getMeController(req: Request, res: Response) {
  const { id, email } = (req as any).user as { id: string; email: string };
  return res.json({ id, email });
}
