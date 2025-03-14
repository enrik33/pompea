import express, { json } from "express";
import cors from "cors";
import { config } from "dotenv";
import bookingRoutes from "./routes/bookingRoutes.js";

config();

const app = express();
app.use(cors());
app.use(json());

app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
