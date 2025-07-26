import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { MdLocationPin, MdMailOutline, MdOutlineCall } from 'react-icons/md'
import { Link } from 'react-router-dom'

const FooterBar = () => {
    return (
        <>
            <footer className='footer_bg pt-5'>
                <Container>
                    <Row>
                        <Col xs={12} md={6}>
                            <div className='footer_logo'>
                                <h4>CodeZil</h4>
                            </div>
                            <p className='py-3'>Crafting exceptional digital experiences through thoughtful design and innovative solutions that elevate your brand presence.</p>
                            <div className='py-2'>
                                <p><MdLocationPin className='me-2' />123 Creative Boulevard, Design District, IN 10012</p>
                                <p><MdOutlineCall className='me-2' />+1 (555) 987-6543</p>
                                <p><MdMailOutline className='me-2' />healtheasyemi@gmail.com</p>
                            </div>
                        </Col>
                        <Col xs={12} md={3}>
                            <h5>Menus</h5>
                            <ul className='list-unstyled'>
                                <li><Link  className='nav-link'>About</Link></li>
                                <li><Link  className='nav-link'>Contact</Link></li>
                                <li><Link  className='nav-link'>Find Doctor</Link></li>
                                <li><Link  className='nav-link'>Video Consultant</Link></li>
                                <li><Link  className='nav-link'>Surgeries</Link></li>
                            </ul>
                        </Col>
                        <Col xs={12} md={3}>
                            <h5>Menus</h5>
                            <ul className='list-unstyled'>
                                <li><Link  className='nav-link'>About</Link></li>
                                <li><Link  className='nav-link'>Contact</Link></li>
                                <li><Link  className='nav-link'>Find Doctor</Link></li>
                                <li><Link  className='nav-link'>Video Consultant</Link></li>
                                <li><Link  className='nav-link'>Surgeries</Link></li>
                            </ul>
                        </Col>
                    </Row>

                </Container>
            </footer>
            <div className='text-center py-3 footer_bg border-top border-opacity-25 border-light'>Copyright © 2025, CodeZil technologies. All rights reserved.</div>
        </>
    )
}

export default FooterBar