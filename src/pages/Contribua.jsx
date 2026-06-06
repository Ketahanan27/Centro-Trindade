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

          <img
            src={mbway}
            alt="MBWay"
            className="mbway-logo"
          />

          <p>
            Se deseja dizimar ou ofertar,
            preencha os campos abaixo e clique em confirmar.
          </p>

          <form className="contribua-form">

            <label>Nome *</label>
            <input type="text" />

            <label>Telemóvel *</label>
            <input type="text" />

            <label>Valor *</label>
            <input type="number" />

            <label>Descrição *</label>
            <select>
              <option>Selecione uma opção</option>
              <option>Dízimos</option>
              <option>Oferta</option>
              <option>Voto</option>
              <option>T-Shirts</option>
              <option>Ação Social</option>
            </select>

            <button className="btn">
              Confirmar
            </button>

          </form>

        </div>

        <div className="contribua-right">

          <h2>Transferência Bancária</h2>

          <p>
            Comunidade Centro Trindade
          </p>

          <p>
            <strong>Banco:</strong> Caixa Geral de Depósitos
          </p>

          <p>
            <strong>IBAN:</strong> PT50 XXXX XXXX XXXX
          </p>

          <p>
            <strong>SWIFT:</strong> CCOMPTPL
          </p>

          <img
            src={paypal}
            alt="PayPal"
            className="paypal-logo"
          />

        </div>

      </section>
    </Layout>
  );
}

export default Contribua;