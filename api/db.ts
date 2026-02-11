import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://scotty:scotty123@cluster0.ahe7o9c.mongodb.net/?appName=Cluster0";

if (!MONGO_URI) {
    throw new Error("Missing MONGO_URI");
}

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI, {
            dbName: "test",
        }).then(m => m);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}
