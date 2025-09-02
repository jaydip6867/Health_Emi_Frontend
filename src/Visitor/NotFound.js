import React from 'react'
import { Link } from 'react-router-dom'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import { Container } from 'react-bootstrap'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';

const NotFound = () => {

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
    if (data) {
      setpatient(data.userData);
      settoken(`Bearer ${data.accessToken}`)
  }
  }, [navigate])

  return (
    <>
      <div className='d-flex flex-column min-vh-100'>
        <NavBar logindata={patient} />
        <section className='py-5'>
          <Container>
            <h3 className='text-center py-5'>Page Not Found</h3>
          </Container>
        </section>
        <FooterBar />
      </div>
    </>
  )
}

export default NotFound