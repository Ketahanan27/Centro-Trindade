import Layout from "../components//Layout";

import familia from "../assets/img/familia.jpg";

function Home() {
  return (
    <Layout>
      <header className="container">
        <div className="content">
          <span className="blur"></span>

          <span className="blur"></span>

         <h1>CENTRO TRINDADE</h1>

          <h3>
            AMOR <span>PAI</span>
          </h3>

          <h3>
            OBEDIÊNCIA <span>FILHO</span>
          </h3>

          <h3>
            INTERCESSÃO <span>ESPÍRITO SANTO</span>
          </h3>

          <p>
            O coração do evangelho está fundamentado em três aspectos divinos
            que revelam o cuidado de Deus por nós: o amor do Pai, a obediência
            do Filho e a intercessão do Espírito Santo.
          </p>

          <p>
            Não há maior prova de amor do que esta: Deus não apenas nos criou,
            mas nos buscou mesmo quando nos afastamos d'Ele. João 3:16.
          </p>

          <p>
            Jesus não apenas veio ao mundo, mas viveu em completa submissão à
            vontade do Pai.
          </p>

          <p>
            Enquanto vivemos neste mundo, somos sustentados pela intercessão do
            Espírito Santo.
          </p>

          <a
            href="https://www.youtube.com/@trindade3oficial/featured"
            target="_blank"
            rel="noreferrer"
          >
            <button className="btn">
              Acesse o nosso canal
            </button>
          </a>
        </div>

        <div className="image">
          <img src={familia} alt="Família" />
        </div>
      </header>
    </Layout>
  );
}

export default Home;