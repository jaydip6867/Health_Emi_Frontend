import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, Col, Container, Dropdown, DropdownButton, Form, InputGroup, Row } from 'react-bootstrap'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import AppDownload from './Component/AppDownload'
import { City, Country, State } from 'country-state-city';

const Home = () => {
  const [cities, setCities] = useState([]);
  useEffect(() => {
    getcitiesname();
  }, []);
  function getcitiesname() {
    const india = Country.getCountryByCode("IN");
    const states = State.getStatesOfCountry(india.isoCode);
    const allCities = states.flatMap((state) =>
      City.getCitiesOfState(india.isoCode, state.isoCode)
    );
    setCities(allCities);
  }

  const [searchinput,setsearchinput] = useState({city:'',name:''})
  return (
    <>
      <NavBar />
      {/* search by city and doctor name or surgery */}
      
      <section className='pt-5'>
        <Container>
          
          <Row className='justify-content-center searchbox'>
            <Col xs={12} md={8}>
              <InputGroup className="mb-3">
                <Form.Select className='frm-select city rounded-0' value={searchinput.city} onChange={(e)=>setsearchinput({...searchinput,city:e.target.value})} name='city' style={{'maxWidth':'150px'}}>
                  {
                    cities && cities.map((city, vi) => {
                      return (<option key={vi} value={city.name} >{city.name}</option>)
                    })
                  }
                </Form.Select>
                <Form.Control placeholder='Hospital, Speciality, Surgery, Procedure' value={searchinput.name} onChange={(e)=>setsearchinput({...searchinput,name:e.target.value})} name='name' />
                <Button variant="primary" id="button-addon2">
                  Search
                </Button>
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
    </>
  )
}

export default Home