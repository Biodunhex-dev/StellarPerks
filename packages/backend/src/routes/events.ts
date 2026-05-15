import { Router, Request, Response } from "express";
import { store } from "../db/store";

const router = Router();

// Track an event (issue/redeem)
router.post("/", (req: Request, res: Response) => {
  const { programId, userPublicKey, action, points, txHash } = req.body;
  if (!programId || !userPublicKey || !action || points == null) {
    res.status(400).json({ error: "programId, userPublicKey, action, points required" });
    return;
  }
  if (action !== "issue" && action !== "redeem") {
    res.status(400).json({ error: "action must be issue or redeem" });
    return;
  }
  const event = store.addEvent({ programId, userPublicKey, action, points: Number(points), txHash });
  res.status(201).json(event);
});

// Get events (optionally filter by programId)
router.get("/", (req: Request, res: Response) => {
  const { programId } = req.query;
  const events = programId
    ? store.events.filter((e) => e.programId === programId)
    : store.events;
  res.json(events);
});

// Analytics summary
router.get("/analytics", (req: Request, res: Response) => {
  const { programId } = req.query;
  res.json(store.getAnalytics(programId as string | undefined));
});

export default router;
