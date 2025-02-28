import CONFIG from '../../config';

export const getMenuDetail = async (id) => {
    try {
      const response = await fetch(`${CONFIG.BASE_BACK_URL}/api/menu/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch menu info");
      }
      const data = await response.json();
        const formattedMenu ={
                id: data._id,
                title: data.name,
                description:data.description,
                price:data.price,
                previousPrice:12.56,
                category_id:data.category_id,
                image: data.image,
                nutri_info:data.nutritional_info,
                stock:data.available_stock,
                dis_id:data.discount_id,
                dis_per:data.discount_percent,
                likes: data.likeCount,
                dislikes: data.dislikeCount,
                tags:data.tags,
                rating:data.stars,
                ingredients: data.ingredients,
                allergens: data.allergens,
                nutrition: data.nutrition,
                fullIngredients: data.fullIngredients,
                feedbacks: data.feedbacks
        };
      return formattedMenu;
    } catch (err) {
      throw err; // Pass the error to the caller
    }
  };
  