import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { MdLocationPin, MdMailOutline, MdOutlineCall } from "react-icons/md";
import { Link } from "react-router-dom";
import "../css/visitor.css";

const FooterBar = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <Container>
          <Row className="g-4">
            <Col lg={3} md={6} className="footer-about">
              <div className="footer-logo mb-3">
                <img
                  src={require("../assets/health-easy-emi-logo-white.png")}
                  alt="Health Easy EMI"
                  className="img-fluid"
                />
              </div>
              <p className="footer-text">
                Crafting exceptional digital experiences through thoughtful
                design and innovative solutions that elevate your brand
                presence.
              </p>
              <div className="social-links">
                <a href="#" className="social-icon">
                  <FaFacebookF />
                </a>
                <a href="#" className="social-icon">
                  <FaTwitter />
                </a>
                <a href="#" className="social-icon">
                  <FaInstagram />
                </a>
                <a href="#" className="social-icon">
                  <FaLinkedinIn />
                </a>
                <a href="#" className="social-icon">
                  <FaYoutube />
                </a>
              </div>
            </Col>

            <Col lg={6} md={12}>
              <Row className="g-2">
                <Col sm={4} xs={6} className="footer-links">
                  <h4>Pages</h4>
                  <ul>
                    <li>
                      <Link to="/about">About</Link>
                    </li>
                    <li>
                      <Link to="/blog">Blog</Link>
                    </li>
                    <li>
                      <Link to="/careers">Careers</Link>
                    </li>
                    <li>
                      <Link to="/contact">Contact Us</Link>
                    </li>
                  </ul>
                </Col>

                <Col sm={4} xs={6} className="footer-links">
                  <h4>For Patients</h4>
                  <ul>
                    <li>
                      <Link to="#">Surgeries</Link>
                    </li>
                    <li>
                      <Link to="#">Ambulance</Link>
                    </li>
                    <li>
                      <Link to="#">Video Consultant</Link>
                    </li>
                    <li>
                      <Link to="#">Doctor Profile</Link>
                    </li>
                  </ul>
                </Col>
                <Col sm={4} xs={6} className="footer-links">
                  <h4>More Pages</h4>
                  <ul>
                    <li>
                      <Link to="#">Privacy Policy</Link>
                    </li>
                    <li>
                      <Link to="#">Terms & Conditions</Link>
                    </li>
                    <li>
                      <Link to="#">Return Policy</Link>
                    </li>
                   
                    
                  </ul>
                </Col>
              </Row>
            </Col>
            <Col lg={3} md={6} className="footer-contact">
              <h4>Contact Us</h4>
              <div className="contact-info">
                <p>
                  <MdLocationPin className="me-2" />
                  123 Healthcare Street, Medical District, Mumbai, Maharashtra
                  400001
                </p>
                <p>
                  <MdOutlineCall className="me-2" />
                  +91 12345 67890
                </p>
                <p>
                  <MdMailOutline className="me-2" />
                  info@healtheasyemi.com
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="footer-bottom">
        <Container>
          <div className="copyright">
            &copy; {new Date().getFullYear()} Health Easy EMI. All Rights
            Reserved.
          </div>
          <div className="footer-legal">
            <Link to="https://codeziltechnologies.com/">Developed By @ Codezil Technologies</Link>
          
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default FooterBar;
