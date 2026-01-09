import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
  FaHeart,
} from "react-icons/fa";
import { MdCall, MdMail } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { FaLocationDot, FaXTwitter } from "react-icons/fa6";
import "../css/visitor.css";

const FooterBar = () => {
  var navigate = useNavigate();
  return (
    <footer className="footer">
      <Container>
        <Row className="footer-top g-4">
          <Col lg={3} md={12} className="footer-about">
            <div className="footer-logo mb-3">
              <img
                src={require("../assets/healthEasyEMIllogo1.png")}
                alt="Health Easy EMI"
                className="img-fluid mx-auto"
              />
            </div>
            <p className="footer-text">
              <b>Health Easy EMI - </b>Your trusted partner for affordable
              healthcare.
              <br /> Compare dctors, surgeries, book ambulances and consult
              online - all in one secure platform.
              <br /> Making healthcare{" "}
              <b>simple, transparent and financially accessible</b>
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
              {/* <li>
                <Link to="#">Privacy Policy</Link>
              </li> */}
              <li>
                <Link to="/terms">Terms & Conditions</Link>
              </li>
            </ul>
          </Col>
          <Col lg={3} xs={12} className="footer-contact">
            <h4>Contact Us</h4>
            <div className="contact-info">
              <p>
                <MdCall className="me-2" />
                +91 8087161522
              </p>
              <a href="mailto:healtheasyemi@gmail.com?subject=Inquiry&body=Hello HealthEasy team,">
                <div className="d-flex align-items-center ">
                  <div className="d-flex align-items-center">
                    <MdMail size={18} className=" me-2" />
                  </div>
                  <div className="d-flex align-items-center">healtheasyemi@gmail.com</div>
                </div>
              </a>
              <p>
                <FaLocationDot className="me-2" />
                Office no.23, 3rd Floor, Aston Plaza, Narhe Ambegaon Rd, above
                Star Bazaar, Ambegaon Budruk, Pune, Maharashtra 411046
              </p>
            </div>
            <div className="social-links">
              <a className="social-icon">
                <FaFacebookF />
              </a>
              <a className="social-icon">
                <FaXTwitter />
              </a>
              <a
                className="social-icon"
                href="https://www.instagram.com/healtheasyemi/?hl=en"
              >
                <FaInstagram />
              </a>
              <a
                className="social-icon"
                href="https://www.linkedin.com/company/110338361/admin/dashboard/"
              >
                <FaLinkedinIn />
              </a>
              <a
                className="social-icon"
                href="https://www.youtube.com/channel/UCKDchxSJb-_GVKBVXI3NOKA"
              >
                <FaYoutube />
              </a>
            </div>
          </Col>
        </Row>
      </Container>
      <div className="footer-bottom">
        <Container>
          <Row>
            <Col xs={12} md={6} lg>
              <span>
                Made with <FaHeart fill={"#FF4D4F"} /> India
              </span>
            </Col>
            <Col xs={12} md={6} lg className="copyright">
              <p>
                Copyright © 2024 <span>Health Easy EMI</span>
              </p>
            </Col>
            <Col xs={12} md={6} lg className="text-lg-end text-center">
              <span>Developed By @ Codezil Technologies</span>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default FooterBar;
