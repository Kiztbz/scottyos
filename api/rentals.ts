import { connectDB } from "./db";
import mongoose from "mongoose";

const Rental = mongoose.models.Rental || mongoose.model("Rental", new mongoose.Schema({
    vehicleId: String,
    vehicleNumber: String,
    customerId: String,
    username: String,
    mode: String,
    startTime: Number,
    expectedEndTime: Number,
    billing: Number,
    status: String,
}));

export default async function handler(req: any, res: any) {
    await connectDB();

    if (req.method === "GET") {
        const rentals = await Rental.find();
        return res.json(rentals);
    }

    if (req.method === "POST") {
        const rental = await Rental.create(req.body);
        return res.json(rental);
    }
}
