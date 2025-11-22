import React, { useState, useEffect } from "react";
import { Button, Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../css/visitor.css";

const NavBar = ({ logindata }) => {

  var navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const [activeLink, setActiveLink] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(false);
  // console.log(logindata)

  useEffect(() => {
    // Set active link based on current path
    const path = location.pathname;
    setActiveLink(path);
  }, [location]);

  const closeNav = () => setExpanded(false);

  const isActive = (path) => {
    // Set home ('/') as active when no path matches or when at root
    if (path === '/' && (activeLink === '/' || activeLink === '')) {
      return 'active';
    }
    return activeLink === path ? "active" : "";
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropdown(!activeDropdown);
  };


  return (
    <header className="header_bg">
      <Navbar expanded={expanded} expand="lg" className="py-3">
        <Container fluid className="px-3 px-md-5">
          <Link to={"/"} className="navbar-brand me-5">
            <img
              src={require("../assets/health-easy-emi-logo-dark.png")}
              className="logo-img"
              alt="Health Easy EMI Logo"
            />
          </Link>

          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            onClick={() => setExpanded(expanded ? false : true)}
            className="border-0"
          >
            {expanded ? <FaTimes /> : <FaBars />}
          </Navbar.Toggle>

          <Navbar.Collapse className="menubar" id="basic-navbar-nav">
            <Nav className="mx-auto">
              <Link
                to="/"
                className={`nav-link ${isActive('/')}`}
                onClick={closeNav}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`nav-link ${isActive('/about')}`}
                onClick={closeNav}
              >
                About Us
              </Link>
              <Link
                to="/blog"
                className={`nav-link ${isActive('/blog')}`}
                onClick={closeNav}
              >
                Blog
              </Link>
              <Link
                to="/contact"
                className={`nav-link ${isActive('/contact')}`}
                onClick={closeNav}
              >
                Contact
              </Link>
            </Nav>

            <NavDropdown
              title={
                <span className="login-signup-btn" onClick={toggleDropdown}>
                  {logindata ? logindata.name : "Login/Signup"}
                  {/* Login/Signup */}
                </span>
              }
              id="basic-nav-dropdown"
              align="end"
              className="ms-lg-3 mt-3 mt-lg-0"
              show={activeDropdown}
              onToggle={(isOpen) => setActiveDropdown(isOpen)}
            >
              {logindata ? (
                logindata.logintype === 'doctor' ? (
                  <>
                    <NavDropdown.Item as={Link} to="/doctor/doctorprofile" className="text-center">
                      Profile
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      className="text-center text-danger"
                      onClick={() => {
                        localStorage.removeItem('healthdoctor');
                        navigate('/doctor');
                      }}
                    >
                      Logout
                    </NavDropdown.Item>
                  </>
                ) : (
                  <>
                    <NavDropdown.Item as={Link} to="/patient/patientprofile" className="text-center">
                      Profile
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      className="text-center text-danger"
                      onClick={() => {
                        localStorage.removeItem('PatientLogin');
                        navigate('/patient');
                      }}
                    >
                      Logout
                    </NavDropdown.Item>
                  </>
                )
              ) : (
                <>
                  <NavDropdown.Item as={Link} to="/doctor">Doctor</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/patient">Patient</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/ambulance">Ambulance</NavDropdown.Item>
                </>
              )}

              {/* <NavDropdown.Item as={Link} to="/doctor">
                Doctor
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/patient">
                Patient
              </NavDropdown.Item> */}
            </NavDropdown>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default NavBar;
