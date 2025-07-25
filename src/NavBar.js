import React from 'react'
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const NavBar = () => {
    return (
        <header>
            <Navbar expand="lg" className="bg-white border-bottom">
                <Container>
                    <div>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Brand href="#home" className='me-5 ms-3'>Health</Navbar.Brand>
                    </div>
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className='justify-content-between w-100'>
                            <div className='d-flex'>
                                <Link to="#home" className='nav-link fw-bold'>Find Doctor</Link>
                                <Link to="#link" className='nav-link fw-bold'>Video Consultant</Link>
                                <Link to="#link" className='nav-link fw-bold'>Surgeries</Link>
                            </div>
                            <div className='d-flex'>
                                <Link to="#link" className='nav-link'>About</Link>
                                <Link to="#link" className='nav-link'>Services</Link>
                                <Link to="#home" className='nav-link'>Contact</Link>
                            </div>
                        </Nav>
                    </Navbar.Collapse>
                    <NavDropdown title="Login/Signup" id="basic-nav-dropdown" align="end" className='border py-1 px-2 rounded-1 ms-3'>
                        <Link to={'doctor'} className='dropdown-item'>Doctor</Link>
                        <Link to={'patient'} className='dropdown-item'>Patient</Link>
                    </NavDropdown>
                </Container>
            </Navbar>
        </header>
    )
}

export default NavBar