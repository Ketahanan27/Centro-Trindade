export const VISITAS_ATIVIDADE_SQL = `
CREATE TABLE IF NOT EXISTS visitas_atividade (
 id serial PRIMARY KEY, evento_id integer REFERENCES eventos(id) ON DELETE SET NULL,
 atividade varchar(150) NOT NULL, data_atividade date NOT NULL,
 quantidade integer NOT NULL CHECK (quantidade >= 0 AND quantidade <= 1000000),
 observacoes text, criado_por integer NOT NULL, atualizado_por integer NOT NULL,
 criado_em timestamptz NOT NULL DEFAULT now(), atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS visitas_evento_unico ON visitas_atividade(evento_id) WHERE evento_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS visitas_atividade_data_unica ON visitas_atividade(lower(trim(atividade)),data_atividade);
CREATE INDEX IF NOT EXISTS visitas_atividade_data ON visitas_atividade(data_atividade);
`;
