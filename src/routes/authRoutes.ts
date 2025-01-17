import { Router } from "express";
import {
  verifyController,
  loginController,
  logoutController,
  refreshController,
  forgotPasswordController,
  restPasswordController
} from "../controllers/authController";
const authRouter = Router();
authRouter.route("/").post(loginController);
authRouter.route("/verify").post(verifyController);
authRouter.route("/logout").post(logoutController);
authRouter.route("/refresh").post(refreshController);
authRouter.route("/forgot").post(forgotPasswordController)
authRouter.route("/reset").post(restPasswordController)
// authRouter.route("/register").post(registerController);
export default authRouter