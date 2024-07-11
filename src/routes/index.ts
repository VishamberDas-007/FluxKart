import { Router } from "express";
import { contactRouter } from "./contact.routes";

const mainRouter = Router();

mainRouter.use("/contact", contactRouter);

mainRouter.get("/test", (req, res) => {
	res.send("Welcome to backend of fluxkart");
});

export { mainRouter };
