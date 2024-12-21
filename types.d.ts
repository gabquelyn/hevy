import { Request } from "express";
interface CustomRequest extends Request {
  email: string;
  role: "admin" | "artiste";
  userId: string;
}