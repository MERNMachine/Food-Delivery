import axios from 'axios'
export const getUsers = async (search: string) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/api/admin/users`, {
            params: search != '' ? { search } : null
        });
        return response.data;
    }
    catch (error) {
        console.log(error);
        return error;
    }

}
export const updateUser = async (id: string, data: any) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_APP_BACKEND_URL}/api/admin/users/${id}`, data);
        return response.data;
    }
    catch (error) {
        console.log(error);
        return error;
    }
}
export const deleteUser = async (id: string) => {

    try {
        const response = await axios.delete(`${import.meta.env.VITE_APP_BACKEND_URL}/api/admin/users/${id}`);
        return response.data;
    }
    catch (error) {
        console.log(error);
        return error;
    }
}

export const getMenuItems = async (search: string, categories: string[]) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/api/menu`, {
            params: {
                search: search || null,
                categories: categories.length > 0 ? categories.join(",") : null,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching menu items:", error);
        return [];
    }
};


export const addMenuItem = async (data: FormData) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_APP_BACKEND_URL}/api/admin/menu`, data);
        return response.data;
    } catch (error) {
        console.log(error);
        return error;
    }
};

export const updateMenuItem = async (id: string, data: FormData) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_APP_BACKEND_URL}/api/admin/menu/${id}`, data);
        return response.data;
    } catch (error) {
        console.log(error);
        return error;
    }
};

export const deleteMenuItem = async (id: string) => {
    try {
        const response = await axios.delete(`${import.meta.env.VITE_APP_BACKEND_URL}/api/admin/menu/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
        return error;
    }
};

export const getCategories = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/api/admin/categories`);
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};
export const deleteCategory = async (id: string) => {
    try {
        const response = await axios.delete(`${import.meta.env.VITE_APP_BACKEND_URL}/api/admin/category/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

export const getAdminOrders = async (search: string, status: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_APP_BACKEND_URL}/api/admin/orders`, {
        params: { search, status },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching admin orders:", error);
      return [];
    }
};
  
export const updateOrderStatus = async (id: string, status: string) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_APP_BACKEND_URL}/api/admin/order/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error("Error updating order status:", error);
        return null;
    }
};