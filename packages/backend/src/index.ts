import "dotenv/config";
import express from "express";
import cors from "cors";
import businessRoutes from "./routes/businesses";
import userRoutes from "./routes/users";
import eventRoutes from "./routes/events";
import { apiKeyAuth } from "./middleware/auth";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/businesses", apiKeyAuth, businessRoutes);
app.use("/api/users", apiKeyAuth, userRoutes);
app.use("/api/events", apiKeyAuth, eventRoutes);

// 404 handler
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

if (require.main === module) {
  app.listen(PORT, () => console.log(`StellarPerks backend running on port ${PORT}`));
}

export default app;
