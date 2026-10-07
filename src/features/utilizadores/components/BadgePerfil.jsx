import { CORES_PERFIL } from "../utilizadores.model";
export default function BadgePerfil({
  perfil
}) {
  return <span style={{
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    background: `${CORES_PERFIL[perfil] ?? "#666"}22`,
    color: CORES_PERFIL[perfil] ?? "#aaa",
    border: `1px solid ${CORES_PERFIL[perfil] ?? "#666"}44`
  }}>
    {perfil}
  </span>;
}
