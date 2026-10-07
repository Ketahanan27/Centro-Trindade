import styles from "../tesouraria.module.css";
export default function ResumoCategorias({
  totaisPorTipo
}) {
  return <div className={styles["resumo-tipos"]}>
                <h2>Resumo por Categoria</h2>

                {totaisPorTipo.map(([tipo, total]) => <div key={tipo} className={styles["tipo-item"]}>
                    <span>{tipo}</span>
                    <strong>{total.toFixed(2)} €</strong>
                  </div>)}
              </div>;
}
