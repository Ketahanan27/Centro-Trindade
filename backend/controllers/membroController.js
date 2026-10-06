import db from "../config/db.js";
import { validarMembro, validarId } from '../utils/inputValidation.js';
import { savePhoto, removePhoto } from "../config/photoStorage.js";

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, r) => (err ? reject(err) : resolve(r)))
  );

async function validarAssociacao(req, res, memberId = null) {
  if (!Object.hasOwn(req.body, "utilizador_id")) return true;
  if (req.user.perfil !== "Administrador") {
    res.status(403).json({ message: "Só o administrador pode associar contas a membros." });
    return false;
  }
  const id = req.body.utilizador_id;
  if (id === null || id === "") return true;
  if (!["number", "string"].includes(typeof id) || !/^\d+$/.test(String(id)) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
    res.status(400).json({ message: "Conta inválida." });
    return false;
  }
  if (memberId !== null) {
    const current = await query("SELECT utilizador_id FROM membros WHERE id = $1", [memberId]);
    if (current[0]?.utilizador_id === Number(id)) return true;
  }
  const accounts = await query("SELECT id FROM utilizadores WHERE id = $1 AND estado = 'Ativo'", [id]);
  if (!accounts.length) {
    res.status(400).json({ message: "Selecione uma conta ativa." });
    return false;
  }
  const linked = await query("SELECT id FROM membros WHERE utilizador_id = $1 AND ($2::integer IS NULL OR id <> $2)", [id, memberId]);
  if (linked.length) {
    res.status(409).json({ message: "Esta conta já está associada a outro membro." });
    return false;
  }
  return true;
}

