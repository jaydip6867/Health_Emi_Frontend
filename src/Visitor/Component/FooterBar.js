import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaHeart,
} from "react-icons/fa";
import { MdCall, MdMail } from "react-icons/md";
import { Link } from "react-router-dom";
import "../css/visitor.css";

const FooterBar = () => {
  return (
    <footer className="footer">
      <Container>
        <Row className="footer-top g-4">
          <Col lg={3} md={12} className="footer-about">
            <div className="footer-logo mb-3">
              <img
                src={require("../assets/health-easy-emi-logo-white.png")}
                alt="Health Easy EMI"
                className="img-fluid mx-auto"
              />
            </div>
            <p className="footer-text text-center">
              Discover stylish, tech-savvy wearables at Kalindi — where innovation meets elegance in every product.
            </p>
          </Col>
          <Col sm={3} xs={12} md={4} lg={2} className="footer-links">
            <h4>Pages</h4>
            <ul>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <Link to="/blog">Blog</Link>
              </li>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
            </ul>
          </Col>
          <Col sm={3} xs={12} md={4} lg={2} className="footer-links">
            <h4>For Patients</h4>
            <ul>
              <li>
                <Link to="/surgery">Surgeries</Link>
              </li>
              <li>
                <Link to="/ambulancepage">Ambulance</Link>
              </li>
              <li>
                <Link to="/consult">Video Consultant</Link>
              </li>
            </ul>
          </Col>
          <Col sm={5} xs={12} md={3} lg={2} className="footer-links">
            <h4>More Pages</h4>
            <ul>
              <li>
                <Link to="#">Privacy Policy</Link>
              </li>
              <li>
                <Link to="#">Terms & Conditions</Link>
              </li>
            </ul>
          </Col>
          <Col lg={3} xs={12} className="footer-contact">
            <h4>Contact Us</h4>
            <div className="contact-info">
              <p>
                <MdCall className="me-2" />
                +91 81412 61261
              </p>
              <p>
                <MdMail className="me-2" />
                info@healtheasyemi.com
              </p>
            </div>
            <div className="social-links">
              <a className="social-icon">
                <FaFacebookF />
              </a>
              <a className="social-icon">
                <FaTwitter />
              </a>
              <a className="social-icon">
                <FaInstagram />
              </a>
              <a className="social-icon">
                <FaLinkedinIn />
              </a>
              <a className="social-icon">
                <FaYoutube />
              </a>
            </div>
          </Col>
        </Row>
      </Container>
      <div className="footer-bottom">
        <Container>
          <Row>
            <Col xs={12} md={6} lg><span>Made with <FaHeart fill={"#FF4D4F"} /> India</span></Col>
            <Col xs={12} md={6} lg className="copyright"><p>Copyright © 2024 <span>Health Easy EMI</span></p></Col>
            <Col xs={12} md={6} lg className="text-lg-end text-center"><span>Developed By @ Codezil Technologies</span></Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default FooterBar;
