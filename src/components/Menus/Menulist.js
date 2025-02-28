import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/cartSlice";
import { useNavigate } from "react-router-dom";
import "../style/Menus/menulist.css";
import { getCategories } from "../../api/Categories/getCategoryList";
import { getMenuLists } from "../../api/Menus/apiMenuList";
import toastr from "toastr";
import CONFIG from "../../config";
import "toastr/build/toastr.min.css";
import { Pagination } from "antd";

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
  timeOut: "3000", // Notification disappears after 3 seconds
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};
const MenuList = () => {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]); // State for categories
  const [menuItems, setMenuItems] = useState([]); // State for menus
  const [initialItems, setInitialItems] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [openAccordions, setOpenAccordions] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    const fetchMenus = async () => {
      try {
        const data = await getMenuLists();
        setMenuItems(data);
        setInitialItems(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCategories();
    fetchMenus();
  }, []);
  const toggleAccordion = (index) => {
    setOpenAccordions(
      (prev) =>
        prev.includes(index)
          ? prev.filter((item) => item !== index) // Close if already open
          : [...prev, index] // Open if closed
    );
  };

  const handleAddToCart = (item) => {
    if (token) {
  
      dispatch(addToCart(item));
      toastr.success(`${item.title} added to cart!`, "Success");
    } else {
      toastr.warning("First, you have to log in to the system", "Warning");
    }
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const searchMenu = (searchString) => {
    setSearch(searchString); // Update search state
    
    if (initialItems.length > 0) {
      const filteredData = initialItems.filter((menu) => {
        const name = menu.name ? menu.name.toLowerCase() : "";
        const description = menu.description? menu.description.toLowerCase(): "";
        const price = menu.price? menu.price.toString() : "";
        return (
          name.includes(searchString.toLowerCase()) ||
          description.includes(searchString.toLowerCase()) ||
          price.includes(searchString)
        );
      });
      setMenuItems(filteredData); // Update menu items with the filtered data
    }
    setCurrentPage(1);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = menuItems.slice(startIndex, startIndex + itemsPerPage);
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
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search all of our menus"
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          onKeyDown={(e) => {
            if(e.key === "Enter"){
              searchMenu(search);
            }
          }}
        />
        <button className="search-button" onClick = {() => searchMenu(search)}>
          <i className="fa fa-search"></i>
        </button>
      </div>
      <div className="menu-container">
        {/* Accordion Category Panel */}
        <div className="category-panel">
          {categories.map((category, index) => (
            <div key={index} className="accordion-category">
              <div
                className={`accordion-header ${
                  openAccordions.includes(index) ? "active" : ""
                }`}
                onClick={() => toggleAccordion(index)}
              >
                {category.title}
                <span className="accordion-arrow">
                  {openAccordions.includes(index) ? "▲" : "▼"}
                </span>
              </div>
              <div
                className={`accordion-body ${
                  openAccordions.includes(index) ? "show" : ""
                }`}
                style={{
                  maxHeight: openAccordions.includes(index) ? "300px" : "0",
                  overflow: "hidden",
                }}
              >
                {category.options.map((option, idx) => (
                  <label key={idx} className="category-option">
                    <input type="checkbox" />
                    {option.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="menu-list">
          
          {paginatedItems.map((item) => (
            <div key={item.id} className="menu-card">
              <div className="menulist-image-tags">
                {/* Nutritional Tags */}
                <div className="menulist-tags">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`tag-circle ${tag.toLowerCase()}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {/* Menu Image */}
                <div
                  className="menu-image"
                  onClick={() => navigate(`/menu/${item.id}`)}
                >
                  {/* <img src={item.image} alt={item.title} /> */}
                  <img src={`${CONFIG.BASE_BACK_URL}/uploads/${item.image}`} />
                </div>
              </div>
              <div className="menu-details">
                <h5>{item.title}</h5>
                <p>{item.description}</p>
                <div className="like-dislike">
                  <div className="like-section">
                    <span>👍 {item.likes}</span>
                  </div>
                  <div className="dislike-section">
                    <span>👎 {item.dislikes}</span>
                  </div>
                  <div className="rating">
                    <span>⭐ {item.rating}</span>
                  </div>
                </div>
                <div className="menu-footer">
                  <div className="menu-price-details">
                    <span className="price">{item.price}$</span>
                    <span className="previous-price">
                      {item.previousPrice}$
                    </span>
                  </div>
                </div>
                <button
                  className="add-to-cart"
                  onClick={() => handleAddToCart(item)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pagination-container">
        <Pagination
          current={currentPage}
          onChange={handlePageChange}
          total={menuItems.length}
        />
      </div>
    </div>
  );
};

export default MenuList;
