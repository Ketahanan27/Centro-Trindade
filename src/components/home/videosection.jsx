function VideoSection() {
  return (
    <section className="video-section">

      <div className="video-player">
        <iframe
          src="https://www.youtube.com/embed/vEpe0RZuDh0"
          title="YouTube video player"
          allowFullScreen
        ></iframe>
      </div>

      <div className="video-content">
        <h2>PROGRAMAÇÃO</h2>

        <h2>AO VIVO</h2>

        <p>
          Não fiques de fora, inscreva-se e ativa o sininho
          para não perder nenhuma novidade.
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

    </section>
  );
}

export default VideoSection;