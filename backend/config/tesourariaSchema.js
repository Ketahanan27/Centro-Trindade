export const TESOURARIA_AUDITORIA_SQL = `
CREATE TABLE IF NOT EXISTS tesouraria_historico (
  id bigserial PRIMARY KEY,
  movimento_id integer NOT NULL,
  acao text NOT NULL CHECK (acao IN ('Criado', 'Alterado', 'Eliminado')),
  autor_id integer NOT NULL,
  autor_nome text NOT NULL,
  motivo text,
  antes jsonb,
  depois jsonb,
  registado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tesouraria_historico_movimento ON tesouraria_historico (movimento_id, id DESC);
`;
