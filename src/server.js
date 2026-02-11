import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());  
app.use(express.json());

// 🔴 PASTE YOUR MONGODB URL HERE
mongoose.connect("mongodb+srv://scotty:scotty123@cluster0.ahe7o9c.mongodb.net/?appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req,res)=>res.send("API running"));

const Vehicle = mongoose.model("Vehicle", new mongoose.Schema({
  vehicleNumber: String,
  model: String,
  color: String,
  status: String,
}));

const Customer = mongoose.model("Customer", new mongoose.Schema({
  name: String,
  phone: String,
  drivingLicense: String,
  username: String,
}));

const Rental = mongoose.model("Rental", new mongoose.Schema({
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

// VEHICLES
app.post("/vehicles", async (req, res) => {
  const v = await Vehicle.create(req.body);
  res.send(v);
});

app.get("/vehicles", async (req, res) => {
  res.send(await Vehicle.find());
});

// CUSTOMERS
app.post("/customers", async (req, res) => {
  const c = await Customer.create(req.body);
  res.send(c);
});

app.get("/customers", async (req, res) => {
  res.send(await Customer.find());
});

// RENTALS
app.post("/rentals", async (req, res) => {
  const r = await Rental.create(req.body);
  res.send(r);
});

app.get("/rentals", async (req, res) => {
  res.send(await Rental.find());
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));