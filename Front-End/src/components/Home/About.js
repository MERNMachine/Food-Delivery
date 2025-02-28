import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Home/About.css";

const testimonials = [
  {
    text: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable.",
    image: "./feedback/person1.webp",
    name: "Wilma Hover",
  },
  {
    text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has survived not only five centuries, but also the leap into electronic typesetting.",
    image: "./feedback/person2.webp",
    name: "John Doe",
  },
  {
    text: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.",
    image: "./feedback/person3.webp",
    name: "Jane Smith",
  },
  {
    text: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.",
    image: "./feedback/person4.webp",
    name: "Jane Smith",
  },
];

const About = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <section className="about">
      <h2 className="about-title">
        What Are They Saying <span className="highlight">About Us</span>
      </h2>
      <div className="testimonial-container">
        <div className="testimonial-content">
          <p className="testimonial-text">{testimonials[currentIndex].text}</p>
        </div>
        <div className="testimonial-image" onClick={(e) => {e.preventDefault(); navigate("/feedback");}}>
          <img
            src={testimonials[currentIndex].image}
            alt={testimonials[currentIndex].name}
            className="image"
          />
          <h3 className="name">{testimonials[currentIndex].name}</h3>
        </div>
      </div>
      <div className="dots">
        {testimonials.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => handleDotClick(index)}
          ></span>
        ))}
      </div>
    </section>
  );
};

export default About;
