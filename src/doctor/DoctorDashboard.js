import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
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

  // useEffect(() => {
  //   if (doctor != null) { toast(`Welcome Doctor ${doctor.name}`, {autoClose: 2000 }) }
  // }, [doctor])

  return (
    <>

      <Container fluid className='p-0'>
        <Row className='g-0'>
          <DoctorSidebar />
          <Col xs={12} sm={10} className='p-3'>
            <DoctorNav doctorname={doctor && doctor.name} />
            <div className='bg-white rounded p-2'>
              {
              doctor === null ?
                'data loading' :
                <div>
                  hello doctor {doctor.name}
                </div>
            }
            </div>
          </Col>
        </Row>
      </Container>

      <ToastContainer />
    </>
  )
}

export default DoctorDashboard
