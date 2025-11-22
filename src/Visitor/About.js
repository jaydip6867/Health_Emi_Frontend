import React, { useEffect } from 'react'
import { Container } from 'react-bootstrap'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {SECRET_KEY, STORAGE_KEYS } from '../config'

const About = () => {

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

    useEffect(() => {
        document.title = "About Health Easy EMI - Our Mission to healthy India"
    }, [])
return (
    <>
        <NavBar logindata={logdata} />
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
