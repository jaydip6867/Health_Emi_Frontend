import { Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import HeadTitle from './HeadTitle'

const Speciality = () => {
    return (
        <>
            <section className='spacer-b'>
                <Container>
                    <Row className='justify-content-between head_sec mb-3'>
                        <Col xs={'auto'}><HeadTitle title="Top Specialities" /></Col>
                        <Col xs={'auto'}><Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='btn btn_gradient'>View All Specialities</Link></Col>
                    </Row>
                    <Row className='g-4'>
                        <Col xs={6} md={4} lg>
                            <div className='speciality_box_item text-center'>
                                <div className='speciality_icon'>
                                    <img src={require('../assets/SpecialityIcon/heart.png')} className='img-fluid' alt='Cardiology' />
                                </div>
                                <h6 className='mt-3 fw-bold'>Cardiology</h6>
                            </div>
                        </Col>
                        <Col xs={6} md={4} lg>
                            <div className='speciality_box_item text-center'>
                                <div className='speciality_icon'>
                                    <img src={require('../assets/SpecialityIcon/brain.png')} className='img-fluid' alt='Neurology' />
                                </div>
                                <h6 className='mt-3 fw-bold'>Neurology</h6>
                            </div>
                        </Col>
                        <Col xs={6} md={4} lg>
                            <div className='speciality_box_item text-center'>
                                <div className='speciality_icon'>
                                    <img src={require('../assets/SpecialityIcon/gynacology.png')} className='img-fluid' alt='Urology' />
                                </div>
                                <h6 className='mt-3 fw-bold'>Urology</h6>
                            </div>
                        </Col>
                        <Col xs={6} md={4} lg>
                            <div className='speciality_box_item text-center'>
                                <div className='speciality_icon'>
                                    <img src={require('../assets/SpecialityIcon/bones.png')} className='img-fluid' alt='Orthopedic' />
                                </div>
                                <h6 className='mt-3 fw-bold'>Orthopedic</h6>
                            </div>
                        </Col>
                        <Col xs={6} md={4} lg>
                            <div className='speciality_box_item text-center dentist-speciality'>
                                <div className='speciality_icon'>
                                    <img src={require('../assets/SpecialityIcon/dentist.png')} className='img-fluid' alt='Dentist' />
                                </div>
                                <h6 className='mt-3 fw-bold'>Dentist</h6>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    )
}
export default Speciality