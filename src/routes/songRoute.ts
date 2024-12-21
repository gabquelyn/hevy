import { Router, NextFunction, Request, Response } from "express";
import { body } from "express-validator";
import multer from "multer";
import {
  createSong,
  getSongs,
  deleteSong,
  getSongbyId,
} from "../controllers/songController";
import verifyJWT from "../utils/verifyJwt";
import { CustomRequest } from "../../types";
const songRoute = Router();
const upload = multer({ storage: multer.memoryStorage() });
songRoute
  .route("/")
  .post(
    verifyJWT,
    (req: Request, res: Response, next: NextFunction) => {
      if ((req as CustomRequest).role !== "admin")
        return res.status(401).json({ message: "Unathorized, admin route" });
      next();
    },
    upload.single("PosterImage"),
    [
      body("name").notEmpty().withMessage("Artiste name is required"),
      body("title").notEmpty().withMessage("Song title is required"),
      body("year").notEmpty().withMessage("Release year is required"),
    ],
    createSong
  )
  .get(getSongs);

songRoute
  .route("/:id")
  .delete((req: Request, res: Response, next: NextFunction) => {
    if ((req as CustomRequest).role !== "admin")
      return res.status(401).json({ message: "Unathorized, admin route" });
    next();
  }, deleteSong)
  .get(getSongbyId);

export default songRoute;
