import { Request, Response } from "express";
import { Record } from "../models/Record";
import { User } from "../models/User";
import { MESSAGES } from "../constants/messages";

export const allRecords = async (req: Request, res: Response) => {
  try {
    const records = await Record.find()
      .populate("userId", "name email")
      .sort({ date: -1 }); // Select specific user fields
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const createRecord = async (req: Request, res: Response) => {
  try {
    const { description, date, duration } = req.body;

    if (!req.user?.id) {
      return res.status(401).json({ message: MESSAGES.UNAUTHORIZED });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: MESSAGES.USER_NOT_FOUND });
    }

    // Create the record
    const record = new Record({
      userId: req.user.id,
      description,
      date,
      duration,
    });

    await record.save();
    res.status(201).json({ record, message: MESSAGES.ADDING_RECORD_SUCESS });
  } catch (error) {
    res.status(500).json({ message: MESSAGES.ADDING_RECORD_FAILED, error });
  }
};
export const adminCreateRecord = async (req: Request, res: Response) => {
  try {
    const { userEmail } = req.params;
    const { description, date, duration } = req.body;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ message: MESSAGES.USER_NOT_FOUND });
    }
    const userId = user._id;
    const record = new Record({
      userId,
      description,
      date,
      duration,
    });

    await record.save();
    const populatedRecord = await Record.findById(record._id).populate(
      "userId",
      "name email"
    ); // Populate userId with name and email fields

    res.status(201).json({
      record: populatedRecord,
      message: MESSAGES.ADDING_RECORD_SUCESS,
    });
  } catch (error) {
    res.status(500).json({ message: MESSAGES.ADDING_RECORD_FAILED, error });
  }
};

export const updateRecord = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { description, duration, date } = req.body;

  try {
    const updatedRecord = await Record.findByIdAndUpdate(
      id,
      { description, duration, date },
      { new: true }
    ).populate("userId");

    if (!updatedRecord) {
      return res.status(404).json({ message: MESSAGES.RECORD_NOT_FOUND });
    }

    res
      .status(200)
      .json({ updatedRecord, message: MESSAGES.UPDATING_REECORD_SUCESS });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
export const deleteRecord = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const deletedRecord = await Record.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({ message: MESSAGES.RECORD_NOT_FOUND });
    }

    res.status(200).json({ message: MESSAGES.DELETING_RECORD_SUCESS });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
export const deleteUserRecord = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const record = await Record.findById(id);

    if (!record) {
      return res.status(404).json({ message: MESSAGES.RECORD_NOT_FOUND });
    }

    await record.deleteOne();
    res.status(200).json({ message: MESSAGES.DELETING_RECORD_SUCESS });
  } catch (error) {
    res.status(500).json({ message: MESSAGES.DELETING_RECORD_FAILED, error });
  }
};
export const filterRecords = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Assuming the logged-in user ID is available in req.user

    // Validate logged-in user
    if (!userId) {
      return res.status(401).json({ message: MESSAGES.UNAUTHORIZED });
    }

    const { from, to } = req.query;
    console.log(from, to, "from, to");
    if (!from && !to) {
      const records = await Record.find({ userId }).sort({ date: -1 });
      return res.status(200).json(records);
    }

    // Fetch records within the date range
    const records = await Record.find({
      userId,
      ...{ date: { $gte: new Date(from as string) } },
      ...{ date: { $lte: new Date(to as string) } },
    });
    console.log(records, "records");
    // Return records
    return res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const userRecords = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const records = await Record.find({ userId }).sort({ date: -1 });
    return res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

const { Parser } = require("json2csv");

export const exportRecords = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const records = await Record.find({ userId }).sort({ date: -1 }).lean();

    if (!records.length) {
      return res.status(404).json({ message: MESSAGES.RECORD_NOT_FOUND });
    }

    const groupedRecords = records.reduce((acc: any, record) => {
      const dateKey = new Date(record.date)
        .toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, ".");

      if (!acc[dateKey]) {
        acc[dateKey] = {
          totalTime: 0,
          notes: [],
        };
      }

      acc[dateKey].totalTime += record.duration;
      acc[dateKey].notes.push(record.description);

      return acc;
    }, {});

    let output = "";
    Object.entries(groupedRecords).forEach(([date, data]: [string, any]) => {
      output += `* Date: ${date}\n`;
      output += `* Total time: ${data.totalTime}h\n`;
      output += `* Notes:\n`;
      data.notes.forEach((note: string) => {
        output += `    * ${note}\n`;
      });
      output += "\n";
    });

    res.header("Content-Type", "text/plain");
    res.attachment(`user_${userId}_records.txt`);
    return res.send(output);
  } catch (error) {
    console.error("Error exporting records:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
