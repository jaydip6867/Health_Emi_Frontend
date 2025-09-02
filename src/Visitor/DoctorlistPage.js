import React, { useState } from 'react'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import Loader from '../Loader'
import { Container } from 'react-bootstrap'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const DoctorlistPage = () => {
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
    const [loading, setloading] = useState(false)
    return (
        <>
            <NavBar logindata={patient} />
            {/* doctor list section */}
            <section className='py-5'>
                <Container>
                    <h3>Doctor List</h3>
                </Container>
            </section>
            <FooterBar />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default DoctorlistPage