import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const Speciality = () => {
    return (
        <>
            <section className='spacer-y'>
                <Container>
                    <Row className='justify-content-between head_sec'>
                        <Col xs={'auto'}><h2><span>Top</span> Specialities</h2></Col>
                        <Col xs={'auto'}><button className='theme-btn-outline'>View All Specialities</button></Col>
                    </Row>
                    <Row className='flex-nowrap overflow-x-auto'>
                        <Col>
                            <div className='card border-0 speciality_box_item text-center position-relative'>
                                <img src={require('../assets/gyanecology.png')} className='img-fluid' style={{ maxWidth: '100px', maxHeight: '100px' }} alt='period' />
                                <h6 className='mt-3'>Women & Child Health</h6>
                                <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link>
                            </div>
                        </Col>
                        <Col>
                            <div className='card border-0 speciality_box_item text-center position-relative'>
                                <img src={require('../assets/sexology.png')} className='img-fluid' style={{ maxWidth: '100px', maxHeight: '100px' }} alt='period' />
                                <h6 className='mt-3'>Sexology</h6>
                                <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link>
                            </div>
                        </Col>
                        <Col>
                            <div className='card border-0 speciality_box_item text-center position-relative'>
                                <img src={require('../assets/general-physiciann.png')} className='img-fluid' style={{ maxWidth: '100px', maxHeight: '100px' }} alt='period' />
                                <h6 className='mt-3'>general-physiciann</h6>
                                <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link>
                            </div>
                        </Col>
                        <Col>
                            <div className='card border-0 speciality_box_item text-center position-relative'>
                                <img src={require('../assets/dermatology.png')} className='img-fluid' style={{ maxWidth: '100px', maxHeight: '100px' }} alt='period' />
                                <h6 className='mt-3'>Dermatology</h6>
                                <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link>
                            </div>
                        </Col>
                        <Col>
                            <div className='card border-0 speciality_box_item text-center position-relative'>
                                <img src={require('../assets/psychiatry.png')} className='img-fluid' style={{ maxWidth: '100px', maxHeight: '100px' }} alt='period' />
                                <h6 className='mt-3'>Psychiatry</h6>
                                <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link>
                            </div>
                        </Col>
                        <Col>
                            <div className='card border-0 speciality_box_item text-center position-relative'>
                                <img src={require('../assets/urology.png')} className='img-fluid' style={{ maxWidth: '100px', maxHeight: '100px' }} alt='period' />
                                <h6 className='mt-3'>Urology</h6>
                                <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link>
                            </div>
                        </Col>
                        <Col>
                            <div className='card border-0 speciality_box_item text-center position-relative'>
                                <img src={require('../assets/stomachdigestion.png')} className='img-fluid' style={{ maxWidth: '100px', maxHeight: '100px' }} alt='period' />
                                <h6 className='mt-3'>Stomach & Digestion</h6>
                                <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    )
}
export default Speciality