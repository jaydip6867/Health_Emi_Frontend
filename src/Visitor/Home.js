import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Col, Container, Row } from 'react-bootstrap'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import AppDownload from './Component/AppDownload'
import Loader from '../Loader'
import { FiArrowUpRight } from 'react-icons/fi'
import Testimonial from './Component/Testimonial'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import SearchBox from './Component/SearchBox'
import Speciality from './Component/Speciality'
import HomeSlider from './Component/HomeSlider'
import FunctionalitySec from './Component/FunctionalitySec'
import BestDoctor from './Component/BestDoctor'

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

      {/* <section>
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
      </section> */}
      <section className='position-relative'>
        {/* <HomeSlider /> */}
        <img src={require('./assets/main_banner.png')} alt='banner image of health easy emi' />
        <section style={{marginTop: '-22px'}}>
          <SearchBox />
        </section>
      </section>
      <section className='spacer-y'>
        <FunctionalitySec />
      </section>
      {/* speciality section */}
      <Speciality />
      {/* Best Doctor */}
      <BestDoctor />
      {/* testimonial section */}
      <section className='spacer-t position-relative'>
        <Testimonial />
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