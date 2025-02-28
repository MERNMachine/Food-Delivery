import React from "react";
import Header from "../Home/Header";
import Footer from "../Home/Footer";
import "../style/About_Us/feedback.css";

const Feedback = () => {
    const testimonialsRow1 = [
        {
            name: "Alexa Diaz",
            text: "This is always our breakfast stop before heading home from vacation. Always delicious. Always great service.",
            image: "/feedback/p1.png",
        },
        {
            name: "Nicole Cooper",
            text: "The absolute best red sauce. Weather on Pizza or Pasta, it's honestly delicious. Portions are huge and the staff is extremely friendly.",
            image: "/feedback/p2.png",
        },
        {
            name: "Emily Davis",
            text: "We both were impressed with the quality and speed it took to receive our food. Highly recommend!",
            image: "/feedback/p3.png",
        },
        {
            name: "John Kelvin",
            text: "We both were impressed with the quality and speed it took to receive our food. Highly recommend!",
            image: "/feedback/p4.png",
        },
        {
            name: "Harry Potter",
            text: "We both were impressed with the quality and speed it took to receive our food. Highly recommend!",
            image: "/feedback/person1.webp",
        },
    ];

    const testimonialsRow2 = [
        {
            name: "John Smith",
            text: "The portions are perfect, and the flavors are unmatched. Great service and ambiance.",
            image: "/feedback/person2.webp",
        },
        {
            name: "Sarah Johnson",
            text: "A must-visit place! The staff is friendly, and the food is worth every penny.",
            image: "/feedback/person3.webp",
        },
        {
            name: "Chris Brown",
            text: "The food is always fresh and delightful. Their red sauce is the best I’ve ever had!",
            image: "/feedback/person4.webp",
        },
        {
            name: "Drink Water",
            text: "We both were impressed with the quality and speed it took to receive our food. Highly recommend!",
            image: "/feedback/p2.png",
        },
        {
            name: "Bill Stone",
            text: "We both were impressed with the quality and speed it took to receive our food. Highly recommend!",
            image: "/feedback/person1.webp",
        },
    ];

    return (
        <div>
            <Header/>
            <div className="feedback-container">
                <h2 className="feedback-title">Our Client Feedback</h2>
                <div className="feedback-row feedback-row-1">
                    {testimonialsRow1.map((item, index) => (
                        <div key={index} className="feedback-card">
                            <p className="feedback-text">"{item.text}"</p>
                            <div className="feedback-author">
                                <img src={item.image} alt={item.name} className="feedback-avatar" />
                                <span>{item.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="feedback-row feedback-row-2">
                    {testimonialsRow2.map((item, index) => (
                        <div key={index} className="feedback-card">
                            <p className="feedback-text">"{item.text}"</p>
                            <div className="feedback-author">
                                <img src={item.image} alt={item.name} className="feedback-avatar" />
                                <span>{item.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer/>
        </div>

    );
};

export default Feedback;
