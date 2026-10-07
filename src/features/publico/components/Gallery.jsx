import { images } from '../galeria.images.js';
import { useGaleria } from '../hooks/useGaleria.js';

function Gallery() {
  const { current, setCurrent, setPaused, nextSlide, prevSlide } = useGaleria();

  return (
    <section className="gallery-section" id="galeria">
      <h2>Galeria</h2>

      <div
        className="slider"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button className="slider-btn prev" onClick={prevSlide}>
          ❮
        </button>

        <img
          src={images[current]}
          alt={`Galeria ${current + 1}`}
          className="slider-image"
        />

        <button className="slider-btn next" onClick={nextSlide}>
          ❯
        </button>
      </div>

      <div className="slider-dots">
        {images.map((_, index) => (
          <span
            key={index}
            className={current === index ? "dot active" : "dot"}
            onClick={() => setCurrent(index)}
          ></span>
        ))}
      </div>
    </section>
  );
}

export default Gallery;
