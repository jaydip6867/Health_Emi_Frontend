import React from 'react'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import { Container } from 'react-bootstrap'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';
import { SECRET_KEY, STORAGE_KEYS } from '../config'

const NotFound = () => {

  var navigate = useNavigate();

  const [logdata, setlogdata] = useState(null)
  const [token, settoken] = useState(null)

  useEffect(() => {
    var pgetlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
    var dgetlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
    if (pgetlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(pgetlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
      setlogdata(data.userData);
    }
    else if (dgetlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(dgetlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
      setlogdata(data.doctorData);
    }
    if (data) {
      settoken(`Bearer ${data.accessToken}`)
    }
  }, [navigate])

  return (
    <>
      <div className='d-flex flex-column min-vh-100'>
        <NavBar logindata={logdata} />
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