// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import rotte
import productsRouter from "./routes/products.js"; 
import supportRoutes from "./routes/supportRoutes.js";
import recommendRoutes from "./routes/recommendRoutes.js";
import ordersRouter from "./routes/orders.js";
import prizesRouter from "./routes/prizes.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import reviewsRoutes from "./routes/reviews.js";

// Modello User per le rotte custom
import User from "./app/models/User.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://fidelitycard.vercel.app",
    "https://fidelitycard-fq48d3j25-saras-projects-03944b8e.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // aggiungi OPTIONS
  allowedHeaders: ["Content-Type", "Authorization"]     // aggiungi Authorization
}));

// Supporta richieste preflight
app.options("*", cors());

app.use(express.json()); // parsing JSON

// ✅ Rotta base per test backend
app.get("/", (req, res) => {
  res.send("Backend online 🚀");
});

// ✅ Rotte API
app.use("/api/products", productsRouter);
app.use("/api/support", supportRoutes);
app.use("/api/recommendations", recommendRoutes);
app.use("/api/orders", ordersRouter);
app.use("/api/prizes", prizesRouter);
app.use("/uploads", express.static("uploads")); // static files
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewsRoutes);

// ✅ Connessione MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connesso"))
.catch((err) => console.error("Errore connessione MongoDB:", err));

// ✅ Rotte custom esempio: aggiunta punti
app.put("/api/users/:id/add-points", async (req, res) => {
  const { id } = req.params;
  const { points } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Utente non trovato" });

    user.points += points;
    await user.save();

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

// ✅ Rotta custom esempio: bonus QR
app.put("/api/users/:id/qr-bonus", async (req, res) => {
  const { id } = req.params;
  const bonusPoints = 50; 

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Utente non trovato" });

    user.points += bonusPoints;
    user.history = user.history || [];
    user.history.push({ date: new Date(), points: user.points });
    await user.save();

    res.json({ user, message: `🎁 Bonus QR di ${bonusPoints} punti aggiunto!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore server" });
  }
});

// ✅ Avvio server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server avviato su porta ${PORT}`));
