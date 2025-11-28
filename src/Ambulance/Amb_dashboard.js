import React, { useEffect, useState } from 'react'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import Amb_Sidebar from './Amb_Sidebar';
import Amb_Nav from './Amb_Nav';

const Amb_dashboard = () => {

  const SECRET_KEY = "health-emi";
  var navigate = useNavigate();

  const [ambulance, setambulance] = useState(null)
  const [token, settoken] = useState(null)

  useEffect(() => {
    var getlocaldata = localStorage.getItem('healthambulance');
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
      // console.log(data)
    }
    if (!data) {
      navigate('/ambulance')
    }
    else {
      setambulance(data.ambulanceData);
      // console.log(data.accessToken)
      settoken(`Bearer ${data.accessToken}`)
    }

  }, [navigate])

  return (
    <>
      <Container fluid className='p-0 panel'>
        <Row className='g-0'>
          <Amb_Sidebar />
          <Col xs={12} sm={9} lg={10} className='p-3'>
            <Amb_Nav ambulancename={ambulance && ambulance.fullname} />
            <div className='bg-white rounded p-2'>
              {
                ambulance === null ?
                  'data loading' :
                  <div className='ps-2'>
                    hello Mr. {ambulance.fullname}
                  </div>
              }
            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Amb_dashboard