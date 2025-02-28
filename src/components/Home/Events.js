import React from "react";
import "../style/Home/Events.css";

const Events = () => {
  const eventsData = [
    {
      title: "Custom Parties",
      price: "$99",
      description:
        "Quo corporis voluptas ea ad. Consectetur inventore sapiente ipsum voluptas eos omnis facere. Enim facilis veritatis id est rem repudiandae nulla expedita quas.",
      image: "./events/events-3.jpg",
    },
    {
      title: "Private Parties",
      price: "$289",
      description:
        "In delectus sint qui et enim. Et ab repudiandae inventore dolores ea assumenda et. Delectus saepe accusamus aspernatur.",
      image: "./events/events-2.jpg",
    },
    {
      title: "Birthday Parties",
      price: "$499",
      description:
        "Laborum aperiam atque adipisci quia omnis minus omnis est qui assumenda quos. Quis id sit quibusdam. Esse quisquam ducimus officia ipsum ut quibusdam maxime. Non enim perspiciatis.",
      image: "./events/events-1.jpg",
    },
  ];

  return (
    <section className="events">
      <h2 className="events-title">
        Share <span className="highlight">Your Moments</span> In Our Restaurant
      </h2>
      <div className="events-container">
        {eventsData.map((event, index) => (
          <div className="event-card" key={index}>
            <img src={event.image} alt={event.title} className="event-image" />
            <div className="event-details">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-price">{event.price}</p>
              <p className="event-description">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Events;