import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import P_Sidebar from './P_Sidebar';
import P_nav from './P_nav';
import { Col, Container, Row } from 'react-bootstrap';

const PatientDashboard = () => {

  var navigate = useNavigate();

  const [patient, setpatient] = useState(null)
  const [token, settoken] = useState(null)

  useEffect(() => {
    var data = JSON.parse(localStorage.getItem('PatientLogin'));
    if (!data) {
      navigate('/patient')
    }
    else {
      setpatient(data.userData);
      settoken(`Bearer ${data.accessToken}`)
    }
  }, [navigate])

  return (
    <>
      <Container fluid className='p-0'>
        <Row className='g-0'>
          <P_Sidebar />
          <Col xs={12} sm={9} lg={10} className='p-3'>
            <P_nav patientname={patient && patient.name} />
            <div className='bg-white rounded p-2'>
              {
              patient === null ?
                'data loading' :
                <div>
                  hello {patient.name}
                </div>
            }
            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default PatientDashboard