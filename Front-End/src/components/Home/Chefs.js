import React from "react";
import "../style/Home/Chefs.css";

const Chefs = () => {
  const chefsData = [
    {
      name: "Beverly A Richardson",
      title: "Master Chef",
      image: "./chefs/chef1.webp",
    },
    {
      name: "Margaret J Otero",
      title: "Patissier",
      image: "./chefs/chef2.webp",
    },
    {
      name: "Maryln E Walker",
      title: "Cook",
      image: "./chefs/chef3.webp",
    },
  ];

  return (
    <div className="chefs">
      <h2 className="chefs-title">
        Our <span className="highlight">Professional Chefs</span>
      </h2>
      <div className="chefs-container">
        {chefsData.map((chef, index) => (
          <div className="chef-card" key={index}>
            <img src={chef.image} alt={chef.name} className="chef-image" />
            <h3 className="chef-name">{chef.name}</h3>
            <p className="chef-title">{chef.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chefs;
