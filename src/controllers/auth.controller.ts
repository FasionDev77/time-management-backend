import { Request, Response } from "express";
import { User } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import { MESSAGES } from "../constants/messages";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: MESSAGES.USER_EXIST });
    }

    const newUser = new User({
      name,
      email,
      password,
    });
    await newUser.save();

    res.status(201).json({ user: newUser, message: MESSAGES.REGISTER_SUCCESS });
  } catch (error) {
    res.status(500).json({ message: MESSAGES.REGISTER_FAILED, error });
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: MESSAGES.IVALID_CREDENTIALS });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        email: user.email,
        preferedHours: user.preferedHours,
        role: user.role,
      },
      process.env.JWT_SECRET || MESSAGES.SECURITKEY,
      { expiresIn: "24h" }
    );

    res.status(200).json({ token, message: MESSAGES.LOGIN_SUCCESS });
  } catch (error) {
    res.status(500).json({ message: MESSAGES.LOGIN_FAILED, error });
  }
};
