import Layout from "../components/Layout";

import paypal from "../assets/img/PAYPAL.jpg";

function Contribua() {
  return (
    <Layout>
      <header className="container">
        <div className="content">
          <h3>COORDENADAS BANCÁRIAS</h3>

          <p>
            Nome: Djamel Cambundi
            <br />
            IBAN: PT50003500850011702873087
            <br />
            MBWAY: +351 969 315 263
          </p>
        </div>

        <div className="image">
          <img src={paypal} alt="PayPal" />
        </div>
      </header>
    </Layout>
  );
}

export default Contribua;