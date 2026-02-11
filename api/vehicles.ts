import { connectDB } from "./db.ts";
import mongoose from "mongoose";

const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", new mongoose.Schema({
    vehicleNumber: String,
    model: String,
    color: String,
    status: String,
}));

export default async function handler(req: any, res: any) {
    await connectDB();

    if (req.method === "GET") {
        const vehicles = await Vehicle.find();
        return res.json(vehicles);
    }

    if (req.method === "POST") {
        const vehicle = await Vehicle.create(req.body);
        return res.json(vehicle);
    }
}
