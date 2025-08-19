import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoute from "./routes/LoginRoute.js"
import createContactRoute from "./routes/ContactsRoutes.js"
const app = express();
dotenv.config();

app.use(cors());
app.use(bodyParser.json());

app.use("/auth", authRoute);
app.use("/api", createContactRoute);

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});
