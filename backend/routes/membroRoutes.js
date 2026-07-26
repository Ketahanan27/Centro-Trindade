import express from "express";
import multer from "multer";
import fs from "fs";
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
import { writeLimiter } from "../middleware/rateLimit.js";

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

/*
|--------------------------------------------------------------------------
| Validação da assinatura binária da imagem
|--------------------------------------------------------------------------
|
| O mimetype do multipart/form-data é enviado pelo cliente e pode ser
| falsificado. Este middleware confirma o conteúdo real do ficheiro já
| gravado em disco, lendo os primeiros bytes (magic bytes), antes de o
| aceitar. Como /uploads é servido como estático, isto evita que um
| ficheiro disfarçado de imagem (ex.: .html com mimetype "image/png"
| forjado) fique acessível publicamente.
|
*/
const ASSINATURAS_IMAGEM = [
  { bytes: [0xff, 0xd8, 0xff] },
  { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { bytes: [0x47, 0x49, 0x46, 0x38] },
  { bytes: [0x52, 0x49, 0x46, 0x46], offset: { at: 8, bytes: [0x57, 0x45, 0x42, 0x50] } },
];

const validarAssinaturaImagem = (req, res, next) => {
  if (!req.file) return next();

  try {
    const fd = fs.openSync(req.file.path, "r");
    const buffer = Buffer.alloc(12);
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    const valido = ASSINATURAS_IMAGEM.some(({ bytes, offset }) => {
      const inicioOk = bytes.every((b, i) => buffer[i] === b);
      if (!inicioOk) return false;
      if (!offset) return true;
      return offset.bytes.every((b, i) => buffer[offset.at + i] === b);
    });

    if (!valido) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: "O ficheiro enviado não é uma imagem válida." });
    }

    next();
  } catch (err) {
    console.error("[validarAssinaturaImagem]", err);
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ message: "Não foi possível validar o ficheiro enviado." });
  }
};

const router = express.Router();

router.get("/me", verifyToken, getMembroMe);
router.put("/me", verifyToken, writeLimiter, updateMembroMe);
router.post("/me/foto", verifyToken, writeLimiter, upload.single("foto"), validarAssinaturaImagem, uploadMembroFoto);
router.get("/", verifyToken, permit("Administrador", "Secretaria", "Pastor"), getMembers);
router.post("/", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, createMember);
router.put("/:id", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, updateMember);
router.delete("/:id", verifyToken, permit("Administrador", "Secretaria"), writeLimiter, deleteMember);

export default router;
