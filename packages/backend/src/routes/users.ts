import { Router, Request, Response } from "express";
import { store } from "../db/store";
import { generateKeypair } from "@stellarperks/sdk";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ error: "email required" }); return; }
  const { publicKey } = generateKeypair();
  const user = store.addUser({ email, publicKey });
  res.status(201).json(user);
});

router.get("/", (_req: Request, res: Response) => {
  res.json(Array.from(store.users.values()));
});

router.get("/:id", (req: Request, res: Response) => {
  const u = store.users.get(req.params.id);
  if (!u) { res.status(404).json({ error: "Not found" }); return; }
  res.json(u);
});

export default router;
