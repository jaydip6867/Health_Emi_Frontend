import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Container, Row } from 'react-bootstrap'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import AppDownload from './Component/AppDownload'
import Loader from '../Loader'
import { FiArrowUpRight} from 'react-icons/fi'
import Testimonial from './Component/Testimonial'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import SearchBox from './Component/SearchBox'

const Home = () => {

  const SECRET_KEY = "health-emi";
  var navigate = useNavigate();

  const [loading, setloading] = useState(false)
  const [patient, setpatient] = useState(null)
  const [token, settoken] = useState(null)

  useEffect(() => {
    var getlocaldata = localStorage.getItem('PatientLogin');
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
    }
    if (data) {
      setpatient(data.userData);
      settoken(`Bearer ${data.accessToken}`)
  }
  }, [navigate])

  

  return (
    <>
      <NavBar logindata={patient} />
      {/* search by city and doctor name or surgery */}
        <SearchBox/>
      <section>
        <Container>
          <div className='banner_sec radius-20'>
            <Row className='align-items-center'>
              <Col xs={12} md={6}>
                <div className='pe-5 head_sec'>
                  <h1><span>Book an Appointment</span> <br /> for a consultation</h1>
                  <p>Choose the best deal among 50,000 people and pros by requesting a service!</p>
                  <Button className="banner_btn my-2">Book Appointment</Button>
                  <div className='d-flex gap-5 mt-3 text-dark'>
                    <div><h6>1,00,000+</h6>Doctors</div>
                    <div><h6>20,000+</h6>Surgeries</div>
                  </div>
                </div>
              </Col>
              <Col xs={12} md={6}>
                <img src={require('./assets/banner-img.png')} alt='banner image of health easy emi' />
              </Col>
            </Row>
          </div>
        </Container>
      </section>
      <section className='spacer-y'>
        <Container>
          <Row className='justify-content-center g-4'>
            <Col xs={12} sm={6} lg={3}>
              <Card className='functionality_box'>
                <Card.Img src={require('./assets/find-doctor-image.png')} alt='video consultant' />
                <Card.Body>
                  <Card.Title><Link to='/compare-doctor' className='d-flex align-items-center w-100 justify-content-between'>Compare Doctor <div className='icon_box'><FiArrowUpRight className='text-white' /></div></Link></Card.Title>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <Card className='functionality_box'>
                <Card.Img src={require('./assets/video-consultant-image.png')} alt='video consultant' />
                <Card.Body>
                  <Card.Title><Link to='/consult' className='d-flex align-items-center w-100 justify-content-between'>Video Consultant <div className='icon_box'><FiArrowUpRight className='text-white' /></div></Link></Card.Title>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <Card className='functionality_box'>
                <Card.Img variant="top" src={require('./assets/surgeries-image.png')} alt='video consultant' />
                <Card.Body>
                <Card.Title><Link to='/surgery' className='d-flex align-items-center w-100 justify-content-between'>Surgeries <div className='icon_box'><FiArrowUpRight className='text-white' /></div></Link></Card.Title>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <Card className='functionality_box'>
                <Card.Img src={require('./assets/book-ambulance-image.png')} alt='video consultant' />
                <Card.Body>
                  <Card.Title>Book Ambulance <div className='icon_box'><FiArrowUpRight className='text-white' /></div></Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      {/* testimonial section */}
      <section className='spacer-t position-relative'>
        <Testimonial />
      </section>
      {/* speciality section */}
      <section className='spacer-y'>
        <Container>
          <Row className='justify-content-between head_sec'>
            <Col xs={'auto'}><h2><span>Top</span> Specialities</h2></Col>
            <Col xs={'auto'}><button className='theme-btn-outline'>View All Specialities</button></Col>
          </Row>
          <Row className='flex-nowrap overflow-x-auto'>
            <Col>
              <div className='card border-0 speciality_box_item text-center position-relative'>
                <img src={require('./assets/gyanecology.png')} className='img-fluid' style={{maxWidth:'100px',maxHeight:'100px'}} alt='period' />
                <h6 className='mt-3'>Women & Child Health</h6>
                <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center position-relative'>
                <img src={require('./assets/sexology.png')} className='img-fluid' style={{maxWidth:'100px',maxHeight:'100px'}} alt='period' />
                <h6 className='mt-3'>Sexology</h6>
                <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center position-relative'>
                <img src={require('./assets/general-physiciann.png')} className='img-fluid' style={{maxWidth:'100px',maxHeight:'100px'}} alt='period' />
                <h6 className='mt-3'>general-physiciann</h6>
                <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center position-relative'>
                <img src={require('./assets/dermatology.png')} className='img-fluid' style={{maxWidth:'100px',maxHeight:'100px'}} alt='period' />
                <h6 className='mt-3'>Dermatology</h6>
                <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center position-relative'>
                <img src={require('./assets/psychiatry.png')} className='img-fluid' style={{maxWidth:'100px',maxHeight:'100px'}} alt='period' />
                <h6 className='mt-3'>Psychiatry</h6>
                <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center position-relative'>
                <img src={require('./assets/urology.png')} className='img-fluid' style={{maxWidth:'100px',maxHeight:'100px'}} alt='period' />
                <h6 className='mt-3'>Urology</h6>
                <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center position-relative'>
                <img src={require('./assets/stomachdigestion.png')} className='img-fluid' style={{maxWidth:'100px',maxHeight:'100px'}} alt='period' />
                <h6 className='mt-3'>Stomach & Digestion</h6>
                <Link to={`/surgery/${encodeURIComponent(btoa("68c9ae6e17381fc6ef23e469"))}`} className='stretched-link'></Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      {/* App Download Section  */}
      <AppDownload />
      {/* Popular Search Section */}
      <section className='spacer-y'>
        <Container>
          <h2 className='text-center'>Popular Search in <span className='text-sky-500'>India</span></h2>
          <div className='d-flex justify-content-center mt-4 flex-wrap'>
            {['Electrician Charleroi', 'Handyman Bussels', 'Painter Liege', 'Moving to Brussels', 'Plumber Namur', 'Message Cork', 'Plumber Liege', 'Carpenter Brussels', 'Electrician Charleroi', 'Handyman Bussels', 'Painter Liege', 'Moving to Brussels', 'Plumber Namur', 'Message Cork', 'Plumber Liege', 'Carpenter Brussels', 'Electrician Charleroi', 'Handyman Bussels', 'Painter Liege', 'Moving to Brussels', 'Plumber Namur', 'Message Cork', 'Plumber Liege', 'Carpenter Brussels'].map((v, i) => (
              <a href="" className='px-3 py-2' key={i}>{v}</a>
            ))}
          </div>
        </Container>
      </section>
      <FooterBar />
      {loading ? <Loader /> : ''}
    </>
  )
}

export default Home