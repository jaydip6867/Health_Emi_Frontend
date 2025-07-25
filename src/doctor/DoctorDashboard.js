import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import DoctorNav from './DoctorNav';
import { Col, Container, Row } from 'react-bootstrap';
import DoctorSidebar from './DoctorSidebar';

const DoctorDashboard = () => {

  var navigate = useNavigate();

  const [doctor, setdoctor] = useState(null)
  const [token, settoken] = useState(null)

  useEffect(() => {
    var data = JSON.parse(localStorage.getItem('doctordata'));
    if (!data) {
      navigate('/doctor')
    }
    else {
      setdoctor(data.data.Data.doctorData);
      settoken(`Bearer ${data.data.Data.accessToken}`)
    }
  }, [navigate])

  return (
    <>

      <Container fluid className='p-0 panel'>
        <Row className='g-0'>
          <DoctorSidebar />
          <Col xs={12} sm={9} lg={10} className='p-3'>
            <DoctorNav doctorname={doctor && doctor.name} />
            <div className='bg-white rounded p-2'>
              {
              doctor === null ?
                'data loading' :
                <div className='ps-2'>
                  hello doctor {doctor.name}
                </div>
            }
            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default DoctorDashboard
