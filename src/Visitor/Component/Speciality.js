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
                        <Col xs={6} md={4} lg={2}>
                            <div className='card speciality_box_item text-center'>
                                <div className='speciality_img'><img src={require('../assets/SpecialityIcon/heart.png')} className='img-fluid' style={{ maxWidth: '100px', maxHeight: '100px' }} alt='period' /> </div>
                                <h6 className='mt-3'>Cardiology</h6>
                                {/* <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link> */}
                            </div>
                        </Col>
                        <Col xs={6} md={4} lg={2}>
                            <div className='card speciality_box_item text-center'>
                                <div className='speciality_img'><img src={require('../assets/SpecialityIcon/brain.png')} className='img-fluid' style={{ maxWidth: '100px', maxHeight: '100px' }} alt='period' /> </div>
                                <h6 className='mt-3'>Neurology</h6>
                                {/* <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link> */}
                            </div>
                        </Col>
                        <Col xs={6} md={4} lg={2}>
                            <div className='card speciality_box_item text-center'>
                                <div className='speciality_img' ><img src={require('../assets/SpecialityIcon/gynacology.png')} className='img-fluid' style={{ maxWidth: '100px', maxHeight: '100px' }} alt='period' /> </div>
                                <h6 className='mt-3'>Urology</h6>
                                {/* <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link> */}
                            </div>
                        </Col>
                        <Col xs={6} md={4} lg={2}>
                            <div className='card speciality_box_item text-center'>
                                <div className='speciality_img'><img src={require('../assets/SpecialityIcon/bones.png')} className='img-fluid' style={{ maxWidth: '100px', maxHeight: '100px' }} alt='period' /> </div>
                                <h6 className='mt-3'>Orthopedic</h6>
                                {/* <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link> */}
                            </div>
                        </Col>
                        <Col xs={6} md={4} lg={2}>
                            <div className='card speciality_box_item text-center'>
                                <div className='speciality_img'><img src={require('../assets/SpecialityIcon/dentist.png')} className='img-fluid' style={{ maxWidth: '100px', maxHeight: '100px' }} alt='period' /> </div>
                                <h6 className='mt-3'>Dentist</h6>
                                {/* <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link> */}
                            </div>
                        </Col>
                        <Col xs={6} md={4} lg={2}>
                            <div className='card speciality_box_item text-center'>
                                <div className='speciality_img'><img src={require('../assets/SpecialityIcon/orthamology.png')} className='img-fluid' style={{ maxWidth: '100px', maxHeight: '100px' }} alt='period' /> </div>
                                <h6 className='mt-3'>Ophthalmology</h6>
                                {/* <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link> */}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    )
}
export default Speciality