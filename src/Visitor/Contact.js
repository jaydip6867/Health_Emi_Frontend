import React from 'react'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'

const Contact = () => {
    return (
        <>
            <NavBar />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container>
                    <h2>Contact us</h2>
                    <h4>Have questions about our products, support services, or anything else? Let us know and we’ll get back to you.</h4>
                </Container>
            </section>
            {/* contact form */}
            <section className='py-5 my-4'>
                <Container>
                    <Row>
                        <Col xs={12} md={6}>
                            <h3>Contact Us</h3>
                            <Form className='mt-4 '>
                                <Form.Group controlId="name" className='mb-3'>
                                    <Form.Label>Name <span className='text-danger'>*</span></Form.Label>
                                    <Form.Control type="name" name='name' placeholder="Enter Your Name" />
                                </Form.Group>

                                <Form.Group controlId="email" className='mb-3'>
                                    <Form.Label>Email <span className='text-danger'>*</span></Form.Label>
                                    <Form.Control type="email" name='email' placeholder="Enter Your Email" />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="message">
                                    <Form.Label>Message <span className='text-danger'>*</span></Form.Label>
                                    <Form.Control as={'textarea'} placeholder="Message" />
                                </Form.Group>

                                <Button variant="primary" type="button" className='btn-theme'>
                                    Submit
                                </Button>
                            </Form>
                        </Col>
                        <Col xs={12} md={6}>
                            <div className='h-100 border'>
                                <div className='h-100 shadow'><iframe width="100%" height="100%" src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=varachha%20road+(My%20Business%20Name)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"><a href="https://www.mapsdirections.info/fr/calculer-la-population-sur-une-carte">Carte démographique</a></iframe></div>
                            </div>
                        </Col>
                    </Row>

                </Container>
            </section>
            <FooterBar />
        </>
    )
}

export default Contact
