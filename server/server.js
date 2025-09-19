import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoute from "./routes/LoginRoute.js";
import ContactRoute from "./routes/ContactsRoutes.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import {} from "./controllers/TaskControllers.js";
import googleAuthRoute from "./routes/GoogleAuthRoute.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
dotenv.config();

app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/auth", authRoute);
app.use("/api", ContactRoute);
app.use("/auth", googleAuthRoute);
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
