import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Home/PopularItemsCarousel.css";
import { useTranslation } from "react-i18next";

const PopularItemsCarousel = () => {
  const items = [
    {
      name: "Cheese Burger",
      restaurant: "Burger Arena",
      price: "$3.88",
      image: "/test_menus/1.png",
    },
    {
      name: "Toffee's Cake",
      restaurant: "Top Sticks",
      price: "$4.00",
      image: "/test_menus/2.png",
    },
    {
      name: "Dancake",
      restaurant: "Cake World",
      price: "$1.99",
      image: "/test_menus/3.png",
    },
    {
      name: "Crispy Sandwich",
      restaurant: "Fastfood Dine",
      price: "$3.00",
      image: "/test_menus/4.png",
    },
    {
      name: "Thai Soup",
      restaurant: "Foody Man",
      price: "$2.79",
      image: "/test_menus/5.png",
    },
    {
      name: "Veggie Pizza",
      restaurant: "Pizza Planet",
      price: "$5.49",
      image: "/test_menus/1.png",
    },
    {
      name: "Chocolate Mousse",
      restaurant: "Dessert Hub",
      price: "$2.50",
      image: "/test_menus/2.png",
    },
  ];
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setvisibleItems] = useState(5);
  const [startX, setStartX] = useState(0); // For tracking touch start position
  const [endX, setEndX] = useState(0); // For tracking touch end position

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - visibleItems : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - visibleItems ? 0 : prevIndex + 1
    );
  };
  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX); // Record the starting touch position
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    setEndX(e.touches[0].clientX); // Update the ending touch position as the user moves
  };

  // Handle touch end
  const handleTouchEnd = () => {
    const swipeDistance = startX - endX;

    if (swipeDistance > 50) {
      // Swipe left -> Next slide
      handleNext();
    } else if (swipeDistance < -50) {
      // Swipe right -> Previous slide
      handlePrev();
    }

    // Reset start and end positions
    setStartX(0);
    setEndX(0);
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 390) {
        setvisibleItems(1);
      } else if (window.innerWidth < 600) {
        setvisibleItems(2);
      } else if (window.innerWidth < 820) {
        setvisibleItems(3);
      } else {
        setvisibleItems(5);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className="carousel container">
      <h2 className="carousel-title">{t("popular-itmes")}</h2>
      <button className="carousel-arrow left-arrow" onClick={handlePrev}>
        &#8249;
      </button>
      <div
        className="carousel-wrapper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="carousel-items"
          style={{
            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
          }}
        >
          {items.map((item, index) => (
            <div className="card" key={index}>
              <img src={item.image} alt={item.name} className="card-image" />
              <h3 className="card-title">{item.name}</h3>
              <p className="card-restaurant">{item.restaurant}</p>
              <p className="card-price">{item.price}</p>
              <button
                className="card-button"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/menu");
                }}
              >
                {t("order-now")}
              </button>
            </div>
          ))}
        </div>
      </div>
      <button className="carousel-arrow right-arrow" onClick={handleNext}>
        &#8250;
      </button>
    </div>
  );
};

export default PopularItemsCarousel;
