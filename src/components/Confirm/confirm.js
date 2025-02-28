import React from "react";
import Header from "../Home/Header";
import Footer from "../Home/Footer";
import { useNavigate } from "react-router-dom";
import "../style/Confirm/confirm.css"
const Confirm = () => {
    const navigate = useNavigate();

    const handleTrackOrder = () => {
    
        navigate(`/tracking`);
    }
    return (
        <div>
            <Header />
            <div className="confirm-container">
                <div className="confirm-icon">
                    <img src="./Icons/confirm.gif" alt="Success Icon" />
                </div>
                <h2 className="confirm-title">Your order has been successfully placed</h2>
                <p className="confirm-message">
                    Sit and relax while your order is being worked on. It'll take 5 mins before you get it.
                </p>
                <button className="confirm-button">
                    TRACK ORDER
                </button>
            </div>
            <Footer />
        </div>

    );
};
export default Confirm;