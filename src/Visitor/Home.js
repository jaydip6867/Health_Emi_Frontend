import React from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../NavBar'
import { Button, Card, Col, Container, Dropdown, DropdownButton, Form, InputGroup, Row } from 'react-bootstrap'
import FooterBar from '../FooterBar'
import { FaGooglePlay } from 'react-icons/fa'

const Home = () => {
  return (
    <>
      <NavBar />
      {/* search by city and doctor name or surgery */}
      <section className='pt-5'>
        <Container>
          <Row className='justify-content-center searchbox'>
            <Col xs={12} md={8}>
              <InputGroup className="mb-3">
                <DropdownButton
                  variant="outline-secondary"
                  title="Select City"
                  id="input-group-dropdown-1"
                >
                  <Dropdown.Item href="#">Action</Dropdown.Item>
                  <Dropdown.Item href="#">Another action</Dropdown.Item>
                  <Dropdown.Item href="#">Something else here</Dropdown.Item>
                </DropdownButton>
                <Form.Control placeholder='Hospital, Speciality, Surgery, Procedure' />
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
                    <Card.Img variant="top" src={require('../assets/image/doctor1.png')} />
                  </div>
                  <Card.Body>
                    <Card.Title>Instant Video Consultation</Card.Title>
                    <Card.Text>
                      <span style={{ 'fontSize': '14px' }}>Connect Within 60 seconds</span>
                      <Link className='stretched-link'></Link>
                    </Card.Text>
                  </Card.Body>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Card className='rounded-5  h-100 shadow'>
                <div className='rounded-5 overflow-hidden'>
                  <div className='text-center'>
                    <Card.Img variant="top" src={require('../assets/image/doctor2.png')} />
                  </div>
                  <Card.Body>
                    <Card.Title>Find Doctors Near You</Card.Title>
                    <Card.Text>
                      <span style={{ 'fontSize': '14px' }}>Confirmed Appointments</span>
                      <Link className='stretched-link'></Link>
                    </Card.Text>
                  </Card.Body>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Card className='rounded-5  h-100 shadow'>
                <div className='rounded-5 overflow-hidden'>
                  <div className='text-center'>
                    <Card.Img variant="top" src={require('../assets/image/doctor3.png')} />
                  </div>
                  <Card.Body>
                    <Card.Title>Surgeries</Card.Title>
                    <Card.Text>
                      <span style={{ 'fontSize': '14px' }}>Safe and trusted surgery centers</span>
                      <Link className='stretched-link'></Link>
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
                <img src={require('../assets/image/period.png')} className='img-fluid' />
                <h6 className='mb-1'>Period doubts or Pregnancy </h6>
                <Link className='stretched-link'>Consult Now</Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center'>
                <img src={require('../assets/image/period.png')} className='img-fluid' />
                <h6 className='mb-1'>Period doubts or Pregnancy </h6>
                <Link className='stretched-link'>Consult Now</Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center'>
                <img src={require('../assets/image/period.png')} className='img-fluid' />
                <h6 className='mb-1'>Period doubts or Pregnancy </h6>
                <Link className='stretched-link'>Consult Now</Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center'>
                <img src={require('../assets/image/period.png')} className='img-fluid' />
                <h6 className='mb-1'>Period doubts or Pregnancy </h6>
                <Link className='stretched-link'>Consult Now</Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center'>
                <img src={require('../assets/image/period.png')} className='img-fluid' />
                <h6 className='mb-1'>Period doubts or Pregnancy </h6>
                <Link className='stretched-link'>Consult Now</Link>
              </div>
            </Col>
            <Col>
              <div className='card border-0 speciality_box_item text-center'>
                <img src={require('../assets/image/period.png')} className='img-fluid' />
                <h6 className='mb-1'>Period doubts or Pregnancy </h6>
                <Link className='stretched-link'>Consult Now</Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      {/* download app section */}
      <section >
        <Container className='border-top border-secondary-subtle py-5'>
          <Row className='align-items-center justify-content-center g-4'>
            <Col xs={12} sm={6} md={5}>
              <div className='text-center text-sm-start'>
                <img src={require('../assets/image/call-patient-half.png')} className="img-fluid shadow-img" />
              </div>
            </Col>
            <Col xs={12} sm={6} md={5}>
              <h2>Download the Health app</h2>
              <p className='py-4'>
                Access video consultation with India’s top doctors on the Practo app. Connect with doctors online, available 24/7, from the comfort of your home.
              </p>
              <div>
                <p className='text-secondary'>Get the link to download the app</p>
                <div className='app_btn d-flex'>
                  <a className='btn btn-dark'><FaGooglePlay /> Google Play</a>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
      
      <FooterBar />
    </>
  )
}

export default Home