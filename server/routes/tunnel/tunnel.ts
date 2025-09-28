import { Router } from "express";
import { tunnelController } from "../../controllers/tunnelController";

const router = Router({ mergeParams: true });

router.use(tunnelController);

export { router as tunnelRouter };
