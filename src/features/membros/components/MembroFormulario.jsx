import styles from "../membros.module.css";
import MembroModal from "./MembroModal";
export default function MembroFormulario({
  membroEmEdicaoId,
  perfil,
  contas,
  contasErro,
  formulario,
  alterarCampo,
  guardarFormulario,
  limparFormulario,
  onFechar
}) {
  return <MembroModal titulo={membroEmEdicaoId ? "Editar Membro" : "Novo Membro"} onFechar={onFechar}>
    <form onSubmit={guardarFormulario}>
      <div className={styles["grid"]}>
        {perfil === "Administrador" && <div className={styles["field"]}>
            <label htmlFor="membro-conta">Conta associada</label>
            <select id="membro-conta" name="utilizador_id" value={formulario.utilizador_id} onChange={alterarCampo} disabled={contasErro}>
              <option value="">Sem conta associada</option>
              {contas.filter(c => c.estado === "Ativo" || c.id === Number(formulario.utilizador_id)).map(c => <option key={c.id} value={c.id}>{c.nome} — {c.email}</option>)}
            </select>
            <small>Associe apenas a conta da pessoa cuja identidade confirmou.</small>
          </div>}
        <div className={styles["field"]}>
          <label>Nome</label>
          <input type="text" name="nome" required value={formulario.nome} onChange={alterarCampo} />
        </div>
        <div className={styles["field"]}>
          <label>Email</label>
          <input type="email" name="email" required value={formulario.email} onChange={alterarCampo} />
        </div>
        <div className={styles["field"]}>
          <label>Telemóvel</label>
          <input type="text" name="telemovel" maxLength="9" value={formulario.telemovel} onChange={alterarCampo} />
        </div>
        <div className={styles["field"]}>
          <label>Data Nascimento</label>
          <input type="date" name="nascimento" value={formulario.nascimento} onChange={alterarCampo} />
        </div>
        <div className={styles["field"]}>
          <label>Sexo</label>
          <select name="sexo" value={formulario.sexo} onChange={alterarCampo}>
            <option>Masculino</option>
            <option>Feminino</option>
          </select>
        </div>
        <div className={styles["field"]}>
          <label>Estado Civil</label>
          <select name="estado_civil" value={formulario.estado_civil} onChange={alterarCampo}>
            <option>Solteiro(a)</option>
            <option>Casado(a)</option>
            <option>Divorciado(a)</option>
            <option>Viúvo(a)</option>
          </select>
        </div>
        <div className={styles["field"]}>
          <label>Morada</label>
          <input type="text" name="morada" value={formulario.morada} onChange={alterarCampo} />
        </div>
        <div className={styles["field"]}>
          <label>Código Postal</label>
          <input type="text" name="codigo_postal" value={formulario.codigo_postal} onChange={alterarCampo} />
        </div>
        <div className={styles["field"]}>
          <label>Data Entrada</label>
          <input type="date" name="entrada" value={formulario.entrada} onChange={alterarCampo} />
        </div>
        <div className={styles["field"]}>
          <label>Batizado</label>
          <select name="batizado" value={formulario.batizado} onChange={alterarCampo}>
            <option>Sim</option>
            <option>Não</option>
          </select>
        </div>
        <div className={styles["field"]}>
          <label>Estado</label>
          <select name="estado" value={formulario.estado} onChange={alterarCampo}>
            <option>Ativo</option>
            <option>Inativo</option>
          </select>
        </div>
      </div>
      <div className={styles["form-actions"]}>
        <button type="submit" className={styles["save"]}>Guardar</button>
        <button type="button" className={styles["cancel"]} onClick={limparFormulario}>Limpar</button>
      </div>
    </form>
  </MembroModal>;
}