export const createMember = async (req, res) => {
  try {
    req.body = validarMembro(req.body);
    if (!await validarAssociacao(req, res)) return;
    const {
      nome, email, telemovel, nascimento, sexo,
      estado_civil, morada, codigo_postal,
      entrada, batizado, estado,
      utilizador_id,
    } = req.body;

    await query(
      `INSERT INTO membros
         (nome, email, telemovel, nascimento, sexo, estado_civil,
          morada, codigo_postal, entrada, batizado, estado, utilizador_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [
        nome.trim(),
        email?.trim() || null,
        telemovel || null,
        nascimento || null,
        sexo || null,
        estado_civil || null,
        morada || null,
        codigo_postal || null,
        entrada || null,
        batizado || "Não",
        estado || "Ativo",
        utilizador_id || null,
      ]
    );
    res.status(201).json({ message: "Membro criado com sucesso." });
  } catch (e) {
    if (e.status === 400) return res.status(400).json({ message: e.message });
    if (e.code === "23505") return res.status(409).json({ message: "Esta conta já está associada a outro membro." });
    if (e.code === '23503') return res.status(409).json({ message: 'A conta selecionada já não está disponível. Atualize a lista de contas.' });
    console.error("[createMember]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const getMembers = async (req, res) => {
  try {
    const result = await query(`
      SELECT
        id,
        nome,
        email,
        telemovel,
        TO_CHAR(nascimento, 'YYYY-MM-DD') AS nascimento,
        sexo,
        estado_civil,
        morada,
        codigo_postal,
        TO_CHAR(entrada, 'YYYY-MM-DD')    AS entrada,
        batizado,
        estado,
        foto,
        utilizador_id,
        criado_em AS created_at
      FROM membros
      ORDER BY id DESC
    `);
    res.json(result.map((member) => ({ ...member, foto: member.foto ? `/api/membros/${member.id}/foto` : null })));
  } catch (e) {
    console.error("[getMembers]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    validarId(id);
    req.body = validarMembro(req.body);
    if (!await validarAssociacao(req, res, id)) return;
    const {
      nome, email, telemovel, nascimento, sexo,
      estado_civil, morada, codigo_postal,
      entrada, batizado, estado,
      utilizador_id,
    } = req.body;

    const result = await query(
      `UPDATE membros
       SET nome=$1, email=$2, telemovel=$3, nascimento=$4, sexo=$5,
           estado_civil=$6, morada=$7, codigo_postal=$8,
           entrada=$9, batizado=$10, estado=$11,
           utilizador_id=CASE WHEN $14::boolean THEN $12::integer ELSE utilizador_id END
       WHERE id=$13`,
      [
        nome.trim(),
        email?.trim() || null,
        telemovel || null,
        nascimento || null,
        sexo || null,
        estado_civil || null,
        morada || null,
        codigo_postal || null,
        entrada || null,
        batizado || "Não",
        estado || "Ativo",
        utilizador_id || null,
        id,
        Object.hasOwn(req.body, "utilizador_id"),
      ]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Membro não encontrado." });
    res.json({ message: "Membro atualizado com sucesso." });
  } catch (e) {
    if (e.status === 400) return res.status(400).json({ message: e.message });
    if (e.code === "23505") return res.status(409).json({ message: "Esta conta já está associada a outro membro." });
    if (e.code === '23503') return res.status(409).json({ message: 'A conta selecionada já não está disponível. Atualize a lista de contas.' });
    console.error("[updateMember]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const updateMembroMe = async (req, res) => {
  try {
    req.body = validarMembro(req.body, true);
    const {
      telemovel,
      sexo,
      estado_civil,
      morada,
      codigo_postal,
    } = req.body;

    const result = await query(
      `UPDATE membros AS m
       SET telemovel = $1,
           sexo = $2,
           estado_civil = $3,
           morada = $4,
           codigo_postal = $5
       FROM utilizadores AS u
       WHERE u.id = m.utilizador_id AND u.id = $6`,
      [
        telemovel ?? null,
        sexo ?? null,
        estado_civil ?? null,
        morada ?? null,
        codigo_postal ?? null,
        req.user.id,
      ]
    );

    const affected = result?.rowCount ?? 0;
    if (affected === 0) {
      return res.status(404).json({ message: "Perfil de membro não encontrado." });
    }

    res.json({ message: "Perfil atualizado com sucesso." });
  } catch (e) {
    if (e.status === 400) return res.status(400).json({ message: e.message });
    console.error("[updateMembroMe]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    validarId(id);
    const removed = await query("DELETE FROM membros WHERE id=$1 RETURNING foto", [id]);
    if (removed.rowCount === 0) return res.status(404).json({ message: "Membro não encontrado." });
    if (removed.rows[0]?.foto) await removePhoto(removed.rows[0].foto).catch((error) => console.error("[photoCleanup]", error.code ?? "erro"));
    res.json({ message: "Membro eliminado com sucesso." });
  } catch (e) {
    if (e.status === 400) return res.status(400).json({ message: e.message });
    if (e.code === '23503') return res.status(409).json({ message: 'Este membro tem registos associados e não pode ser eliminado.' });
    console.error("[deleteMember]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const getMembroMe = async (req, res) => {
  try {
    const result = await query(
      `SELECT
         m.id, m.nome, m.email, m.telemovel,
         TO_CHAR(m.nascimento, 'YYYY-MM-DD') AS nascimento,
         m.sexo, m.estado_civil, m.morada, m.codigo_postal,
         TO_CHAR(m.entrada, 'YYYY-MM-DD')    AS entrada,
         m.batizado, m.estado, m.foto
       FROM membros m
       INNER JOIN utilizadores u ON u.id = m.utilizador_id
       WHERE u.id = $1
       LIMIT 1`,
      [req.user.id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "Perfil de membro não encontrado. Contacte a secretaria.",
      });
    }

    res.json({ ...result[0], foto: result[0].foto ? `/api/membros/${result[0].id}/foto` : null });
  } catch (e) {
    console.error("[getMembroMe]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const uploadMembroFoto = async (req, res) => {
  let stored;
  let updatePending = false;
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Selecione uma imagem para carregar." });
    }

    const members = await query("SELECT id FROM membros WHERE utilizador_id = $1", [req.user.id]);
    if (members.length !== 1) {
      return res.status(404).json({ message: "Perfil de membro não encontrado. Contacte a secretaria." });
    }

    stored = await savePhoto(req.file, req.user.id);
    const fotoUrl = stored.url;
    updatePending = true;
    const result = await query(
      `WITH anterior AS (SELECT foto FROM membros WHERE id = $2 AND utilizador_id = $3 FOR UPDATE)
       UPDATE membros AS m
       SET foto = $1
       FROM anterior
       WHERE m.id = $2 AND m.utilizador_id = $3
       RETURNING anterior.foto AS foto_anterior`,
      [fotoUrl, members[0].id, req.user.id]
    );
    updatePending = false;

    const affected = result?.rowCount ?? 0;

    if (affected === 0) {
      await stored.remove().catch(() => {});
      return res.status(404).json({ message: "Perfil de membro não encontrado. Contacte a secretaria." });
    }

    const anterior = result.rows[0]?.foto_anterior;
    if (anterior && anterior !== fotoUrl) await removePhoto(anterior).catch((error) => console.error("[photoCleanup]", error.code ?? "erro"));
    res.json({ message: "Foto de perfil atualizada com sucesso.", foto: `/api/membros/${members[0].id}/foto` });
  } catch (e) {
    // A disconnected database response can conceal a committed UPDATE.
    // Preserve the uploaded file for reconciliation in that case.
    if (stored && !updatePending) await stored.remove().catch(() => {});
    if (e.status === 400) return res.status(400).json({ message: e.message });
    console.error("[uploadMembroFoto]", e.code ?? "erro");
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
