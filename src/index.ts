import express from "express";
import { PORT } from "./config/const";

const app = express();

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.listen(PORT, () => {
	return console.log(`Express server is running on port ${PORT}`);
});
