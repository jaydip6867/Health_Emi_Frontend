import React from 'react'
import { Col, Container, Form, Row } from 'react-bootstrap'
import { FaGooglePlay } from 'react-icons/fa'

const AppDownload = () => {
    return (
        <>
            <section className='spacer-t'>
                <Container>
                    <div className='app-sec-bg radius-20 p-0 pe-lg-5'>
                        <Row className='align-items-end g-4'>

                            <Col xs={12} lg={6}>
                                <div className='app-download-box text-center text-lg-start'>
                                    <h2 className='text-white mb-3'>Download the Health app</h2>
                                    <div className='d-flex gap-4 justify-content-center justify-content-lg-start'>
                                        <img src={require('../assets/Google-play.png')} className='img-fluid' />
                                        <img src={require('../assets/Google-play.png')} className='img-fluid' />
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} lg={5} className='position-relative'>
                                <div className='app-download-img-div bottom-0 w-100'>
                                    <img src={require('../assets/App-download-screenshot.png')} className="w-100" />
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </section>
        </>
    )
}

export default AppDownload