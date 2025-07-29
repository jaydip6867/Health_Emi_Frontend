import React from 'react'
import NavBar from '../NavBar'
import FooterBar from '../FooterBar'
import { Col, Container, Row } from 'react-bootstrap'
import { FcBiotech, FcElectricalSensor, FcFinePrint } from 'react-icons/fc'

const About = () => {
    return (
        <>
            <NavBar />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container>
                    <h2>About us</h2>
                    {/* <h4>CodeZil is on a mission to make quality healthcare affordable and accessible for over a billion+ Indians.</h4> */}
                </Container>
            </section>
            {/* offer section */}
            <section className='py-5'>
                <Container>
                    <div className='text-center sec_head'>
                        <h2>Our Mission</h2>
                        <p>Private online consultations with verified doctors in all specialists</p>
                        <hr style={{ 'width': '100px' }} className='mx-auto' />
                    </div>
                    <Row className='g-4 g-md-5'>
                        <Col xs={12} sm={6} md={4}>
                            <div className='text-center'>
                                <FcFinePrint className='display-1' />
                                <h4 className='my-3'>Helping People to Explore Branded Hospitals</h4>
                                <p>As we assign a health assistant in each hospital, it's easy to ensure you the fresh hospital data. Our community of patients and patients' kin share their reviews, so you have all that you need to make an informed choice.</p>
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <div className='text-center'>
                                <FcBiotech className='display-1' />
                                <h4 className='my-3'>Making a Hassle-free Medical Journey</h4>
                                <p>Starting with information about branded hospitals in India, we’re making hospitalization smoother and easier with services like online appointment booking, getting surgery package estimate, hassle free admission-discharge with our Health assistant and online health records.</p>
                            </div>
                        </Col>
                        <Col xs={12} sm={6} md={4}>
                            <div className='text-center'>
                                <FcElectricalSensor className='display-1' />
                                <h4 className='my-3'>Enabling Hospitals to Create Great Experiences</h4>
                                <p>With our online patients engagement tools, we're enabling hospitals to provide great medical services and create better hospitalization experiences for the patients.</p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
            {/* health section */}
            <section className='py-5 bg-secondary-subtle'>
                <Container>
                    <Row>
                        <Col xs={12} md={6}>
                            <div className='sec_head mb-0 text-center text-md-start py-5'>
                                <h2>Health is a habit</h2>
                                <hr style={{ 'width': '100px' }} className='mx-md-0 mx-auto' />
                                <p className='mb-0'>It is the journey that takes you to new destinations every day with endless possibilities of life on the back of happiness, energy, and hope. Practo wants to make this journey easy for every Indian and help them live healthier and longer lives.</p>
                            </div>
                        </Col>
                        <Col xs={12} md={6}>
                            <img src='' className='img-fluid'/>
                        </Col>
                    </Row>
                </Container>
            </section>
            <FooterBar />
        </>
    )
}

export default About
