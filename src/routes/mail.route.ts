import express, { Request, Response } from "express";
import sendMail from "../controllers/mail.controller";
const mailRouter = express.Router();

mailRouter.post("/send-mail", sendMail);

export default mailRouter;
