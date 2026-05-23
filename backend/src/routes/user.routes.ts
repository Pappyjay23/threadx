import express from "express";

import { getCurrentUser } from "../controllers/user.controller.js";
import { protectAuth } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";
import { apiAj } from "../config/arcjet.config.js";

const router = express.Router();

router.use(protectAuth);
router.use(arcjetProtection(apiAj));

router.get("/", getCurrentUser);

export default router;
