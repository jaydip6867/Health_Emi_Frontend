import React, { useEffect } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Nav, Accordion } from 'react-bootstrap'
import { FcBiotech, FcElectricalSensor, FcFinePrint } from 'react-icons/fc'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const About = () => {

    const SECRET_KEY = "health-emi";
      var navigate = useNavigate();
    
      const [patient, setpatient] = useState(null)
      const [token, settoken] = useState(null)
      const [activeTab, setActiveTab] = useState('General Information')
    
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

    useEffect(()=>{
        document.title = "About Health Easy EMI - Our Mission to healthy India"
    },[])
    return (
        <>
            <NavBar logindata={patient} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>About Us</h2>
                </Container>
            </section>
            
            <FooterBar />
        </>
    )
}

export default About
