import { Router } from "express";
import { identifyContact } from "../controllers/contact.controller";

const contactRouter = Router();

contactRouter.post("/identify", identifyContact);

export { contactRouter };
