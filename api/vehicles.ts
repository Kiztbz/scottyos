import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    await mongoose.connect(MONGO_URI, { dbName: "test" });
    isConnected = true;
}

const Vehicle = mongoose.models.Vehicle || mongoose.model(
    "Vehicle",
    new mongoose.Schema({
        vehicleNumber: String,
        model: String,
        color: String,
        status: String,
    })
);

export default async function handler(req: any, res: any) {
    try {
        await connectDB();

        if (req.method === "GET") {
            const vehicles = await Vehicle.find();
            return res.status(200).json(vehicles);
        }

        if (req.method === "POST") {
            const vehicle = await Vehicle.create(req.body);
            return res.status(200).json(vehicle);
        }

    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
}
