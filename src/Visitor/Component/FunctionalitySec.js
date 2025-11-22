import React from 'react'   
import { Container, Row, Col, Card } from 'react-bootstrap'
import { FiArrowUpRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const FunctionalitySec = () => {
    return (
        <>
            <Container>
                <Row className='justify-content-center g-4'>
                    <Col xs={12} sm={6} lg={3}>
                        <Card className='functionality_box'>
                            <Card.Img src={require('../assets/find-doctor-image.png')} alt='video consultant' />
                            <Card.Body>
                                <Card.Title><Link to='/comparedoctor' className='d-flex align-items-center w-100 justify-content-between'>Compare Doctor <div className='icon_box'><FiArrowUpRight className='text-white' /></div></Link></Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} lg={3}>
                        <Card className='functionality_box'>
                            <Card.Img src={require('../assets/video-consultant-image.png')} alt='video consultant' />
                            <Card.Body>
                                <Card.Title><Link to='/consult' className='d-flex align-items-center w-100 justify-content-between'>Video Consultant <div className='icon_box'><FiArrowUpRight className='text-white' /></div></Link></Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} lg={3}>
                        <Card className='functionality_box'>
                            <Card.Img variant="top" src={require('../assets/surgeries-image.png')} alt='video consultant' />
                            <Card.Body>
                                <Card.Title><Link to='/surgery' className='d-flex align-items-center w-100 justify-content-between'>Surgeries <div className='icon_box'><FiArrowUpRight className='text-white' /></div></Link></Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} lg={3}>
                        <Card className='functionality_box'>
                            <Card.Img src={require('../assets/book-ambulance-image.png')} alt='video consultant' />
                            <Card.Body>
                                <Card.Title><Link to='/ambulancepage' className='d-flex align-items-center w-100 justify-content-between'>Book Ambulance <div className='icon_box'><FiArrowUpRight className='text-white' /></div></Link></Card.Title>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default FunctionalitySec