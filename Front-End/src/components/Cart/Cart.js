import React,{useEffect} from "react";
import { useSelector,useDispatch} from 'react-redux';
import CONFIG from '../../config';
import Header from "../Home/Header";
import Footer from "../Home/Footer";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { incrementQuantity, decrementQuantity, removeFromCart } from '../../redux/cartSlice';
import "../style/Cart/cart.css";

const Cart = () => {
    const { t, i18n } = useTranslation();
    const cartItems = useSelector((state) => state.cart.items);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const totalCost = cartItems.reduce((total, item) => {
        //const itemPrice = parseFloat(item.price.replace("$", ""));
        return total + item.price * item.quantity;
    }, 0);

    const checkOutClick = () => {
        navigate(`/payment`);
    };
    const handleIncrement = (itemId) => {
       dispatch(incrementQuantity(itemId));
    };

    const handleDecrement = (itemId) => {
        dispatch(decrementQuantity(itemId));
    };

    const handleRemove = (itemId) => {
        dispatch(removeFromCart(itemId));
    };
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    },[]);
    return (
        <div>
            <Header />
            <div className={`cart-items ${cartItems.length !== 0 ? "full" : ""}`}>
                {cartItems.length === 0 ? (
                    <div className="empty-cart">
                        <img src="./Icons/empty-cart.svg">
                        </img>
                        <p>
                        {t("emptyCart")}
                        </p>
                    </div>
                ) : (
                    cartItems.map((item) => (
                        <div key={item.id} className="cart-item">
                            <img src={`${CONFIG.BASE_BACK_URL}/uploads/${item.image}`} alt={item.title} className="cart-item-image" />
                            <div className="cart-item-details">
                                <h5>{item.title}</h5>
                                <p>{item.description}</p>
                                <p className="cart-item-price">
                                    ${parseFloat(item.price) * item.quantity}
                                </p>
                            </div>
                            <div className="cart-item-actions">
                                <button className="quantity-button" onClick={() => handleDecrement(item.id)}>-</button>
                                <span className="cart-item-quantity">{item.quantity}</span>
                                <button className="quantity-button" onClick={() => handleIncrement(item.id)}>+</button>
                                <button className="remove-button" onClick={() => handleRemove(item.id)}>✕</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {cartItems.length > 0 && (
                <div>
                    <div className="total-pay">
                        <p>{t("total")} : ${totalCost.toFixed(2)}</p>
                    </div>
                    <div className="button-container">
                        <button className="checkout-button" onClick={() => checkOutClick()}> {t("checkout")}</button>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};


export default Cart;