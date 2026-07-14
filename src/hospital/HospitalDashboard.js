import React, { useEffect, useState } from 'react'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import HospitalSidebar from './HospitalSidebar';

const HospitalDashboard = () => {

  const SECRET_KEY = "health-emi";
  var navigate = useNavigate();

  const [hospital, sethospital] = useState(null)
  const [token, settoken] = useState(null)

  useEffect(() => {
    var getlocaldata = localStorage.getItem(STORAGE_KEYS.HOSPITAL);
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
    }
    if (!data) {
      navigate('/hospital')
    }
    else {
      sethospital(data.hospitalData);
      settoken(`Bearer ${data.accessToken}`)
    }

  }, [navigate])

  return (
    <>
      <Container fluid className='p-0'>
        <Row className='g-0'>
          <HospitalSidebar hospital={hospital} />
          <Col xs={12} sm={9} className='p-3'>
            {/* <HospitalNav hospitalname={hospital && hospital.fullname} /> */}
            <div className='bg-white rounded p-2'>
              {
                hospital === null ?
                  'data loading' :
                  <div className='ps-2'>
                    hello Mr. {hospital.hospitalname}
                  </div>
              }
            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default HospitalDashboard