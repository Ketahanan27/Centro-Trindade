import db from "../config/db.js";
import { validarDocumento } from "../../shared/documentos.js";

export const getDocumentos = (req, res) => {
  db.query("SELECT * FROM documentos ORDER BY id DESC", (err, results) => {
    if (err) {
      console.error("[getDocumentos]", err);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }

    const parsed = results.map((doc) => ({
      ...doc,
      dados_json: (() => {
        try {
          return typeof doc.dados_json === "string"
            ? JSON.parse(doc.dados_json)
            : doc.dados_json ?? {};
        } catch {
          return {};
        }
      })(),
    }));

    res.json(parsed);
  });
};

export const createDocumento = (req, res) => {
  const { tipo, nome_completo, bi, data_emissao, dados_json } = req.body;

  const erro = validarDocumento(req.body);
  if (erro) return res.status(400).json({ message: erro });

  db.query(
    `INSERT INTO documentos (tipo, nome_completo, bi, data_emissao, dados_json)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [tipo, nome_completo, bi, data_emissao, JSON.stringify(dados_json)],
    (err, result) => {
      if (err) {
        console.error("[createDocumento]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.status(201).json({ message: "Documento guardado", id: result.rows[0].id });
    }
  );
};

export const deleteDocumento = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM documentos WHERE id = $1", [id], (err, result) => {
    if (err) {
      console.error("[deleteDocumento]", err);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
    if (result.rowCount === 0) return res.status(404).json({ message: "Documento não encontrado." });
    res.json({ message: "Documento eliminado com sucesso." });
  });
};
