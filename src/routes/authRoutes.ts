import { Router } from "express";
import {
  verifyController,
  loginController,
  logoutController,
  refreshController,
} from "../controllers/authController";
const authRouter = Router();
authRouter.route("/").post(loginController);
authRouter.route("/verify").post(verifyController);
authRouter.route("/logout").post(logoutController);
authRouter.route("/refresh").post(refreshController);
// authRouter.route("/register").post(registerController);
export default authRouter