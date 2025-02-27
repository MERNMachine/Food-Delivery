import CONFIG from '../../config';
export const getCategories = async () => {
    try {
     const response = await fetch(`${CONFIG.BASE_BACK_URL}/api/admin/categories`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      // Transform the data into the desired format
    //   const formattedCategories = Object.entries(data).map(([key, value]) => ({
    //     title: key,
    //     options: value,
    //   }));
        const formattedCategories = data.map((category) => ({
                id: category._id,
                title: category.name,
                options: category.sub.map((subItem) =>({
                        id:subItem._id,
                        name:subItem.name,
                })),
        }));
      return formattedCategories;
    } catch (err) {
      throw err; // Pass the error to the caller
    }
  };
  