import React from "react";
import "../style/Home/Footer.css";
const Footer = () => {
  return (
    <footer className="footer">
      {/* Top Section */}
      <div className="footer-top">
        <div className="footer-top-row">
          <div className="socials">
            FOLLOW US :
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://google.com" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-google"></i>
            </a>
          </div>
          <div className="footer-logo">DIGITAL MENU</div>
        </div>
        <div className="newsletter">
          <input type="email" placeholder="Your Email Address" className="newsletter-input" />
          <button className="newsletter-button">
            <i className="fa fa-paper-plane"></i>
          </button>
        </div>
      </div>

      {/* Main Section */}
      <div className="footer-main">
        <div className="footer-section">
          <h4>Address</h4>
          <p>Eight Avenue 385,<br /> New York</p>
        </div>
        <div className="footer-section">
          <h4>Open Timing</h4>
          <p>
            Monday - Friday<br />
            <span className="time">7 am - 10 pm</span><br />
            <span className="note">(Breakfast, Lunch, Dinner)</span>
          </p>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>
            example@example.com<br />
            +7(111)8765432
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
        <p>© 2025 DIGITAL MENU. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
};

export default Footer;
