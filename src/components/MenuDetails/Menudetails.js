import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/cartSlice";
import { useParams } from "react-router-dom";
import Header from "../Home/Header";
import Footer from "../Home/Footer";
import Feedback from "../Feedback/feedback";
import "../style/MenuDetails/menudetails.css";
import CONFIG from "../../config";
import { getMenuDetail } from "../../api/Menus/apiGetMenu";
import "toastr/build/toastr.min.css";
import toastr from "toastr";

toastr.options = {
  closeButton: true, // Add a close button
  debug: false,
  newestOnTop: true,
  progressBar: true, // Add a progress bar
  positionClass: "toast-top-right", // Position: top-right corner
  preventDuplicates: true,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000", // Notification disappears after 3 seconds
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};
const Menudetails = () => {
  const [item, setItems] = useState({
    title: "",
    description: "",
    price: 0,
    image: "",
    tags: [],
    likes: 0,
    dislikes: 0,
    rating: 0,
    ingredients: [],
    allergens: "",
    nutrition: {},
    fullIngredients: "",
    nutri_info: "",
    feedbacks:[],
  });
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const handleAddToCart = (item) => {
    if (token) {
      dispatch(addToCart(item));
      toastr.success(`${item.title} added to cart!`, "Success");
    } else {
      toastr.warning("First, you have to log in to the system", "Warning");
    }
  };

  useEffect(() => {
    const fetchDetailMenu = async (id) => {
      try {
        const data = await getMenuDetail(id);
        setItems(data);
        setLoading(false);
      } catch (err) {
    
        setError(err.message);
        setLoading(false);
      }
    };
    fetchDetailMenu(id);
  }, [id]);
  // const item = menuItems.find((menu) => menu.id === parseInt(id));

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    toastr.error("Failed to fetch data", "Error");
  }
  return (
    <div>
      <Header />
      <div className="menu-details-container">
        <div className="menu-details-header">
          <h1 className="menu-title">{item.title}</h1>
          <p className="menu-description">{item.description}</p>
        </div>
        <div className="menu-content">
          {/* Left Side */}
          <div className="menu-image-section">
            <img
              src={`${CONFIG.BASE_BACK_URL}/uploads/${item.image}`}
              alt={item.title}
              className="menu-image"
            />
            <div className="menu-tags">
              {item.tags && item.tags.length > 0 ? (
                item.tags.map((tag) => (
                  <span key={tag} className={`menu-tag ${tag.toLowerCase()}`}>
                    {tag}
                  </span>
                ))
              ) : (
                <span>No tags available</span>
              )}
            </div>
            <div className="menu-interactions">
              <span className="likes">👍 {item.likes}</span>
              <span className="dislikes">👎 {item.dislikes}</span>
              <span className="detail-rating">⭐ {item.rating}</span>
            </div>
          </div>
          {/* Right Side */}
          <div className="menu-details-section">
            <h2>Ingredients</h2>
            <p className="ingredients-list">{item.ingredients.join(", ")}</p>
            <p className="allergens">ALLERGENS: {item.allergens}</p>

            <h2>Nutrition Per Serving</h2>
            <div className="nutrition-info">
              {item.nutrition && Object.keys(item.nutrition).length > 0 ? (
                Object.entries(item.nutrition)
                  .filter(([key]) => key !== "_id") // Exclude "_id"
                  .map(([key, value]) => (
                    <div key={key} className="nutrition-item">
                      <span className="nutrition-label">{key}</span>
                      <span className="nutrition-value">{value}</span>
                    </div>
                  ))
              ) : (
                <p>No nutrition info available</p>
              )}
            </div>

            <h2>Full Ingredients</h2>
            <p className="full-ingredients">{item.nutri_info}</p>
            <Feedback menuId = {id} feedBacks = {item.feedbacks}/>

            <div className="price-section">
              <div className="price-details">
                <h3 className="price">{item.price}$</h3>
                <span className="previous-price">{item.previousPrice}$</span>
              </div>
              <button
                className="add-to-cart"
                onClick={() => handleAddToCart(item)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Menudetails;
