import familia from "../../assets/img/familia.jpg";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="blur"></span>

        <h1>CENTRO TRINDADE</h1>

        <h2>
          AMOR <span>PAI</span>
        </h2>

        <h2>
          OBEDIÊNCIA <span>FILHO</span>
        </h2>

        <h2>
          INTERCESSÃO <span>ESPÍRITO SANTO</span>
        </h2>

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
        
      </div>

      <div className="hero-image">
        <img src={familia} alt="Família Trindade" />
      </div>
    </section>
  );
}

export default Hero;
