import db from "../config/db.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const query = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.query(sql, params, (err, r) => (err ? reject(err) : resolve(r)))
  );

export const createMember = async (req, res) => {
  try {
    const {
      nome, email, telemovel, nascimento, sexo,
      estado_civil, morada, codigo_postal,
      entrada, batizado, estado,
      utilizador_id,
    } = req.body;

    if (!nome?.trim()) {
      return res.status(400).json({ message: "Nome é obrigatório." });
    }
    if (email?.trim() && !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Formato de email inválido." });
    }
    await query(
      `INSERT INTO membros
         (nome, email, telemovel, nascimento, sexo, estado_civil,
          morada, codigo_postal, entrada, batizado, estado, utilizador_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome.trim(),
        email?.trim()    || null,
        telemovel        || null,
        nascimento       || null,
        sexo             || null,
        estado_civil     || null,
        morada           || null,
        codigo_postal    || null,
        entrada          || null,
        batizado         || "Não",
        estado           || "Ativo",
        utilizador_id    || null,
      ]
    );
    res.status(201).json({ message: "Membro criado com sucesso." });

  } catch (e) {
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
        DATE_FORMAT(nascimento, '%Y-%m-%d') AS nascimento,
        sexo,
        estado_civil,
        morada,
        codigo_postal,
        DATE_FORMAT(entrada, '%Y-%m-%d')    AS entrada,
        batizado,
        estado,
        foto,
        criado_em AS created_at
      FROM membros
      ORDER BY id DESC
    `);
    res.json(result);
  } catch (e) {
    console.error("[getMembers]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome, email, telemovel, nascimento, sexo,
      estado_civil, morada, codigo_postal,
      entrada, batizado, estado,
      utilizador_id,
    } = req.body;
    if (!nome?.trim()) {
      return res.status(400).json({ message: "Nome é obrigatório." });
    }
    if (email?.trim() && !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Formato de email inválido." });
    }
    await query(
      `UPDATE membros
       SET nome=?, email=?, telemovel=?, nascimento=?, sexo=?,
           estado_civil=?, morada=?, codigo_postal=?,
           entrada=?, batizado=?, estado=?, utilizador_id=?
       WHERE id=?`,
      [
        nome.trim(),
        email?.trim()    || null,
        telemovel        || null,
        nascimento       || null,
        sexo             || null,
        estado_civil     || null,
        morada           || null,
        codigo_postal    || null,
        entrada          || null,
        batizado         || "Não",
        estado           || "Ativo",
        utilizador_id    || null,
        id,
      ]
    );
    res.json({ message: "Membro atualizado com sucesso." });

  } catch (e) {
    console.error("[updateMember]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const updateMembroMe = async (req, res) => {
  try {
    const {
      telemovel,
      sexo,
      estado_civil,
      morada,
      codigo_postal,
      entrada,
      batizado,
    } = req.body;

    if (telemovel && !/^\d{1,9}$/.test(String(telemovel).trim())) {
      return res.status(400).json({ message: "O telemóvel deve ter até 9 dígitos." });
    }

    if (codigo_postal && !/^\d{4}-\d{3}$/.test(String(codigo_postal).trim())) {
      return res.status(400).json({ message: "O código postal deve ter o formato XXXX-XXX." });
    }

    const result = await query(
      `UPDATE membros m
       INNER JOIN utilizadores u ON u.id = m.utilizador_id
       SET telemovel = ?,
           sexo = ?,
           estado_civil = ?,
           morada = ?,
           codigo_postal = ?,
           entrada = ?,
           batizado = ?
       WHERE u.id = ?`,
      [
        telemovel ?? null,
        sexo ?? null,
        estado_civil ?? null,
        morada ?? null,
        codigo_postal ?? null,
        entrada ?? null,
        batizado ?? "Não",
        req.user.id,
      ]
    );

    const affected = result?.affectedRows ?? 0;
    if (affected === 0) {
      return res.status(404).json({ message: "Perfil de membro não encontrado." });
    }

    res.json({ message: "Perfil atualizado com sucesso." });
  } catch (e) {
    console.error("[updateMembroMe]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM membros WHERE id=?", [id]);
    res.json({ message: "Membro eliminado com sucesso." });
  } catch (e) {
    console.error("[deleteMember]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const getMembroMe = async (req, res) => {
  try {
    const result = await query(
        `SELECT
           m.id, m.nome, m.email, m.telemovel,
           DATE_FORMAT(m.nascimento, '%Y-%m-%d') AS nascimento,
           m.sexo, m.estado_civil, m.morada, m.codigo_postal,
           DATE_FORMAT(m.entrada, '%Y-%m-%d')    AS entrada,
           m.batizado, m.estado, m.foto
         FROM membros m
         INNER JOIN utilizadores u ON (u.id = m.utilizador_id OR u.email = m.email)
         WHERE u.id = ?
         LIMIT 1`,
        [req.user.id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "Perfil de membro não encontrado. Contacte a secretaria.",
      });
    }

    res.json(result[0]);

  } catch (e) {
    console.error("[getMembroMe]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

export const uploadMembroFoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Selecione uma imagem para carregar." });
    }

    const fotoUrl = `/uploads/${req.file.filename}`;
    const result = await query(
      `UPDATE membros m
       INNER JOIN utilizadores u ON (u.id = m.utilizador_id OR u.email = m.email)
       SET m.foto = ?
       WHERE u.id = ?`,
      [fotoUrl, req.user.id]
    );

    const affected = result?.affectedRows ?? result?.changedRows ?? 0;
    if (affected === 0) {
      try {
        const users = await query(`SELECT id, nome, email FROM utilizadores WHERE id = ? LIMIT 1`, [req.user.id]);
        if (!users || users.length === 0) {
          return res.status(404).json({ message: "Utilizador não encontrado." });
        }
        const u = users[0];
        await query(
          `INSERT INTO membros (nome, email, utilizador_id, foto, estado)
           VALUES (?, ?, ?, ?, ?)`,
          [u.nome || null, u.email || null, u.id, fotoUrl, 'Ativo']
        );
        return res.json({ message: "Perfil criado e foto guardada.", foto: fotoUrl });
      } catch (e) {
        console.error('[uploadMembroFoto][create]', e);
        return res.status(500).json({ message: "Erro ao criar o perfil de membro." });
      }
    }

    res.json({ message: "Foto de perfil atualizada com sucesso.", foto: fotoUrl });
  } catch (e) {
    console.error("[uploadMembroFoto]", e);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};
