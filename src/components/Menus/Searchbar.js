import React from "react";
import "../style/Menus/searchbar.css";

const SearchBar = () => {
  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="Search all of our menus"
      />
      <button className="search-button">
        <i className="fa fa-search"></i>
      </button>
    </div>
  );
};

export default SearchBar;
