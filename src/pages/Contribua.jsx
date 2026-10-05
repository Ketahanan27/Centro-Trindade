import Layout from "../components/Layout";
import "../assets/styles/home/contribua.css";
import mbway from "../assets/img/mbway.png";
import paypal from "../assets/img/PAYPAL.jpg";

function Contribua() {
  return (
    <Layout>
      <h1 className="contribua-title">
        Escolha uma das opções abaixo para cumprir os princípios financeiros:
      </h1>
      <section className="contribua">
        <div className="contribua-left">
          <img src={mbway} alt="MBWay" className="mbway-logo" />
          <p>Se deseja dizimar ou ofertar, poderá utilizar este formulário quando estiver disponível.</p>
          <form className="contribua-form" onSubmit={(event) => event.preventDefault()} aria-describedby="contribua-indisponivel">
            <label htmlFor="contribua-nome">Nome *</label>
            <input id="contribua-nome" type="text" name="nome" placeholder="O seu nome" disabled />
            <label htmlFor="contribua-telemovel">Telemóvel *</label>
            <input id="contribua-telemovel" type="tel" name="telemovel" placeholder="9XXXXXXXX" maxLength={9} disabled />
            <label htmlFor="contribua-valor">Valor *</label>
            <input id="contribua-valor" type="number" name="valor" placeholder="0.00" min="0.01" step="0.01" disabled />
            <label htmlFor="contribua-descricao">Descrição *</label>
            <select id="contribua-descricao" name="descricao" defaultValue="Selecione uma opção" disabled>
              <option disabled>Selecione uma opção</option>
              <option>Dízimos</option>
              <option>Oferta</option>
              <option>Voto</option>
              <option>T-Shirts</option>
              <option>Ação Social</option>
            </select>
            <button type="submit" className="btn" disabled>Confirmar</button>
          </form>
        </div>
        <div className="contribua-right">
          <h2>Transferência Bancária</h2>
          <p>Comunidade Centro Trindade</p>
          <p><strong>Banco:</strong> Caixa Geral de Depósitos</p>
          <p><strong>IBAN:</strong> PT50 XXXX XXXX XXXX</p>
          <p><strong>SWIFT:</strong> CCOMPTPL</p>
          <p>Dados de exemplo. Confirme os dados reais diretamente com a igreja.</p>
          <img src={paypal} alt="PayPal" className="paypal-logo" />
        </div>
      </section>
      <p id="contribua-indisponivel" className="contribua-nota" role="note">
        <strong>Nota:</strong> Esta funcionalidade ainda não está disponível.
        Os pagamentos online encontram-se em preparação.
      </p>
    </Layout>
  );
}

export default Contribua;
