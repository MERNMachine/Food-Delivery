import axios from "axios";
import CONFIG from "../../config";

export const apiPostFeed = async (id, review) => {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `${token}`,
    };
    const response = await axios.post(
      `${CONFIG.BASE_BACK_URL}/api/menu/${id}/feedback`,
      review,
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
