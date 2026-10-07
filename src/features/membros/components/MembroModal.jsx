import { createPortal } from 'react-dom';
import styles from '../membros.module.css';
export default function MembroModal({
  titulo,
  onFechar,
  children
}) {
  return createPortal(<div className={`${styles.modal} ${styles['members-modal']}`}>
      <div className={styles['modal-content']} role="dialog" aria-modal="true" aria-label={titulo}>
        <div className={styles['modal-header']}>
          <h2>{titulo}</h2>
          <button type="button" aria-label="Fechar" onClick={onFechar}><i className="ri-close-line" /></button>
        </div>
        {children}
      </div>
    </div>, document.body);
}
