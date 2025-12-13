import React from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import { FiArrowUpRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import FadeIn from '../../components/FadeIn'

const FunctionalitySec = () => {
    return (
        <>
            <Container>
                <Row className='justify-content-center g-4'>
                    <Col xs={6} md={6} lg={3}>
                        <FadeIn delay={0}>
                            <Card className='functionality_box border-0'>
                                <Card.Img src={require('../assets/find-doctor-image.png')} alt='video consultant' />
                                <Card.Body>
                                    <Card.Title><Link to='/surgery/T25lIHRvIGthIGZvdXI%3D' className='d-flex align-items-center justify-content-center'> <div className='icon_box'><FiArrowUpRight className='text-white' /></div></Link></Card.Title>
                                </Card.Body>
                                <Card.Footer className='text-center fw-bold'>Find Doctor</Card.Footer>
                            </Card>
                        </FadeIn>
                    </Col>
                    <Col xs={6} md={6} lg={3}>
                        <FadeIn delay={200}>
                            <Card className='functionality_box border-0'>
                                <Card.Img src={require('../assets/video-consultant-image.png')} alt='video consultant' />
                                <Card.Body>
                                    <Card.Title><Link to='/consult' className='d-flex align-items-center justify-content-center'><div className='icon_box'><FiArrowUpRight className='text-white' /></div></Link></Card.Title>
                                </Card.Body>
                                <Card.Footer className='text-center fw-bold'>Video Consultant</Card.Footer>
                            </Card>
                        </FadeIn>
                    </Col>
                    <Col xs={6} md={6} lg={3}>
                        <FadeIn delay={400}>
                            <Card className='functionality_box border-0'>
                                <Card.Img variant="top" src={require('../assets/surgeries-image.png')} alt='video consultant' />
                                <Card.Body>
                                    <Card.Title><Link to='/comparedoctor' className='d-flex align-items-center justify-content-center'><div className='icon_box'><FiArrowUpRight className='text-white' /></div></Link></Card.Title>
                                </Card.Body>
                                <Card.Footer className='text-center fw-bold'>Compare Surgeries </Card.Footer>
                            </Card>
                        </FadeIn>
                    </Col>
                    <Col xs={6} md={6} lg={3}>
                        <fadeIn delay={400}>
                        <Card className='functionality_box border-0'>
                            <Card.Img src={require('../assets/book-ambulance-image.png')} alt='video consultant' />
                            <Card.Body>
                                <Card.Title><Link to='/ambulancepage' className='d-flex align-items-center justify-content-center'><div className='icon_box'><FiArrowUpRight className='text-white' /></div></Link></Card.Title>
                            </Card.Body>
                            <Card.Footer className='text-center fw-bold '>Book Ambulance </Card.Footer>
                        </Card>
                        </fadeIn>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default FunctionalitySec