import { Request, Response } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    const newUser = new User({
      name,
      email,
      password
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Register failed", error });
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "SecretKey",
      { expiresIn: "24h" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
};
