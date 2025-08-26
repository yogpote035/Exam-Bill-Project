const { jwtDecrypt } = require("jose");
const encoder = new TextEncoder();

async function VerifyToken(req, res, next) {
  console.log("call in Verify Token ");
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const raw = process.env.SECRET_KEY.slice(0, 32); // must match CreateToken
    const secret = encoder.encode(raw);

    const { payload } = await jwtDecrypt(token, secret);

    req.user = payload;
    console.log("Decoded Payload:", payload); //  full payload

    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = VerifyToken;