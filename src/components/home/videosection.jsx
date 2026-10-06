import { useState } from "react";

function VideoSection() {
  const [videoAtivo, setVideoAtivo] = useState(false);
  return (
    <section className="video-section">

      <div className="video-player">
        {videoAtivo ? (
          <>
            <iframe
              src="https://www.youtube.com/embed/vEpe0RZuDh0"
              title="Vídeo do Ministério Centro Trindade no YouTube"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
            <button type="button" className="video-choice" onClick={() => setVideoAtivo(false)}>
              Fechar vídeo
            </button>
          </>
        ) : (
          <div className="video-placeholder">
            <p>Vídeo do Centro Trindade</p>
            <p>Ao carregar o vídeo, o seu navegador liga-se ao YouTube, que pode recolher dados de navegação e utilizar cookies.</p>
            <button type="button" className="video-choice" onClick={() => setVideoAtivo(true)}>Carregar vídeo do YouTube</button>
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacidade do Google</a>
          </div>
        )}
      </div>

      <div className="video-content">
        <h2>PROGRAMAÇÃO</h2>
        <h2>AO VIVO</h2>

        <p>
          Não fiques de fora, inscreva-se e ativa o sininho
          para não perder nenhuma novidade.
        </p>
      </div>

    </section>
  );
}

export default VideoSection;
