const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4001;
const mongoose = require("mongoose");
const Commande = require("./Commande");
const axios = require("axios");
const isAuthenticated = require("./isAuthenticated");

app.use(express.json());

mongoose.set('strictQuery', true);

// ✅ Connexion MongoDB sans options dépréciées
mongoose.connect("mongodb://localhost/commande-service")
  .then(() => {
    console.log("✅ Commande-Service DB Connected");
  })
  .catch(err => {
    console.error("❌ Erreur de connexion MongoDB :", err.message);
  });

// 🧮 Fonction pour calculer le prix total
function prixTotal(produits) {
  return produits.reduce((total, produit) => total + produit.prix, 0);
}

// 🔗 Fonction pour récupérer les produits depuis produit-service
async function httpRequest(ids) {
  try {
    const URL = "http://localhost:4000/produit/acheter";
    const response = await axios.post(URL, { ids }, {
      headers: {
        "Content-Type": "application/json"
      }
    });
    const total = prixTotal(response.data);
    console.log("🧾 Prix total :", total);
    return total;
  } catch (error) {
    console.error("❌ Erreur appel produit-service :", error.message);
    throw error;
  }
}

// 📦 Création d’une commande
app.post("/commande/ajouter", isAuthenticated,async (req, res) => {
  const { ids, email_utilisateur } = req.body;

  try {
    const total = await httpRequest(ids);
    const newCommande = new Commande({
      ids,
      email_utilisateur:req.user.email,
      prix_total: total
    });

    const savedCommande = await newCommande.save();
    res.status(201).json(savedCommande);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Commande-Service en écoute sur le port ${PORT}`);
});
