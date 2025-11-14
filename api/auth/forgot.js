import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const token = crypto.randomBytes(16).toString("hex");
  return res.status(200).json({ msg: "sent", demo_link: `/reset?token=${token}` });
}

