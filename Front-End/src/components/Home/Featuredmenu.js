import React from "react";
import { useNavigate } from "react-router-dom";
import "../style/Home/Featuredmenu.css";
import { useTranslation } from "react-i18next";

const FeaturedMenus = () => {
  const restaurants = [
    {
      id: 1,
      name: "Food World",
      image: "./featured/food-world.png",
      ratings: 46,
      discount: "20%",
      fast: true,
      status: "Opens Tomorrow",
    },
    {
      id: 2,
      name: "Pizza Hub",
      image: "./featured/pizza-hub.png",
      ratings: 40,
      discount: "10%",
      fast: true,
      status: "Opens Tomorrow",
    },
    {
      id: 3,
      name: "Donuts Hut",
      image: "./featured/donuts-hut.png",
      ratings: 20,
      discount: "15%",
      fast: true,
      status: "Open Now",
    },
    {
      id: 4,
      name: "Ruby Tuesday",
      image: "./featured/ruby-tuesday.png",
      ratings: 50,
      discount: "10%",
      fast: true,
      status: "Open Now",
    },
    {
      id: 5,
      name: "Ruby Tuesday",
      image: "./featured/kuakata.png",
      ratings: 50,
      discount: "10%",
      fast: true,
      status: "Open Now",
    },
    {
      id: 6,
      name: "Ruby Tuesday",
      image: "./featured/red-square.png",
      ratings: 50,
      discount: "10%",
      fast: true,
      status: "Open Now",
    },
  ];
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="featured-restaurants container">
      <h2>{t("featured-menus")}</h2>
      <div className="restaurant-grid">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="restaurant-card">
            <div className="restaurant-image">
              <img src={restaurant.image} alt={restaurant.name} />
              {restaurant.discount && (
                <span className="discount-badge">{restaurant.discount} off</span>
              )}
              {restaurant.fast && <span className="fast-badge">Fast</span>}
            </div>
            <div className="restaurant-info">
              <h3>{restaurant.name}</h3>
              <p>{restaurant.ratings} ratings</p>
              <span className={`status ${restaurant.status.toLowerCase().replace(" ", "-")}`} onClick={(e) => {e.preventDefault(); navigate("/menu")}}>
                  {restaurant.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <button className="view-all-button">View All</button>
    </div>
  );
};

export default FeaturedMenus;