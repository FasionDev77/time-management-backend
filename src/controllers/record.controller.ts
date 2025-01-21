import { Request, Response } from "express";
import { Record } from "../models/Record";
import { User } from "../models/User";
import { MESSAGES } from "../constants/messages";

export const createRecord = async (req: Request, res: Response) => {
  try {
    const { description, date, duration } = req.body;

    // Ensure the authenticated user's details are available
    if (!req.user?.id) {
      return res.status(401).json({ message: MESSAGES.UNAUTHORIZED });
    }

    // Fetch user for validation
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: MESSAGES.USER_NOT_FOUND });
    }

    // Determine status based on prefered working hours
    const status = duration < (user.preferedHours || 8) ? "red" : "green";

    // Create the record
    const record = new Record({
      userId: req.user.id, // Use the userId from the authenticated user
      description,
      date,
      duration,
      status,
    });

    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: MESSAGES.ADDING_RECORD_FAILED, error });
  }
};

export const updateRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { description, date, duration } = req.body;

    const record = await Record.findById(id);

    if (!record || record.userId.toString() !== req.user?.id) {
      return res.status(403).json({ message: MESSAGES.UNAUTHORIZED });
    }

    record.description = description || record.description;
    record.date = date || record.date;
    record.duration = duration || record.duration;
    record.status = duration < 8 ? "red" : "green";
    await record.save();

    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ message: MESSAGES.UPDATING_RECORD_FAILED, error });
  }
};

export const deleteRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await Record.findById(id);

    if (!record || record.userId.toString() !== req.user?.id) {
      return res.status(403).json({ message: MESSAGES.UNAUTHORIZED });
    }

    await record.deleteOne();
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Deleting record failed", error });
  }
};

export const filterRecords = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    let filter: any = { userId: req.user?.id };

    if (from || to) {
      if (
        (from && isNaN(Date.parse(from as string))) ||
        (to && isNaN(Date.parse(to as string)))
      ) {
        return res.status(400).json({
          message: MESSAGES.INVAID_DATE_FORMAT,
        });
      }

      if (from && to && new Date(to as string) < new Date(from as string)) {
        return res.status(400).json({ message: MESSAGES.VALIDATE_DATE_RANGE });
      }

      filter.date = {
        ...(from && { $gte: new Date(from as string) }),
        ...(to && { $lte: new Date(to as string) }),
      };
    }

    const records = await Record.find(filter);

    if (!records.length) {
      return res.status(404).json({ message: MESSAGES.RECORD_NOT_FOUND });
    }
    const formattedRecords = records.map((record) => ({
      ...record.toObject(),
      date: new Date(record.date).toISOString().slice(0, 10), // Format the date
    }));
    res.status(200).json(formattedRecords);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
