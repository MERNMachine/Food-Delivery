import CONFIG from '../../config';

export const getMenuLists = async () => {
    try {
      const response = await fetch(`${CONFIG.BASE_BACK_URL}/api/menu`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
        const formattedMenus = data.map((menulist) => ({
                id: menulist._id,
                title: menulist.name,
                description:menulist.description,
                price:menulist.price,
                previousPrice:12.56,
                category_id:menulist.category_id,
                image: menulist.image,
                nutri_info:menulist.nutritional_info,
                stock:menulist.available_stock,
                dis_id:menulist.discount_id,
                dis_per:menulist.discount_percent,
                likes: menulist.likeCount,
                dislikes: menulist.dislikeCount,
                tags:menulist.tags,
                rating:menulist.stars,
                ingredients: menulist.ingredients,
                allergens: menulist.allergens,
                nutrition: menulist.nutrition,
                fullIngredients: menulist.fullIngredients,
                feedbacks: menulist.feedbacks
        }));
      return formattedMenus;
    } catch (err) {
      throw err; // Pass the error to the caller
    }
  };
  