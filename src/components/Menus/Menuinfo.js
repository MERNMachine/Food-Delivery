import React from "react";
import "../style/Menus/menuinfo.css";

const MenuInfo = () => {
    return (
        <div className="menu-info">
            <h1 className="menu-title">Our Menu</h1>
            <p className="menu-description">
                At our restaurant, we routinely add new items to our rotating menu of 300+ meals. Whether you're looking for Gluten Free, Vegetarian, Keto, or Low Fat options, we have a meal to fit your nutritional needs.
            </p>
            <p className="menu-description">
                All online orders will be ready for in-store pickup from our dedicated "To-Go" refrigerators 15 minutes after the order has been placed.
            </p>
            <div className="menu-tags">
                <div className="menu-tag">
                    <span className="tag-circle gf">GF</span>
                    Gluten Free
                </div>
                <div className="menu-tag">
                    <span className="tag-circle veg">V</span>
                    Vegetarian
                </div>
                <div className="menu-tag">
                    <span className="tag-circle keto">K</span>
                    Keto
                </div>
                <div className="menu-tag">
                    <span className="tag-circle lf">LF</span>
                    Low Fat
                </div>
                <div className="menu-tag">
                    <span className="tag-circle df">DF</span>
                    Dairy Free
                </div>
            </div>
        </div>
    );
};

export default MenuInfo;
