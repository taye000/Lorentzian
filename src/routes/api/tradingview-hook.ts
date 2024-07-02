import { Router } from "express";
import { tradingviewWebHook } from "../../controllers";

const tradingviewHookRouter = Router();

tradingviewHookRouter.post("/", tradingviewWebHook);

export default tradingviewHookRouter;
