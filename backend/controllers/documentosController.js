import db from "../config/db.js";

export const getDocumentos = (req, res) => {

  db.query(
    "SELECT * FROM documentos ORDER BY id DESC",
    (err, results) => {
      if (err) {
        console.error("[getDocumentos]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }

      // CORRIGIDO: dados_json era guardado como string JSON na DB e devolvido
      // como string crua ao cliente. A função reimprimir() fazia:
      //   setFormData(doc.dados_json)  →  setFormData("{ \"nome\": ... }")
      // O formulário recebia uma string em vez de objeto, quebrando todos os campos.
      // Agora é parsed antes de enviar ao cliente.
      const parsed = results.map(doc => ({
        ...doc,
        dados_json: (() => {
          try {
            return doc.dados_json
              ? JSON.parse(doc.dados_json)
              : {};
          } catch {
            return {};
          }
        })()
      }));

      res.json(parsed);
    }
  );
};

export const createDocumento = (req, res) => {

  const { tipo, nome_completo, bi, data_emissao, dados_json } = req.body;

  if (!tipo || !nome_completo || !bi) {
    return res.status(400).json({
      message: "Tipo, nome e BI são obrigatórios."
    });
  }

  db.query(
    `INSERT INTO documentos (tipo, nome_completo, bi, data_emissao, dados_json)
     VALUES (?, ?, ?, ?, ?)`,
    [tipo, nome_completo, bi, data_emissao, JSON.stringify(dados_json)],
    (err, result) => {
      if (err) {
        console.error("[createDocumento]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.json({ message: "Documento guardado", id: result.insertId });
    }
  );
};

// CORRIGIDO: função deleteDocumento completamente em falta —
// documentos.jsx chamava DELETE /api/documentos/:id mas não existia
// nem no controller nem na route → 404 ao tentar eliminar documentos
export const deleteDocumento = (req, res) => {

  const { id } = req.params;

  db.query(
    "DELETE FROM documentos WHERE id = ?",
    [id],
    (err) => {
      if (err) {
        console.error("[deleteDocumento]", err);
        return res.status(500).json({ message: "Erro interno do servidor." });
      }
      res.json({ message: "Documento eliminado com sucesso." });
    }
  );
};