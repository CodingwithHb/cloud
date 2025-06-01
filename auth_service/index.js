const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4002;
const mongoose = require("mongoose");
const Utilisateur = require("./utilisateur");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

mongoose.set("strictQuery", true);

async function startServer() {
  try {
    await mongoose.connect("mongodb://localhost/auth-service", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Auth-Service DB Connected");

    app.use(express.json());

    // 👉 Register
    app.post("/auth/register", async (req, res) => {
      try {
        const { nom, email, mot_passe } = req.body;

        const userExists = await Utilisateur.findOne({ email });
        if (userExists) {
          return res.status(400).json({ message: "Cet utilisateur existe déjà" });
        }

        const hash = await bcrypt.hash(mot_passe, 10);
        const newUtilisateur = new Utilisateur({ nom, email, mot_passe: hash });
        const user = await newUtilisateur.save();
        return res.status(201).json(user);

      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    });

    // 👉 Login
    app.post("/auth/login", async (req, res) => {
      try {
        const { email, mot_passe } = req.body;

        const utilisateur = await Utilisateur.findOne({ email });
        if (!utilisateur) {
          return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const isMatch = await bcrypt.compare(mot_passe, utilisateur.mot_passe);
        if (!isMatch) {
          return res.status(400).json({ message: "Mot de passe incorrect" });
        }

        const token = jwt.sign(
          { id: utilisateur._id, email: utilisateur.email },
          "jwtsecretkey", // 🔐 À remplacer par une variable d'environnement
          { expiresIn: "1h" }
        );

        return res.status(200).json({ token });

      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    });

    app.listen(PORT, () => {
      console.log(`🚀 Auth-Service running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Échec de connexion à MongoDB :", err.message);
  }
}

startServer();
