const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4000;
const mongoose = require("mongoose");
const Produit = require("./Produit");



app.use(express.json());

mongoose.set('strictQuery', true);

mongoose.connect("mongodb://localhost/produit-service", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ Produit-Service DB Connected");
})
.catch((err) => {
  console.error("❌ Échec de connexion à MongoDB :", err.message);
});

// Ajouter un produit
app.post("/produit/ajouter", (req, res) => {
  const { nom, description, prix } = req.body;

  newProduit.save()
    .then(produit => res.status(201).json(produit))
    .catch(error => res.status(400).json({ error }));
});

// Acheter (récupérer des produits par ID)
app.post("/produit/acheter", (req, res) => {
  const { ids } = req.body;

  Produit.find({ _id: { $in: ids } })
    .then(produits => res.status(200).json(produits))
    .catch(error => res.status(400).json({ error }));
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Product-Service en écoute sur le port ${PORT}`);
});
