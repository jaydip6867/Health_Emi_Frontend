import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Col, Container, Row } from 'react-bootstrap'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import AppDownload from './Component/AppDownload'
import Loader from '../Loader'
import Testimonial from './Component/Testimonial'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import SearchBox from './Component/SearchBox'
import Speciality from './Component/Speciality'
import FunctionalitySec from './Component/FunctionalitySec'
import BestDoctor from './Component/BestDoctor'
import HeadTitle from './Component/HeadTitle'

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
        <section style={{ marginTop: '-22px' }}>
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
      {/* how it work section */}
      <section className='how_it_work_sec my-5'>
        <Container>
          <Row>
            <Col xs={12} lg={5} className='align-self-end order-last order-lg-first'>
              <img src={require('./assets/step_doctor.png')} className='mx-auto w-sm-50' alt='how it work image of health easy emi' />
            </Col>
            <Col xs={12} lg={7}>
              <div className='spacer-y'>
                <div className='head_sec mb-4'>
                  <span className='head_sec_subtitle fw-medium'>how it works</span>
                  <div className='d-flex pt-2'><HeadTitle title="4 easy steps to get your solution" /></div>
                </div>
                <Row>
                  <Col xs={12} md={6}>
                    <div className='d-flex align-items-start step_box gap-3'>
                      <div><img src={require('./assets/icon/step1.png')} alt='step 1 image of health easy emi' /></div>
                      <div>
                        <h6>Search Doctor</h6>
                        <p>Search for a doctor based on specialization, location, or availability.</p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className='d-flex align-items-start step_box gap-3'>
                      <div><img src={require('./assets/icon/step2.png')} alt='step 1 image of health easy emi' /></div>
                      <div>
                        <h6>Check Doctor Profile</h6>
                        <p>Explore detailed doctor profiles on our platform to make informed healthcare decisions.</p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className='d-flex align-items-start step_box gap-3'>
                      <div><img src={require('./assets/icon/step3.png')} alt='step 1 image of health easy emi' /></div>
                      <div>
                        <h6>Schedule Appointment</h6>
                        <p>After choose your preferred doctor, select a convenient time slot, & confirm your appointment.</p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className='d-flex align-items-start step_box gap-3'>
                      <div><img src={require('./assets/icon/step4.png')} alt='step 1 image of health easy emi' /></div>
                      <div>
                        <h6>Get Your Solution</h6>
                        <p>Discuss your health concerns with the doctor and receive personalized advice & solution.</p>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Article section */}
      <section className='spacer-y'>
        <Container>
          <h2 className='head_sec'><HeadTitle title="Latest Articles" /></h2>
          <Row className='g-4 mt-4'>
            <Col xs={12} md={6}>
              <div>
                <Row className='article_box rounded g-0 p-3'>
                  <Col xs={12} md={4}>
                    <img src={require('./assets/article1.png')} alt='article image of health easy emi' className='rounded' />
                  </Col>
                  <Col xs={12} md={8}>
                    <div className='ps-3'>
                      <p>John Doe <span>13 Aug, 2023</span></p>
                      <h5>Navigating Telehealth: A Guide to Virtual Healthcare Visits</h5>
                      <p>Explore the benefits & challenges of virtual healthcare appointments, along with tips for making good health.</p>
                      <Link className='btn_gradient'>Read More</Link>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div>
                <Row className='article_box rounded g-0 p-3'>
                  <Col xs={12} md={4}>
                    <img src={require('./assets/article2.png')} alt='article image of health easy emi' className='rounded' />
                  </Col>
                  <Col xs={12} md={8}>
                    <div className='ps-3'>
                      <p>John Doe <span>13 Aug, 2023</span></p>
                      <h5>Navigating Telehealth: A Guide to Virtual Healthcare Visits</h5>
                      <p>Explore the benefits & challenges of virtual healthcare appointments, along with tips for making good health.</p>
                      <Link className='btn_gradient'>Read More</Link>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div>
                <Row className='article_box rounded g-0 p-3'>
                  <Col xs={12} md={4}>
                    <img src={require('./assets/article3.png')} alt='article image of health easy emi' className='rounded' />
                  </Col>
                  <Col xs={12} md={8}>
                    <div className='ps-3'>
                      <p>John Doe <span>13 Aug, 2023</span></p>
                      <h5>Navigating Telehealth: A Guide to Virtual Healthcare Visits</h5>
                      <p>Explore the benefits & challenges of virtual healthcare appointments, along with tips for making good health.</p>
                      <Link className='btn_gradient'>Read More</Link>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col xs={12} md={6}>
              <div>
                <Row className='article_box rounded g-0 p-3'>
                  <Col xs={12} md={4}>
                    <img src={require('./assets/article4.png')} alt='article image of health easy emi' className='rounded' />
                  </Col>
                  <Col xs={12} md={8}>
                    <div className='ps-3'>
                      <p>John Doe <span>13 Aug, 2023</span></p>
                      <h5>Navigating Telehealth: A Guide to Virtual Healthcare Visits</h5>
                      <p>Explore the benefits & challenges of virtual healthcare appointments, along with tips for making good health.</p>
                      <Link className='btn_gradient'>Read More</Link>
                    </div>
                  </Col>
                </Row>
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