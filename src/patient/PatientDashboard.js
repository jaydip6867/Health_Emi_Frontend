import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import P_Sidebar from './P_Sidebar';
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'
import { Col, Container, Row } from 'react-bootstrap';
import CryptoJS from "crypto-js";

const PatientDashboard = () => {

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
    <NavBar logindata={patient} />
      <Container fluid className='p-0 panel spacer-y'>
        <Row className='g-0'>
          <P_Sidebar />
          <Col xs={12} md={10} className='p-3'>
            {/* <P_nav patientname={patient && patient.name} /> */}
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
      <FooterBar />
    </>
  )
}

export default PatientDashboard