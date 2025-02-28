import React, { useState, useRef, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../../redux/cartSlice";
import { apiSaveOrder } from "../../api/Pay/apiSaveOrder";
import CONFIG from "../../config";
import "../style/Checkout/payment.css";
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
  timeOut: "3000", // Notification disappears after 3 seconds
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};
const Payment = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const totalCost = cartItems.reduce((total, item) => {
    const itemPrice = parseFloat(item.price);
    return total + itemPrice * item.quantity;
  }, 0);

  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeWallet, setActiveWallet] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);

  // Create refs for dropdown sections
  const cardContentRef = useRef(null);
  const walletContentRef = useRef(null);

  const handlePay = async () => {
    const orderItems = cartItems.map(({ id, quantity, price }) => ({
      menu_item_id: id,
      quantity,
      price,
    }));
    try {
      await apiSaveOrder(totalCost, orderItems);
      toastr.success("Successfully  Ordered");
      dispatch(clearCart());
      navigate(`/confirm`);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        toastr.warning(err.response.data.msg); // Now correctly displays the message
      } else {
        toastr.warning("Something went wrong!");
      }
    }
  };
  const toggleSection = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const toggleWallet = (index) => {
    setActiveWallet(activeWallet === index ? null : index);
  };
  useEffect(() => {
   
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, []);
  return (
    <div className="payment-method-container container">
      <div className="left-side">
        <h3 className="payment-title">{t("choose-payment-method")}</h3>
        <p className="payment-subtitle">{t("many-methods")}</p>

        {/* Credit / Debit Card Section */}
        <div className={`payment-item ${activeIndex === 0 ? "active" : ""}`}>
          <div className="payment-header" onClick={() => toggleSection(0)}>
            <span>Credit / Debit Card</span>
            <span className="dropdown-arrow">
              {activeIndex === 0 ? "▲" : "▼"}
            </span>
          </div>
          <CSSTransition
            in={activeIndex === 0}
            timeout={300}
            classNames="dropdown"
            unmountOnExit
            nodeRef={cardContentRef} // Reference to the dropdown content
          >
            <div className="payment-content" ref={cardContentRef}>
              <form className="card-form">
                <label>
                  Card Number
                  <input type="text" placeholder="Enter your card number" />
                </label>
                <label>
                  Card Holder Name
                  <input type="text" placeholder="Enter Holder name" />
                </label>
                <div className="card-details">
                  <label>
                    Exp. Date
                    <input type="date" placeholder="mm/dd/yyyy" />
                  </label>
                  <label>
                    CVV
                    <input type="text" placeholder="Enter your CVV" />
                  </label>
                </div>
                <div className="form-actions">
                  <button type="button" className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </CSSTransition>
        </div>

        {/* My Wallet Section */}
        <div className={`payment-item ${activeWallet === 1 ? "active" : ""}`}>
          <div className="payment-header" onClick={() => toggleWallet(1)}>
            <span>My Wallet</span>
            <span className="dropdown-arrow">
              {activeWallet === 1 ? "▲" : "▼"}
            </span>
          </div>
          <CSSTransition
            in={activeWallet === 1}
            timeout={300}
            classNames="dropdown"
            unmountOnExit
            nodeRef={walletContentRef} // Reference to the dropdown content
          >
            <div className="payment-content" ref={walletContentRef}>
              {["PayPal", "Apple-Pay", "Google-Pay"].map((wallet, index) => (
                <div
                  key={index}
                  className={`wallet-option ${
                    selectedWallet === index ? "selected" : ""
                  }`}
                  onClick={() => setSelectedWallet(index)}
                >
                  <span>
                    <img
                      src={`Icons/${wallet.toLowerCase()}.svg`}
                      alt={wallet}
                    />
                    {wallet}
                  </span>
                  <input
                    type="radio"
                    checked={selectedWallet === index}
                    readOnly
                  />
                </div>
              ))}
            </div>
          </CSSTransition>
        </div>

        <div className="button-payment">
          <button className="payment-button" onClick={() => handlePay()}>
            {" "}
            {t("paynow")}
          </button>
        </div>
      </div>
      <div className="right-side">
        {cartItems.map((item) => (
          <div key={item.id} className="pay-cart-item">
            <img
              src={`${CONFIG.BASE_BACK_URL}/uploads/${item.image}`}
              alt={item.title}
              className="cart-item-image"
            />
            <div className="pay-cart-item-details">
              <h5>{item.title}</h5>
              <p>{item.description}</p>
              <p className="pay-cart-item-price">
                ${parseFloat(item.price) * item.quantity}
              </p>
            </div>
            <div className="pay-cart-item-actions">
              <span className="pay-cart-item-quantity">{item.quantity}</span>
            </div>
          </div>
        ))}
        <div className="pay-total-amount">
          <p>
            {t("total")} : ${totalCost.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
