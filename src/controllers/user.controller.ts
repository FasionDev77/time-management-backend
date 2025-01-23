import { Request, Response } from "express";
import { User } from "../models/User";
import { Record } from "../models/Record";

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    let filter =
      req.user?.role === "admin"
        ? { role: { $ne: "admin" } }
        : { role: { $nin: ["admin", "user_manager"] } };
    // Role-based filtering
    const users = await User.find(filter);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
// Update a user (Admin only to update roles)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, name, preferedHours, role } = req.body;

    // Fetch user to update
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    user.email = email || user.email;
    user.name = name || user.name;
    user.preferedHours = preferedHours || user.preferedHours;
    if (req.body.role) {
      user.role = req.body.role;
    }
    await user.save();

    return res.status(200).json({
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("Deleting user with ID:", id);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Delete all records associated with the user
    await Record.deleteMany({ userId: id });

    // Delete the user
    await User.findByIdAndDelete(id);

    res
      .status(200)
      .json({ message: "User and their records deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
