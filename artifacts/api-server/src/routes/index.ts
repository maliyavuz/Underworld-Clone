import { Router, type IRouter } from "express";
import healthRouter from "./health";
import playerRouter from "./player";
import rewardRouter from "./reward";
import crimesRouter from "./crimes";
import carTheftRouter from "./car-theft";
import heistRouter from "./heist";
import travelRouter from "./travel";
import activityRouter from "./activity";
import garageRouter from "./garage";
import rankingsRouter from "./rankings";
import propertiesRouter from "./properties";
import marketRouter from "./market";
import messagesRouter from "./messages";
import groupCrimesRouter from "./group-crimes";
import jailRouter from "./jail";

const router: IRouter = Router();

router.use(healthRouter);
router.use(playerRouter);
router.use(rewardRouter);
router.use(crimesRouter);
router.use(carTheftRouter);
router.use(heistRouter);
router.use(travelRouter);
router.use(activityRouter);
router.use(garageRouter);
router.use(rankingsRouter);
router.use(propertiesRouter);
router.use(marketRouter);
router.use(messagesRouter);
router.use(groupCrimesRouter);
router.use(jailRouter);

export default router;
