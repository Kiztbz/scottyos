import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI as string;

let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    await mongoose.connect(MONGO_URI, { dbName: "test" });
    isConnected = true;
}

const Customer = mongoose.models.Customer || mongoose.model(
    "Customer",
    new mongoose.Schema({
        name: String,
        phone: String,
        drivingLicense: String,
        username: String,
    })
);

export default async function handler(req: any, res: any) {
    try {
        await connectDB();

        if (req.method === "GET") {
            const customers = await Customer.find();
            return res.status(200).json(customers);
        }

        if (req.method === "POST") {
            const customer = await Customer.create(req.body);
            return res.status(200).json(customer);
        }

    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
}
