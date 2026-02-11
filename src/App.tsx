import { useState, useEffect } from "react";

// Backend API
const API = "/api";

// ---------------- DATA MODELS ----------------

const createVehicle = (vehicleNumber: string, model: string, color: string) => ({
  id: crypto.randomUUID(),
  vehicleNumber,
  model,
  color,
  status: "AVAILABLE",
});

const createCustomer = (name: string, phone: string, dl: string) => ({
  id: crypto.randomUUID(),
  name,
  phone,
  drivingLicense: dl,
  username: name + phone.slice(-5),
});

const createRental = (vehicle: any, customer: any, mode: string, minutes = 0) => ({
  id: crypto.randomUUID(),
  vehicleId: vehicle.id,
  vehicleNumber: vehicle.vehicleNumber,
  customerId: customer.id,
  username: customer.username,
  mode,
  startTime: Date.now(),
  expectedEndTime: mode === "FIXED" ? Date.now() + minutes * 60000 : null,
  billing: 0,
  status: "ACTIVE",
});

export default function ScottyOSDashboard() {
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pin, setPin] = useState("");

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);

  const [tab, setTab] = useState("available");

  const [vehicleForm, setVehicleForm] = useState({ vehicleNumber: "", model: "", color: "" });
  const [customerForm, setCustomerForm] = useState({ name: "", phone: "", dl: "" });

  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [mode, setMode] = useState("FREE");
  const [minutes, setMinutes] = useState(0);

  const PRICE_PER_MIN = 2;

  // ---------------- LOAD DATA FROM MONGODB ----------------

 useEffect(() => {
  fetch(API + "/vehicles")
    .then(res => res.json())
    .then(data => setVehicles(data));

  fetch(API + "/customers")
    .then(res => res.json())
    .then(data => setCustomers(data));

  fetch(API + "/rentals")
    .then(res => res.json())
    .then(data => setRentals(data));
}, []);


  // ---------------- BILLING ENGINE ----------------

  useEffect(() => {
    const timer = setInterval(() => {
      setRentals(prev =>
        prev.map(r => {
          if (r.status !== "ACTIVE") return r;
          const elapsedMin = Math.floor((Date.now() - r.startTime) / 60000);
          return { ...r, billing: elapsedMin * PRICE_PER_MIN };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ---------------- PIN LOCK ----------------

  const unlock = () => {
    if (pin === "1234") setPinUnlocked(true);
  };

  if (!pinUnlocked) {
    return (
      <div style={styles.lockScreen}>
        <div style={styles.card}>
          <h2>ScottyOS</h2>
          <input type="password" placeholder="Enter PIN" value={pin} onChange={e => setPin(e.target.value)} style={styles.input} />
          <button onClick={unlock} style={styles.primaryBtn}>Unlock</button>
        </div>
      </div>
    );
  }

  // ---------------- ACTIONS ----------------

const addVehicle = async () => {
  const newVehicle = createVehicle(
    vehicleForm.vehicleNumber,
    vehicleForm.model,
    vehicleForm.color
  );

  const res = await fetch(API + "/vehicles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newVehicle),
  });

  const savedVehicle = await res.json();
  setVehicles(prev => [...prev, savedVehicle]);
};


  const addCustomer = async () => {
    if (!customerForm.dl) return alert("Driving license required");

    const newCustomer = createCustomer(customerForm.name, customerForm.phone, customerForm.dl);

    await fetch(API + "/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCustomer),
    });

    setCustomers([...customers, newCustomer]);
    setCustomerForm({ name: "", phone: "", dl: "" });
  };

  const startRental = async () => {
    if (!selectedVehicle || !selectedCustomer) return alert("Select vehicle & customer");

    const rental = createRental(selectedVehicle, selectedCustomer, mode, minutes);

    await fetch(API + "/rentals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rental),
    });

    setRentals([...rentals, rental]);
    setVehicles(vehicles.map(v => v.id === selectedVehicle.id ? { ...v, status: "ACTIVE" } : v));
  };

  const endRental = (rental: any) => {
    setRentals(rentals.map(r => r.id === rental.id ? { ...r, status: "COMPLETED" } : r));
    setVehicles(vehicles.map(v => v.id === rental.vehicleId ? { ...v, status: "AVAILABLE" } : v));
  };

  // ---------------- UI ----------------

  return (
    <div style={styles.container}>
      <h1>ScottyOS Dashboard</h1>

      <div style={styles.tabs}>
        {["available", "active", "vehicles", "customers", "summary"].map(t => (
          <button key={t} style={tab === t ? styles.activeTab : styles.tab} onClick={() => setTab(t)}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* AVAILABLE */}
      {tab === "available" && (
        <div>
          <h2>Start Rental</h2>

          <select onChange={e => setSelectedVehicle(vehicles.find(v => v.id === e.target.value))} style={styles.input}>
            <option>Select Vehicle</option>
            {vehicles.filter(v => v.status === "AVAILABLE").map(v => (
              <option key={v.id} value={v.id}>{v.vehicleNumber}</option>
            ))}
          </select>

          <select onChange={e => setSelectedCustomer(customers.find(c => c.id === e.target.value))} style={styles.input}>
            <option>Select Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.username}</option>
            ))}
          </select>

          <select onChange={e => setMode(e.target.value)} style={styles.input}>
            <option value="FREE">Free Mode</option>
            <option value="FIXED">Fixed Mode</option>
          </select>

          {mode === "FIXED" && (
            <input type="number" placeholder="Minutes" onChange={e => setMinutes(Number(e.target.value))} style={styles.input} />
          )}

          <button onClick={startRental} style={styles.primaryBtn}>Start Rental</button>
          <h2>Active Rentals</h2>
          {rentals.filter(r => r.status === "ACTIVE").map(r => (
            <div key={r.id} style={styles.card}>
              <b>{r.vehicleNumber}</b>
              <p>User: {r.username}</p>
              <p>Mode: {r.mode}</p>
              <p>Billing: ₹{r.billing}</p>
              <button onClick={() => endRental(r)} style={styles.dangerBtn}>End Rental</button>
            </div>
          ))}
        </div>
        
      )}

      {/* ACTIVE */}
      {tab === "active" && (
        <div>
          <h2>Active Rentals</h2>
          {rentals.filter(r => r.status === "ACTIVE").map(r => (
            <div key={r.id} style={styles.card}>
              <b>{r.vehicleNumber}</b>
              <p>User: {r.username}</p>
              <p>Mode: {r.mode}</p>
              <p>Billing: ₹{r.billing}</p>
              <button onClick={() => endRental(r)} style={styles.dangerBtn}>End Rental</button>
            </div>
          ))}
        </div>
      )}

      {/* VEHICLES */}
      {tab === "vehicles" && (
        <div>
          <h2>Add Vehicle</h2>
          <input placeholder="Number" value={vehicleForm.vehicleNumber} onChange={e => setVehicleForm({ ...vehicleForm, vehicleNumber: e.target.value })} style={styles.input}/>
          <input placeholder="Model" value={vehicleForm.model} onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })} style={styles.input}/>
          <input placeholder="Color" value={vehicleForm.color} onChange={e => setVehicleForm({ ...vehicleForm, color: e.target.value })} style={styles.input}/>
          <button onClick={addVehicle} style={styles.primaryBtn}>Add Vehicle</button>
        </div>
      )}

      {/* CUSTOMERS */}
      {tab === "customers" && (
        <div>
          <h2>Add Customer</h2>
          <input placeholder="Name" value={customerForm.name} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} style={styles.input}/>
          <input placeholder="Phone" value={customerForm.phone} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} style={styles.input}/>
          <input placeholder="Driving License" value={customerForm.dl} onChange={e => setCustomerForm({ ...customerForm, dl: e.target.value })} style={styles.input}/>
          <button onClick={addCustomer} style={styles.primaryBtn}>Add Customer</button>
        </div>
      )}

      {/* SUMMARY */}
      {tab === "summary" && (
        <div>
          <h2>Summary</h2>
          <p>Total Vehicles: {vehicles.length}</p>
          <p>Total Customers: {customers.length}</p>
          <p>Active Rentals: {rentals.filter(r => r.status === "ACTIVE").length}</p>
        </div>
      )}
    </div>
  );
}

// ---------------- STYLES ----------------

const styles = {
  container: { padding: 30, fontFamily: "Inter, sans-serif", minHeight: "100vh" },
  lockScreen: { height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111827" },
  card: { background: "#111827", padding: 20, borderRadius: 10, marginBottom: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
  input: { display: "block", marginBottom: 10, padding: 10, width: "300px" },
  primaryBtn: { padding: 10, background: "#111827", color: "white", border: "none", marginTop: 5 },
  dangerBtn: { padding: 10, background: "#b91c1c", color: "white", border: "none", marginTop: 5 },
  tabs: { marginBottom: 20 },
  tab: { marginRight: 10, padding: 10,  border: "none" },
  activeTab: { marginRight: 10, padding: 10, background: "#111827", color: "white", border: "none" },
};
