import React from "react";
import "../style/Home/Process.css";
import { useTranslation } from "react-i18next";


const steps = [
  {
    id: 1,
    image: "/Icons/location.png", // Replace with your image path
    title: "select-location",
    description: "choose-location",
  },
  {
    id: 2,
    image: "/Icons/order.png", // Replace with your image path
    title: "choose-order",
    description: "check-over",
  },
  {
    id: 3,
    image: "/Icons/pay.png", // Replace with your image path
    title: "pay-advanced",
    description: "quick-safe",
  },
  {
    id: 4,
    image: "/Icons/meals.png", // Replace with your image path
    title: "enjoy-meals",
    description: "food-is-made",
  },
];

const Process = () => {
  const { t, i18n } = useTranslation();
  return (
    <div className="how-it-works">
      <h2 className="title">{t("how-does-it-work")}</h2>
      <div className="row justify-content-center">
        {steps.map((step) => (
          <div className="col-12 col-md-3 text-center step" key={step.id}>
            <img src={step.image} alt={step.title} className="step-image" />
            <h3 className="step-title">{t(step.title)}</h3>
            <p className="step-description">{t(step.description)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Process;
