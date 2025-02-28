import CONFIG from "../../config";
import axios from "axios";

export const apiGetAllOrder = async () => {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    };
    const response = await axios.get(`${CONFIG.BASE_BACK_URL}/api/order`, {
      headers,
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.data && err.response.data.msg) {
      throw err; // Preserve the original Axios error structure
    }

    throw new Error("Network error");
  }
};
