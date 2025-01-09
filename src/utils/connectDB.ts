import mongoose from "mongoose";
import User from "../model/user";
import bcrypt from "bcryptjs";
export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    const adminAccount = await User.findOne({
      role: "admin",
      email: process.env.ADMIN_ACCOUNT,
    })
      .lean()
      .exec();
    if (!adminAccount) {
      const newAdminAccount = await User.create({
        email: process.env.ADMIN_ACCOUNT,
        verified: true,
        password: await bcrypt.hash(process.env.ADMIN_PASS!, 10),
        role: "admin",
      });
      if (newAdminAccount) console.log("Admin account created");
    }
  } catch (err) {
    console.log("Error creating admin account", err);
  }
}