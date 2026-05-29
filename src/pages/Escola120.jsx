import Layout from "../components/Layout";

import escolaImg from "../assets/img/image0.jpeg";

function Escola120() {
  return (
    <Layout>
      <header className="container">
        <div className="formulario">
          <h1>Escola 120</h1>

          <p>
            A Escola 120 é um projeto voltado ao discipulado.
          </p>

          <a
            href="https://www.youtube.com/@trindade3oficial/featured"
            target="_blank"
            rel="noreferrer"
          >
            <button className="btn">Saiba Mais</button>
          </a>
        </div>

        <div className="image0">
          <img src={escolaImg} alt="Escola 120" />
        </div>
      </header>
    </Layout>
  );
}

export default Escola120;