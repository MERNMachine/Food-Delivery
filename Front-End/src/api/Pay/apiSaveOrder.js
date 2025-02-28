import CONFIG from "../../config";
import axios from "axios";

export const apiSaveOrder = async (total_price, order_items = [] ) => {
   
  try {
    const order_info = {
        totalPrice:total_price,
        orderItems:order_items,
    };
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    };
    const response = await axios.post(
      `${CONFIG.BASE_BACK_URL}/api/order/create-order`,
      order_info,
      { headers }
    );
    return response.data; // Token or success message
  } catch (err) {
    if (err.response && err.response.data && err.response.data.msg) {
      throw err; // Preserve the original Axios error structure
    }

    throw new Error("Network error");
  }
};
