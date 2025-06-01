const jwt = require('jsonwebtoken');

module.exports = async function isAuthenticated(req, res, next) {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Token manquant" });
    }

    jwt.verify(token, process.env.JWT_SECRET || "jwtsecretkey", (err, user) => {
      if (err) {
        return res.status(401).json({ message: "Token invalide" });
      }

      req.user = user;
      next();
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
