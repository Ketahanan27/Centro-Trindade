import Layout from "../components/Layout";

import escolaImg from "../assets/img/principal.png";

function Escola120() {
  return (
    <Layout>
      <header className="container escola120">
        <div className="formulario">
          <h1>Academia 120</h1>

          <p>
            A Academia 120 é um projeto voltado ao discipulado de homens e mulheres que têm um coração ardente por Jesus e pela sua Palavra. 
            Seu propósito é formar discípulos comprometidos com a verdade e com a pessoa de Cristo, equipando-os para viver e compartilhar o evangelho com autoridade e amor.
            A escola enfatiza o ensino profundo das Escrituras, a busca pelo Espírito Santo e o desenvolvimento de um caráter fundamentado em Cristo.
            Por meio de treinamentos intensivos, oração e comunhão, os participantes são preparados para serem agentes transformadores na sociedade e na igreja.
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