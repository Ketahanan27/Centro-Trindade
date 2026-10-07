import styles from "../tesouraria.module.css";
export default function TesourariaResumo({
  entradas,
  saidas,
  saldo
}) {
  return <div className={styles["resumo-cards"]}>
          <div className={styles["card"] + " " + styles["entrada"]}>
            <h3>Receitas</h3>
            <p>{entradas.toFixed(2)} €</p>
          </div>

          <div className={styles["card"] + " " + styles["saida"]}>
            <h3>Despesas</h3>
            <p>{saidas.toFixed(2)} €</p>
          </div>

          <div className={`${styles.card} ${styles.saldo} ${saldo >= 0 ? styles.positivo : styles.negativo}`}>
            <h3>Saldo</h3>
            <p>{saldo.toFixed(2)} €</p>
          </div>
        </div>;
}
