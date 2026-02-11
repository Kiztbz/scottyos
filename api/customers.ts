import { connectDB } from "./db";
import mongoose from "mongoose";

const Customer = mongoose.models.Customer || mongoose.model("Customer", new mongoose.Schema({
    name: String,
    phone: String,
    drivingLicense: String,
    username: String,
}));

export default async function handler(req: any, res: any) {
    await connectDB();

    if (req.method === "GET") {
        const customers = await Customer.find();
        return res.json(customers);
    }

    if (req.method === "POST") {
        const customer = await Customer.create(req.body);
        return res.json(customer);
    }
}
