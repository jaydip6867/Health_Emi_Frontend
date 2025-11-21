import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import DoctorNav from './DoctorNav';
import { Col, Container, Row } from 'react-bootstrap';
import DoctorSidebar from './DoctorSidebar';
import CryptoJS from "crypto-js";
import { SECRET_KEY, STORAGE_KEYS } from '../config';
import Navbar from '../Visitor/Component/NavBar';
import FooterBar from '../Visitor/Component/FooterBar';


const DoctorDashboard = () => {

  var navigate = useNavigate();

  const [doctor, setdoctor] = useState(null)
  const [token, settoken] = useState(null)

  useEffect(() => {
    var getlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
    }
    if (!data) {
      navigate('/doctor')
    }
    else {
      // var doctorData = {...data.doctorData,logintype: 'doctor'};
      setdoctor(data.doctorData);
      settoken(`Bearer ${data.accessToken}`)
    }
  }, [navigate])

  return (
    <>

      <Navbar logindata={doctor}/>

      <Container className='my-4'>
        <Row className="align-items-start">
          <DoctorSidebar doctor={doctor}/>
          <Col xs={12} md={9}>
            {/* <DoctorNav doctorname={doctor && doctor.name} /> */}
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
      <FooterBar />
    </>
  )
}

export default DoctorDashboard
