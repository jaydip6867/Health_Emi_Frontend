import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'

const AppDownload = () => {
    return (
        <>
            <section className='spacer-t'>
                <Container>
                    <div className='app-sec-bg radius-20 p-0 pe-lg-5'>
                        <Row className='align-items-center g-4'>

                            <Col xs={12} lg={7}>
                                <div className='app-download-box text-center text-lg-start'>
                                    <span className='text-white fs-4'>Working for Your Better Health.</span>
                                    <h2 className='text-white mb-3 fs-1'>Download the Doccure App today!</h2>
                                    <div className='scan_sec my-4'>
                                        <p className='mb-2 text-white'>Scan the QR code to get the app now</p>
                                        <img src={require('../assets/QR-code.png')} className='img-fluid' alt='QR-code' />
                                    </div>
                                    <div className='d-flex gap-4 justify-content-center justify-content-lg-start'>
                                        <img src={require('../assets/Google-play.png')} className='img-fluid' alt='Google-play' />
                                        <img src={require('../assets/App-store.png')} className='img-fluid' alt='App-store' />
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} lg={5} className='position-relative'>
                                <div className='app-download-img-div'>
                                    <img src={require('../assets/App-download-screenshot.png')} className="w-75 mx-auto w-lg-100" alt='App-download-screenshot' />
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