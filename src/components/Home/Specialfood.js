import React from "react";
import { Row, Col, Button, Card } from "antd";
import { useNavigate } from "react-router-dom";
import "../style/Home/Specialfood.css";

const promotions = [
  {
    id: 1,
    title: "Best deals",
    highlight: "Crispy Sandwiches",
    description:
      "Enjoy the large size of sandwiches. Complete your meal with the perfect slice of sandwiches.",
    image: "/special/chicken.png", // Replace with the actual image path
    buttonText: "PROCEED TO ORDER",
  },
  {
    id: 2,
    title: "Celebrate parties with",
    highlight: "Fried Chicken",
    description:
      "Get the best fried chicken smeared with a lip-smacking lemon chili flavor. Check out best deals for fried chicken.",
    image: "/special/cripsy.png", // Replace with the actual image path
    buttonText: "PROCEED TO ORDER",
  },
  {
    id: 3,
    title: "Wanna eat hot &",
    highlight: "spicy Pizza?",
    description:
      "Pair up with a friend and enjoy the hot and crispy pizza pops. Try it with the best deals.",
    image: "/special/pizza.png", // Replace with the actual image path
    buttonText: "PROCEED TO ORDER",
  },
];

const Special = () => {
  const navigate = useNavigate();
    return (
      <div className="promotions-section">
        <Row gutter={[32, 32]}>
          {promotions.map((promo, index) => (
            <Col span={24} key={promo.id}>
              <Card className="promo-card">
                <Row align="middle" gutter={16}>
                  {/* Zigzag logic: Check if index is odd or even */}
                  {index % 2 === 0 ? (
                    <>
                      {/* Text first, then Image */}
                      <Col xs={24} md={12} span={9}>
                        <div className="promo-content">
                          <h2>
                            {promo.title}{" "}
                            <span className="highlight">{promo.highlight}</span>
                          </h2>
                          <p>{promo.description}</p>
                          <Button type="primary" className="promo-button" onClick={(e) => {e.preventDefault(); navigate("/menu");}}>
                            {promo.buttonText}
                          </Button>
                        </div>
                      </Col>
                      <Col xs={24} md={12} span={15} className="special-food">
                        <img
                          src={promo.image}
                          alt={promo.highlight}
                          className="promo-image"
                        />
                      </Col>
                    </>
                  ) : (
                    <>
                      {/* Image first, then Text */}
                      <Col xs={24} md={12} span={15} className="special-food">
                        <img
                          src={promo.image}
                          alt={promo.highlight}
                          className="promo-image"
                        />
                      </Col>
                      <Col xs={24} md={12} span={9}>
                        <div className="promo-content">
                          <h2>
                            {promo.title}{" "}
                            <span className="highlight">{promo.highlight}</span>
                          </h2>
                          <p>{promo.description}</p>
                          <Button type="primary" className="promo-button">
                            {promo.buttonText}
                          </Button>
                        </div>
                      </Col>
                    </>
                  )}
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };
  
  export default Special;