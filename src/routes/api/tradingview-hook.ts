import { Router } from "express";
import { tradingviewWebHook } from "../../controllers";

const tradingviewHookRouter = Router();

tradingviewHookRouter.post("/webhook", tradingviewWebHook);

export default tradingviewHookRouter;
