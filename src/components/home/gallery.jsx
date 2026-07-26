import { useState, useEffect, useCallback } from "react";

import img1 from "../../assets/img/Djamel1.jpeg";
import img2 from "../../assets/img/Djamel2.jpeg";
import img3 from "../../assets/img/Djamel3.jpeg";
import img4 from "../../assets/img/Djamel4.jpeg";
import img5 from "../../assets/img/Djamel5.jpeg";
import img6 from "../../assets/img/Djamel6.jpeg";
import img7 from "../../assets/img/Djamel7.jpeg";
import img8 from "../../assets/img/Djamel8.jpeg";
import img9 from "../../assets/img/Djamel9.jpeg";
import img10 from "../../assets/img/Djamel10.jpeg";
import img11 from "../../assets/img/Djamel11.jpeg";
import img12 from "../../assets/img/Djamel12.jpeg";
import img13 from "../../assets/img/Djamel13.jpeg";
import img14 from "../../assets/img/Djamel14.jpeg";
import img15 from "../../assets/img/Djamel15.jpeg";
import img16 from "../../assets/img/Djamel16.jpeg";
import img17 from "../../assets/img/Djamel17.jpeg";
import img18 from "../../assets/img/Djamel18.jpeg";

const images = [
  img1, img2, img3, img4, img5,
  img6, img7, img8, img9, img10,
  img11, img12, img13, img14, img15,
  img16, img17, img18,
];

function Gallery() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
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
