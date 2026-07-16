import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import {
  createMember,
  getMembers,
  updateMember,
  updateMembroMe,
  deleteMember,
  getMembroMe,
  uploadMembroFoto,
} from "../controllers/membroController.js";

import { verifyToken, permit } from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `membro_${req.user.id}_${Date.now()}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Apenas imagens são permitidas."));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

const router = express.Router();

router.get("/me", verifyToken, getMembroMe);
router.put("/me", verifyToken, updateMembroMe);
router.post("/me/foto", verifyToken, upload.single("foto"), uploadMembroFoto);
router.get("/",    verifyToken, permit("Administrador", "Secretaria", "Pastor"), getMembers);
router.post("/",   verifyToken, permit("Administrador", "Secretaria"), createMember);
router.put("/:id", verifyToken, permit("Administrador", "Secretaria"), updateMember);
router.delete("/:id", verifyToken, permit("Administrador", "Secretaria"), deleteMember);

export default router;
