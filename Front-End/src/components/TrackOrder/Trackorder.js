import React from "react";
import Header from "../Home/Header";
import Footer from "../Home/Footer";
import { apiGetAllOrder } from "../../api/MyOrders/apiGetAllOrders";
import "../style/TrackOrder/trackorder.css";
import { useEffect, useState } from "react";
import toastr from "toastr";
import CONFIG from "../../config";
import { io } from "socket.io-client";

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
const Trackorder = () => {
  const socket = io(`${CONFIG.BASE_BACK_URL}`);

  const [loading, setLoading] = useState(true); // Loading state
  const [orderItems, setOrderItems] = useState([]);
  useEffect(() => {
    socket.on("connection", () => {
      console.log("Connected to WebSocket Server, ID:", socket.id);
    });
    const fetchMyOrders = async () => {
      try {
        const data = await apiGetAllOrder();
        setOrderItems(data);
        setLoading(false);
      } catch (err) {
        if (err.response && err.response.data && err.response.data.msg) {
          toastr.warning(err.response.data.msg); // Now correctly displays the message
        } else {
          toastr.warning("Something went wrong!");
        }
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }
  return (
    <div>
      <Header />
      <div>
        <div className="order-tracking">
          {orderItems.map((order) => (
            <div key={order._id}>
              <p className="tracking-status">
                Status: <span>{order.status}</span>
              </p>
              {order.order_items.map((item) => (
                <div key={item._id} className="tracking-cart-item">
                  <img
                    src={`${CONFIG.BASE_BACK_URL}/uploads/${item.menu_item_id.image}`}
                    alt={item.title}
                    className="tracking-item-image"
                  />
                  <div className="tracking-item-details">
                    <h5>{item.menu_item_id.name}</h5>
                    <p>{item.menu_item_id.description}</p>
                    <p className="tracking-item-price">
                      ${parseFloat(item.price) * item.quantity}
                    </p>
                  </div>
                  <div className="tracking-item-actions">
                    <span className="tracking-item-quantity">
                      {item.quantity}
                    </span>
                  </div>
                </div>
              ))}
              <p className="tracking-total-price">
                Total_Price:{order.total_price}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default Trackorder;
