import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Container, Form, InputGroup, Row } from 'react-bootstrap'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import AppDownload from './Component/AppDownload'
import Loader from '../Loader'
import { City, Country, State } from 'country-state-city';
import axios from 'axios'
import { FiArrowUpRight, FiMapPin, FiSearch } from 'react-icons/fi'
import Testimonial from './Component/Testimonial'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';

const Home = () => {

  const SECRET_KEY = "health-emi";
  var navigate = useNavigate();

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

  const [loading, setloading] = useState(false)
  const [cities, setCities] = useState([]);
  useEffect(() => {
    document.title = "Health Easy EMI - Keep Life Healthy"
    getcitiesname();
    getsuggestion();
  }, []);
  function getcitiesname() {
    const india = Country.getCountryByCode("IN");
    const states = State.getStatesOfCountry(india.isoCode);
    const allCities = states.flatMap((state) =>
      City.getCitiesOfState(india.isoCode, state.isoCode)
    );
    setCities(allCities);
  }

  const [searchinputcity, setsearchinputcity] = useState('')
  const [recordlist, setreclist] = useState([])
  const [inputValue, setInputValue] = useState('');
  const [showList, setShowList] = useState(false);
  const getsuggestion = async (n) => {
    setloading(true)
    await axios({
      method: 'post',
      url: 'https://healtheasy-o25g.onrender.com/user/suggestions',
      data: {
        "search": n
      }
    }).then((res) => {
      // console.log('suggestions = ',res.data.Data)
      setreclist(res.data.Data)
    }).catch(function (error) {
      console.log(error);
    }).finally(() => {
      setloading(false)
    });
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowList(true);
    getsuggestion(e.target.value)
  };

  const handleSelectItem = (item) => {
    setInputValue(item);
    setShowList(false);
  };

  return (
    <>
      <NavBar logindata={patient} />
      {/* search by city and doctor name or surgery */}

      <section className='py-5'>
        <Container>

          <Row className='justify-content-center searchbox'>
            <Col xs={12} md={7}>
              <InputGroup>
                <div className='position-relative'>
                  <FiMapPin className='position-absolute icon' />
                  <Form.Select className='frm-select city' value={searchinputcity} onChange={(e) => setsearchinputcity(e.target.value)} onFocus={() => setShowList(true)} name='city' style={{ 'maxWidth': '150px' }}>
                    <option>Location</option>
                    {
                      cities && cities.map((city, vi) => {
                        return (<option key={vi} value={city.name} >{city.name}</option>)
                      })
                    }
                  </Form.Select>
                </div>

                <div className='flex-grow-1 position-relative'>
                  <FiSearch className='position-absolute icon' />
                  <Form.Control placeholder='Search doctor & Surgery here ' autoComplete="off" value={inputValue} onChange={handleInputChange} onFocus={() => setShowList(true)} onBlur={() => setTimeout(() => setShowList(false), 50)} name='name' />
                  {showList && recordlist.length > 0 && (
                    <ul style={{
                      position: 'absolute',
                      top: '40px',
                      width: '100%',
                      border: '1px solid #221a1aff',
                      backgroundColor: 'white',
                      listStyle: 'none',
                      padding: '0',
                      margin: '0',
                      maxHeight: '350px',
                      overflowY: 'auto',
                      zIndex: 10
                    }}>
                      {recordlist.map((item, index) => (
                        <li
                          key={index}
                          onClick={() => handleSelectItem(item.name)}
                          style={{
                            padding: '8px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #eee'
                          }}
                          onMouseDown={(e) => e.preventDefault()} // Prevent input blur before click
                        >
                          {item.type === 'surgery' ? <Link to={`/surgery/${encodeURIComponent(btoa(item.id))}`} className='text-decoration-none d-flex justify-content-between px-3'><span>{item.name}</span> <span className='text-muted'>{item.type}</span> </Link> : <Link to={`/doctorprofile/${encodeURIComponent(btoa(item.id))}`} className='text-decoration-none d-flex justify-content-between px-3'><span>{item.name}</span> <span className='text-muted'>{item.type}</span></Link>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {/* <Button variant="primary" id="button-addon2">
                  Search
                </Button> */}
              </InputGroup>
            </Col>
          </Row>
        </Container>
      </section>
      <section>
        <Container>
          <div className='banner_sec radius-20'>
            <Row className='align-items-center'>
              <Col xs={12} md={6}>
                <div className='pe-5 head_sec'>
                  <h1><span>Book an Appointment</span> <br /> for a consultation</h1>
                  <p>Choose the best deal among 50,000 people and pros by requesting a service!</p>
                  <Button className="banner_btn">Book Appointment</Button>
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
                <Card.Img src={require('./assets/book-ambulance-image.png')} alt='video consultant' />
                <Card.Body>
                  <Card.Title>Book Ambulance <div className='icon_box'><FiArrowUpRight className='text-white' /></div></Card.Title>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <Card className='functionality_box'>
                <Card.Img src={require('./assets/video-consultant-image.png')} alt='video consultant' />
                <Card.Body>
                  <Card.Title>Video Consultant <div className='icon_box'><FiArrowUpRight className='text-white' /></div></Card.Title>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <Card className='functionality_box'>
                <Card.Img src={require('./assets/find-doctor-image.png')} alt='video consultant' />
                <Card.Body>
                  <Card.Title>Find Doctor <div className='icon_box'><FiArrowUpRight className='text-white' /></div></Card.Title>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} lg={3}>
              <Card className='functionality_box'>
                <Card.Img variant="top" src={require('./assets/surgeries-image.png')} alt='video consultant' />
                <Card.Body>
                  <Card.Title>Surgeries <div className='icon_box'><FiArrowUpRight className='text-white' /></div></Card.Title>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      {/* testimonial section */}
      <section className='spacer-t position-relative'>
        <Testimonial />
        {/* <Container>
          <div className='testimonial-bg py-5 radius-20'>
            <Row className='align-items-center'>
              <Col md={7}>
              </Col>
              <Col md={5}>
                <div className='sec_head'>
                  <span className='fs-6'>Testimonial</span>
                  <p className='h2'>Client’s Success <br />Stories</p>
                </div>
              </Col>
            </Row>
          </div>
        </Container> */}
      </section>
      {/* speciality section */}
      <section className='py-5'>
        <Container>
          <Row className='justify-content-between head_sec'>
            <Col xs={'auto'}><h2><span>Top</span> Specialities</h2></Col>
            <Col xs={'auto'}><button className='theme-btn-outline'>View All Specialities</button></Col>
          </Row>
          <Row>
            <Col>
              <div className='card border-0 speciality_box_item text-center'>
                <img src={require('../assets/image/period.png')} className='img-fluid' alt='period' />
                <h6 className='mb-1'>Period doubts or Pregnancy </h6>
                <Link className='stretched-link'>Consult Now</Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center'>
                <img src={require('../assets/image/period.png')} className='img-fluid' alt='period' />
                <h6 className='mb-1'>Period doubts or Pregnancy </h6>
                <Link className='stretched-link'>Consult Now</Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center'>
                <img src={require('../assets/image/period.png')} className='img-fluid' alt='period' />
                <h6 className='mb-1'>Period doubts or Pregnancy </h6>
                <Link className='stretched-link'>Consult Now</Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center'>
                <img src={require('../assets/image/period.png')} className='img-fluid' alt='period' />
                <h6 className='mb-1'>Period doubts or Pregnancy </h6>
                <Link className='stretched-link'>Consult Now</Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center'>
                <img src={require('../assets/image/period.png')} className='img-fluid' alt='period' />
                <h6 className='mb-1'>Period doubts or Pregnancy </h6>
                <Link className='stretched-link'>Consult Now</Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center'>
                <img src={require('../assets/image/period.png')} className='img-fluid' alt='period' />
                <h6 className='mb-1'>Period doubts or Pregnancy </h6>
                <Link className='stretched-link'>Consult Now</Link>
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