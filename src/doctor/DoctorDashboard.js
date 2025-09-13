import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import DoctorNav from './DoctorNav';
import { Col, Container, Row } from 'react-bootstrap';
import DoctorSidebar from './DoctorSidebar';
import CryptoJS from "crypto-js";

const DoctorDashboard = () => {
  const SECRET_KEY = "health-emi";

  var navigate = useNavigate();

  const [doctor, setdoctor] = useState(null)
  const [token, settoken] = useState(null)

  useEffect(() => {
    var getlocaldata = localStorage.getItem('healthdoctor');
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
    }
    if (!data) {
      navigate('/doctor')
    }
    else {
      setdoctor(data.doctorData);
      settoken(`Bearer ${data.accessToken}`)
    }
  }, [navigate])

  return (
    <>

      <Container fluid className='p-0 panel'>
        <Row className='g-0'>
          <DoctorSidebar />
          <Col xs={12} md={9} lg={10} className='p-3'>
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
