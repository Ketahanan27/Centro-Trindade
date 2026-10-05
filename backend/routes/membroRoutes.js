import express from "express";
import { getMembroFoto } from "../controllers/membroFotoController.js";
import multer from "multer";
import { detectImage } from "../config/photoStorage.js";

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
import { writeLimiter } from "../middleware/rateLimit.js";

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Apenas imagens são permitidas."));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

/*
|--------------------------------------------------------------------------
| Validação da assinatura binária da imagem
|--------------------------------------------------------------------------
|
| O mimetype do multipart/form-data é enviado pelo cliente e pode ser
| falsificado. Este middleware confirma o conteúdo real em memória
| antes de guardar a fotografia. Isto evita que um
| ficheiro disfarçado de imagem (ex.: .html com mimetype "image/png"
| forjado) fique acessível publicamente.
|
*/
const validarAssinaturaImagem = (req, res, next) => {
  if (!req.file) return next();
  if (!detectImage(req.file.buffer)) {
    return res.status(400).json({ message: "O ficheiro enviado não é uma imagem válida." });
  }
  next();
};

const router = express.Router();

router.get("/me", verifyToken, getMembroMe);
router.get("/:id/foto", verifyToken, getMembroFoto);
router.put("/me", verifyToken, writeLimiter, updateMembroMe);
router.post("/me/foto", verifyToken, writeLimiter, upload.single("foto"), validarAssinaturaImagem, uploadMembroFoto);
router.get("/", verifyToken, permit("Administrador", "Secretaria", "Pastor"), getMembers);
router.post("/", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, createMember);
router.put("/:id", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, updateMember);
router.delete("/:id", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, deleteMember);

export default router;
