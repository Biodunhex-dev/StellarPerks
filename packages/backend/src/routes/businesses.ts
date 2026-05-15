import { Router, Request, Response } from "express";
import { store } from "../db/store";
import { generateKeypair } from "@stellarperks/sdk";

const router = Router();

// Register a business
router.post("/", (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!name || !email) {
    res.status(400).json({ error: "name and email required" });
    return;
  }
  const { publicKey } = generateKeypair();
  const business = store.addBusiness({ name, email, publicKey });
  res.status(201).json(business);
});

// List businesses
router.get("/", (_req: Request, res: Response) => {
  res.json(Array.from(store.businesses.values()));
});

// Get business by id
router.get("/:id", (req: Request, res: Response) => {
  const b = store.businesses.get(req.params.id);
  if (!b) { res.status(404).json({ error: "Not found" }); return; }
  res.json(b);
});

export default router;
