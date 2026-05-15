import { Request, Response, NextFunction } from "express";

export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers["x-api-key"];
  const expected = process.env.API_KEY || "dev-key";
  if (key !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
