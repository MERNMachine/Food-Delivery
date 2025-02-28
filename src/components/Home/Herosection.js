import React, { useState } from "react";
import "../style/Home/Herosection.css"; // For styling
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
const HeroSection = () => {
    const { t, i18n } = useTranslation();
    const [selectedOption, setSelectedOption] = useState("Delivery");
    const navigate = useNavigate();
    return (
        <div className="hero-section">
            <div className="hero-content">
                <h1>{t("starving")}</h1>
                <p>
                   {t("within-a-fewclick")}
                </p>
                <div className="search-box">
                    <div className="delivery-pickup">
                        <button
                            className={`option ${selectedOption === "Delivery" ? "active" : ""}`}
                            onClick={() => setSelectedOption("Delivery")}
                        >
                            <span className="icon">🚴</span> {t("delivery")}
                        </button>
                        <button
                            className={`option ${selectedOption === "Pickup" ? "active" : ""}`}
                            onClick={() => setSelectedOption("Pickup")}
                        >
                            <span className="icon">👜</span> {t("pickup")}
                        </button>
                    </div>
                    <div className="address-box">
                        <div className="address-input-wrapper">
                            <span className="address-icon">
                                <i className="fas fa-map-marker-alt"></i>
                            </span>
                            <input
                                type="text"
                                placeholder={t("enter-your-address")}
                                className="address-input"
                            />
                        </div>
                        <button className="find-food-btn" onClick={(e) => {e.preventDefault(); navigate("/menu")}}>{t("find-food")}</button>
                    </div>
                </div>
            </div>
            <div className="hero-image">
                <img
                    src="/test_pic/6.png"
                    alt="Delicious food"
                />
            </div>
        </div>
    );
};

export default HeroSection;