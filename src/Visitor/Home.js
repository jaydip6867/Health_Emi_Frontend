import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Container, Form, InputGroup, Row } from 'react-bootstrap'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import AppDownload from './Component/AppDownload'
import Loader from '../Loader'
import { City, Country, State } from 'country-state-city';
import axios from 'axios'

const Home = () => {
  const [loading, setloading] = useState(false)
  const [cities, setCities] = useState([]);
  useEffect(() => {
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
      <NavBar />
      {/* search by city and doctor name or surgery */}

      <section className='pt-5'>
        <Container>

          <Row className='justify-content-center searchbox'>
            <Col xs={12} md={8}>
              <InputGroup className="mb-3">
                <Form.Select className='frm-select city rounded-0' value={searchinputcity} onChange={(e) => setsearchinputcity(e.target.value)} name='city' style={{ 'maxWidth': '150px' }}>
                  {
                    cities && cities.map((city, vi) => {
                      return (<option key={vi} value={city.name} >{city.name}</option>)
                    })
                  }
                </Form.Select>
                <div className='flex-grow-1 position-relative'>
                  <Form.Control placeholder='Hospital, Speciality, Surgery, Procedure' autoComplete="off" value={inputValue} onChange={handleInputChange} onFocus={() => setShowList(true)} onBlur={() => setTimeout(() => setShowList(false), 50)} name='name' />
                  {showList && recordlist.length > 0 && (
                    <ul style={{
                      position: 'absolute',
                      top: '40px',
                      width: '100%',
                      border: '1px solid #ccc',
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
                          {item.type === 'surgery' ? <Link to={`/surgery/${encodeURIComponent(btoa(item.id))}`} className='text-decoration-none d-flex justify-content-between px-3'><span>{item.name}</span> <span className='text-muted'>{item.type}</span> </Link> : <Link to={`/doctorprofile/${encodeURIComponent(btoa(item.id))}`}className='text-decoration-none d-flex justify-content-between px-3'><span>{item.name}</span> <span className='text-muted'>{item.type}</span></Link>}
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
      <section className='py-5'>
        <Container>
          <Row className='justify-content-center g-4 px-5 p-sm-0'>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Card className='h-100 rounded-5 shadow'>
                <div className='rounded-5 overflow-hidden'>
                  <div className='text-center'>
                    <Card.Img variant="top" src={require('../assets/image/doctor1.png')} alt='video consultant' />
                  </div>
                  <Card.Body>
                    <Card.Title>Instant Video Consultation</Card.Title>
                    <Card.Text>
                      <span style={{ 'fontSize': '14px' }}>Connect Within 60 seconds</span>
                      <Link to={'/consult'} className='stretched-link'></Link>
                    </Card.Text>
                  </Card.Body>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Card className='rounded-5  h-100 shadow'>
                <div className='rounded-5 overflow-hidden'>
                  <div className='text-center'>
                    <Card.Img variant="top" src={require('../assets/image/doctor2.png')} alt='find doctor' />
                  </div>
                  <Card.Body>
                    <Card.Title>Find Doctors Near You</Card.Title>
                    <Card.Text>
                      <span style={{ 'fontSize': '14px' }}>Confirmed Appointments</span>
                      <Link to={'/doctorfind'} className='stretched-link'></Link>
                    </Card.Text>
                  </Card.Body>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Card className='rounded-5  h-100 shadow'>
                <div className='rounded-5 overflow-hidden'>
                  <div className='text-center'>
                    <Card.Img variant="top" src={require('../assets/image/doctor3.png')} alt='find surgeries' />
                  </div>
                  <Card.Body>
                    <Card.Title>Surgeries</Card.Title>
                    <Card.Text>
                      <span style={{ 'fontSize': '14px' }}>Safe and trusted surgery centers</span>
                      <Link to={'/surgery'} className='stretched-link'></Link>
                    </Card.Text>
                  </Card.Body>
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
      {/* speciality section */}
      <section className='py-5'>
        <Container>
          <div className='text-center sec_head'>
            <h2>Consult top doctors online for any health concern</h2>
            <p>Private online consultations with verified doctors in all specialists</p>
          </div>
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
      <FooterBar />
      {loading ? <Loader /> : ''}
    </>
  )
}

export default Home