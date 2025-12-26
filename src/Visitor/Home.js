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
import HomeSlider from './Component/HomeSlider'
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config'
import FadeIn from "../components/FadeIn";
import axios from 'axios'
import BlogBox from './Component/BlogBox'

const Home = () => {

  var navigate = useNavigate();

  const [loading, setloading] = useState(false)
  const [token, settoken] = useState(null)
  const [logdata, setlogdata] = useState(null)

  useEffect(() => {
    var pgetlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
    var dgetlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
    if (pgetlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(pgetlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
      setlogdata(data.userData);
    }
    else if (dgetlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(dgetlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
      setlogdata(data.doctorData);
    }
    if (data) {
      settoken(`Bearer ${data.accessToken}`)
    }
    getblog()
  }, [navigate])

  const [bloglist, setbloglist] = useState(null)

  function getblog() {
    setloading(true)
    axios({
      method: 'post',
      url: `${API_BASE_URL}/user/blogs`,
      headers: {
        Authorization: token,
      },
      data: {
        "page": 1,
        "limit": 4,
        "search": "",
      }
    }).then((res) => {
      setbloglist(res.data.Data.docs)
    }).catch(function (error) {
      // console.log(error);
    }).finally(() => {
      setloading(false)
    });
  }

  return (
    <>
      <NavBar logindata={logdata} />
      {/* search by city and doctor name or surgery */}
      <section>
        <HomeSlider />
        <section style={{ marginTop: "-32px" }}>
          <SearchBox />
        </section>
      </section>
      <section className='spacer-y'>
        <FadeIn delay={0}>
          <FunctionalitySec />
        </FadeIn>
      </section>
      {/* Top Specialities */}
      <FadeIn delay={0}>
        <Speciality />
      </FadeIn>
      {/* Best Doctor */}
      <FadeIn delay={0}>
        <BestDoctor />
      </FadeIn>
      {/* testimonial section */}
      <section className='spacer-t position-relative'>
        <FadeIn delay={0}>
          <Testimonial />
        </FadeIn>
      </section>
      {/* how it work section */}
      <section className='how_it_work_sec my-5'>
        <Container>
          <Row>
            <Col xs={12} lg={5} className='align-self-end order-last order-lg-first'>
              <FadeIn delay={0}>
                <img src={require('./assets/step_doctor.png')} className='mx-auto w-sm-50' alt='how it work image of health easy emi' />
              </FadeIn>
            </Col>
            <Col xs={12} lg={7}>
              <div className='spacer-y'>
                <div className='head_sec mb-4'>
                  <span className='head_sec_subtitle fw-medium'>how it works</span>
                  <div className='d-flex pt-2'><HeadTitle title="4 easy steps to get your solution" /></div>
                </div>
                <Row>
                  <Col xs={12} md={6}>
                    <FadeIn delay={0}>
                      <div className='d-flex align-items-start step_box gap-3'>
                        <div><img src={require('./assets/icon/step1.png')} alt='step 1 image of health easy emi' /></div>
                        <div>
                          <h6>Search Doctor</h6>
                          <p>Search for a doctor based on specialization, location, or availability.</p>
                        </div>
                      </div>
                    </FadeIn>
                  </Col>
                  <Col xs={12} md={6}>
                    <FadeIn delay={200}>
                      <div className='d-flex align-items-start step_box gap-3'>
                        <div><img src={require('./assets/icon/step2.png')} alt='step 1 image of health easy emi' /></div>
                        <div>
                          <h6>Check Doctor Profile</h6>
                          <p>Explore detailed doctor profiles on our platform to make informed healthcare decisions.</p>
                        </div>
                      </div>
                    </FadeIn>
                  </Col>
                  <Col xs={12} md={6}>
                    <FadeIn delay={400}>
                      <div className='d-flex align-items-start step_box gap-3'>
                        <div><img src={require('./assets/icon/step3.png')} alt='step 1 image of health easy emi' /></div>
                        <div>
                          <h6>Schedule Appointment</h6>
                          <p>After choose your preferred doctor, select a convenient time slot, & confirm your appointment.</p>
                        </div>
                      </div>
                    </FadeIn>
                  </Col>
                  <Col xs={12} md={6}>
                    <FadeIn delay={600}>
                      <div className='d-flex align-items-start step_box gap-3'>
                        <div><img src={require('./assets/icon/step4.png')} alt='step 1 image of health easy emi' /></div>
                        <div>
                          <h6>Get Your Solution</h6>
                          <p>Discuss your health concerns with the doctor and receive personalized advice & solution.</p>
                        </div>
                      </div>
                    </FadeIn>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Blog section */}
      <section className='spacer-y'>
        <Container>
          <h2 className='head_sec mb-5'><HeadTitle title="Latest Articles" /></h2>
          <Row>
            {bloglist?.map((item, index) => (
              <BlogBox item={item} index={index} key={index} />
            ))}
          </Row>
        </Container>
      </section>
      
      {/* App Download Section  */}
      <FadeIn delay={200}>
        <AppDownload />
      </FadeIn>

      <FooterBar />
      {loading ? <Loader /> : ''}
    </>
  )
}

export default Home