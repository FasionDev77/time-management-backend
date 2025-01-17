import { Request, Response } from "express";
import { User } from "../models/User";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    let filter = {};

    // if (req.user?.role === 'user_manager') {
    //   // Managers: Exclude Admins and Managers
    //   filter = { role: { $nin: ['admin', 'user_manager'] } };
    // } else if (req.user?.role === 'admin') {
    //   // Admins: Exclude other Admins
    //   filter = { role: { $ne: 'admin' } };
    // } else {
    //   // If not authorized (neither Admin nor Manager), deny access
    //   return res.status(403).json({ message: 'Access denied.' });
    // }

    const users = await User.find(filter);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update a user (Admin only to update roles)
export const updateUser = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { email, name, role } = req.body;
  
      // Fetch user to update
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Ensure Admin-only role modification
      if (role && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Only Admin can update roles.' });
      }
  
      // User Manager or Admin can update other fields
      if (req.user?.role === 'user_manager' || req.user?.role === 'admin') {
        user.email = email || user.email;
        user.name = name || user.name;
  
        // Allow role update only for Admin
        if (req.user?.role === 'admin' && role) {
          user.role = role;
        }
  
        await user.save();
  
        return res.status(200).json({
          message: 'User updated successfully.',
          user,
        });
      }
  
      // Other roles not authorized
      return res.status(403).json({ message: 'Unauthorized to update users.' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  };

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prevent Admin from deleting themselves
    if (req.user?.id === id) {
      return res
        .status(403)
        .json({ message: "Admins cannot delete their own accounts." });
    }

    await User.findOneAndDelete({ id });
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
