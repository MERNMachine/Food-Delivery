import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Home/Header";
import Footer from "../Home/Footer";
import Payment from "./Payment";
const Checkout = () => {
    return (
        <div>
            <Header/>
            <Payment/>
            <Footer/>
        </div>
         
    );
};
export default Checkout;