import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import "../style/Home/Header.css";
import { useCart } from "../Cart/Cartcontext";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { t, i18n } = useTranslation();
  // const { cartItems } = useCart();
  const cartItems = useSelector((state) => state.cart.items);
  const navigate = useNavigate();
  const [isSticky, setIsSticky] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setshowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const token = localStorage.getItem("token");

  const handleScroll = () => {
    setIsSticky(window.scrollY > 250);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    setShowDropdown(false);
  };

  const handleProfileClick = () => {
    setshowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className={`header ${isSticky ? "sticky" : ""}`}>
      <div className="left-container">
        <div className="logo">
          <a
            href="#"
            className="logo-mark"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            YUMMY
          </a>
        </div>
        <div className="language-dropdown">
          <button
            className="language-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {i18n.language.toUpperCase()} ▼
          </button>
          {showDropdown && (
            <ul className="language-menu">
              <li onClick={() => handleLanguageChange("en")}>English</li>
              <li onClick={() => handleLanguageChange("es")}>Español</li>
              <li onClick={() => handleLanguageChange("ch")}>中國人</li>
              <li onClick={() => handleLanguageChange("ja")}>日本語</li>
            </ul>
          )}
        </div>
        <button
          className="mobile-menu-button"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="#333"
          >
            <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
          </svg>
        </button>
      </div>
      <nav className={`nav ${showMobileMenu ? "show" : ""}`}>
        <a
          href="#"
          className="nav-item"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          {t("home")}
        </a>
        <a
          href="#"
          className="nav-item"
          onClick={(e) => {
            e.preventDefault();
            navigate("/menu");
          }}
        >
          {t("menu")}
        </a>
        <a
          href="#about"
          className="nav-item"
          onClick={(e) => {
            e.preventDefault();
            navigate("/feedback");
          }}
        >
          {t("about")}
        </a>
        {token && (
          <a
            href="#"
            className="nav-item"
            onClick={(e) => {
              e.preventDefault();
              navigate("/tracking");
            }}
          >
            {t("My orders")}
          </a>
        )}

        {!token && (
          <>
            <div className="auth-buttons">
              <button
                className="login-btn"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                {t("login")}
              </button>
              <button
                className="signup-btn"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                {t("signup")}
              </button>
            </div>
          </>
        )}
        {token && (
          <div
            className="cart-container"
            onClick={(e) => {
              e.preventDefault();
              navigate("/cart");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="cart-svg"
            >
              <path
                d="M7 20c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.16 14H19c.84 0 1.54-.52 1.84-1.3l3-7c.18-.42.16-.88-.05-1.28A1.99 1.99 0 0021 4H5.21L4.27 2H1v2h2l3.6 7.59-1.35 2.44C5.11 14.37 5 14.67 5 15c0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25L7.16 14zm2.43-2l1.1-2h5.91l1.1 2H9.59z"
                fill="#ffa500"
              />
            </svg>
            <span className="cart-badge">{cartItems.length}</span>
          </div>
        )}
        {token && (
          <div className="profile-container">
            <button className="profile-button" onClick={handleProfileClick}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="profile-svg"
                viewBox="0 0 24 24"
                fill="#FFA500"
              >
                <circle cx="12" cy="8" r="5" />
                <path d="M12 14c-4 0-7 2.5-7 6v1h14v-1c0-3.5-3-6-7-6z" />
              </svg>
            </button>
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/profile");
                  }}
                >
                  Profile
                </button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
