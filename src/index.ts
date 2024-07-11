import express, { json } from "express";
import { PORT } from "./config/const";
import "./db";
import { mainRouter } from "./routes";
import cors from "cors";
const app = express();

app.use(json());

app.use(cors());

app.use("/api", mainRouter);

app.listen(PORT, () => {
	return console.log(`Express server is running on port ${PORT}`);
});
