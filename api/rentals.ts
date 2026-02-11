import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    await mongoose.connect(MONGO_URI, { dbName: "test" });
    isConnected = true;
}

const Rental = mongoose.models.Rental || mongoose.model(
    "Rental",
    new mongoose.Schema({
        vehicleId: String,
        vehicleNumber: String,
        customerId: String,
        username: String,
        mode: String,
        startTime: Number,
        expectedEndTime: Number,
        billing: Number,
        status: String,
    })
);

export default async function handler(req: any, res: any) {
    try {
        await connectDB();

        if (req.method === "GET") {
            const rentals = await Rental.find();
            return res.status(200).json(rentals);
        }

        if (req.method === "POST") {
            const rental = await Rental.create(req.body);
            return res.status(200).json(rental);
        }

        // 🔴 END RENTAL HERE
        if (req.method === "PUT") {
            const { id } = req.body;

            const updated = await Rental.findByIdAndUpdate(
                id,
                { status: "COMPLETED" },
                { new: true }
            );

            return res.status(200).json(updated);
        }

    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
}
