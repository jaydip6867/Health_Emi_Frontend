import React from 'react'
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { FaFacebookF, FaGooglePlusG, FaInstagram, FaLinkedinIn } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const NavBar = () => {
    return (
        <header className='header_bg'>
            <Navbar expand="lg">
                <Container>
                    <div>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Link to={'/'} className='me-5 ms-3 navbar-brand'>CodeZil</Link>
                    </div>
                    <div className='d-flex gap-2'>
                        <Link to="#link" className='nav-link'><FaInstagram /></Link>
                        <Link to="#link" className='nav-link'><FaGooglePlusG /></Link>
                        <Link to="#link" className='nav-link'><FaFacebookF /></Link>
                        <Link to="#link" className='nav-link'><FaLinkedinIn /></Link>
                    </div>
                    <NavDropdown title="Login/Signup" id="basic-nav-dropdown" align="end" className='menubar border py-1 px-2 rounded-1 ms-3 order-lg-last'>
                        <Link to={'/doctor'} className='dropdown-item'>Doctor</Link>
                        <Link to={'/patient'} className='dropdown-item'>Patient</Link>
                    </NavDropdown>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className='ms-auto text-center menubar'>
                            <Link to="/about" className='nav-link'>About</Link>
                            <Link to="/services" className='nav-link'>Services</Link>
                            <Link to="/contact" className='nav-link'>Contact</Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    )
}

export default NavBar