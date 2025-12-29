import crypto from "crypto";

export const generateViewerHash = (req) => {
  return crypto
    .createHash("sha256")
    .update(req.ip + (req.headers["user-agent"] || ""))
    .digest("hex");
};
