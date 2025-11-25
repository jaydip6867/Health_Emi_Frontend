import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import DoctorNav from './DoctorNav';
import { Col, Container, Row } from 'react-bootstrap';
import DoctorSidebar from './DoctorSidebar';
import CryptoJS from "crypto-js";
import { SECRET_KEY, STORAGE_KEYS } from '../config';
import Navbar from '../Visitor/Component/NavBar';
import FooterBar from '../Visitor/Component/FooterBar';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { FiClipboard } from 'react-icons/fi';

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
    getcount();
  }, [navigate])

  const [count, setcount] = useState(null)
  
  const getcount = () => {  
    axios({
      method: 'get',
      url: `${API_BASE_URL}/doctor/count`,
      headers: {
        Authorization: token
      }
    }).then((res) => {
      // console.log('count = ', res.data.Data);
      setcount(res.data.Data)
    }).catch(function (error) {
      console.log(error);
    });
  }

  return (
    <>

      <Navbar logindata={doctor} />

      <Container className='my-4'>
        <Row className="align-items-start">
          <DoctorSidebar doctor={doctor} />
          <Col xs={12} md={9}>
            <div className='bg-white rounded dashboard-card p-2'>
              <Col xs={12}>
                <Row>
                  <Col xs={6} md={3}>
                    <div className='bg-light rounded h-100 p-3 d-flex align-items-center gap-3 shadow'>
                      <FiClipboard />
                      <div className='d-flex flex-column'>
                        <small>Today Consultation</small>
                        <span className='fw-bold text-dark'>{count?.todayConsultationsAppointment}</span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className='bg-light rounded h-100 p-3 d-flex align-items-center gap-3 shadow'>
                      <FiClipboard />
                      <div className='d-flex flex-column'>
                        <small>Today EOPD</small>
                        <span className='fw-bold text-dark'>{count?.todayEOPDAppointment}</span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className='bg-light rounded h-100 p-3 d-flex align-items-center gap-3 shadow'>
                      <FiClipboard />
                      <div className='d-flex flex-column'>
                        <small>Today Surgery</small>
                        <span className='fw-bold text-dark'>{count?.todaySurgeryAppointment}</span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className='bg-light rounded h-100 p-3 d-flex align-items-center gap-3 shadow'>
                      <FiClipboard />
                      <div className='d-flex flex-column'>
                        <small>Today Earning</small>
                        <span className='fw-bold text-dark'>{count?.todayEarnings}</span>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </div>
          </Col>
        </Row>
      </Container>
      <FooterBar />
    </>
  )
}

export default DoctorDashboard
