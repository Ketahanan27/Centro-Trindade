import { useState, useEffect, useCallback } from "react";

import img1 from "../../assets/img/IMG1.jpg";
import img2 from "../../assets/img/IMG2.jpg";
import img3 from "../../assets/img/IMG3.jpg";
import img4 from "../../assets/img/IMG4.jpg";
import img5 from "../../assets/img/IMG5.jpg";
import img6 from "../../assets/img/IMG6.jpg";
import img7 from "../../assets/img/IMG7.jpg";
import img8 from "../../assets/img/IMG8.jpg";
import img10 from "../../assets/img/IMG10.jpg";
import img11 from "../../assets/img/IMG11.jpg";
import img13 from "../../assets/img/IMG13.jpg";
import img14 from "../../assets/img/IMG14.jpg";
import img15 from "../../assets/img/IMG15.jpg";
import img16 from "../../assets/img/IMG16.jpg";
import img17 from "../../assets/img/IMG17.jpg";
import img18 from "../../assets/img/IMG18.jpg";
import img20 from "../../assets/img/IMG20.jpg";
import img21 from "../../assets/img/IMG21.jpg";
import img22 from "../../assets/img/IMG22.jpg";
import img23 from "../../assets/img/IMG23.jpg";

const images = [
  img8, img1, img4, img5, img13, img23,
  img3, img18, img21, img22, img11, img2,
  img6, img7, img10, img14, img15, img17,
  img20, img16,
];

function Gallery() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  }, []); 

  const prevSlide = useCallback(() => {
    setCurrent((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  }, []);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 2000);

    return () => clearInterval(interval);
  }, [paused, nextSlide]);

  return (
    <section className="gallery-section" id="galeria">
      <h2>Galeria</h2>

      <div
        className="slider"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <button
          className="slider-btn prev"
          onClick={prevSlide}
        >
          ❮
        </button>

        <img
          src={images[current]}
          alt={`Galeria ${current + 1}`}
          className="slider-image"
        />

        <button
          className="slider-btn next"
          onClick={nextSlide}
        >
          ❯
        </button>
      </div>

      <div className="slider-dots">
        {images.map((_, index) => (
          <span
            key={index}
            className={
              current === index ? "dot active" : "dot"
            }
            onClick={() => setCurrent(index)}
          ></span>
        ))}
      </div>
    </section>
  );
}

export default Gallery;
