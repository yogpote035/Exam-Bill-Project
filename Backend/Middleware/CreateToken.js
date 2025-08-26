const { EncryptJWT } = require("jose");
const encoder = new TextEncoder();

async function CreateToken(userId, role, email, fullName) {
  console.log("call in Create Token ");
  const raw = process.env.SECRET_KEY.slice(0, 32); // must be the same as verify
  const secret = encoder.encode(raw);

  const payload = {
    userId: userId.toString(),
    role: role,
    email: email,
    name: fullName,
  };

  console.log("payload from Create token : ", payload);

  const jwe = await new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("3d")
    .encrypt(secret);

  console.log("call Done from Create Token ");
  return jwe;
}

module.exports = CreateToken;