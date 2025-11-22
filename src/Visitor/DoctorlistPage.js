import React, { useState } from 'react'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import Loader from '../Loader'
import { Container } from 'react-bootstrap'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {SECRET_KEY, STORAGE_KEYS } from '../config'

const DoctorlistPage = () => {
    var navigate = useNavigate();

    const [token, settoken] = useState(null)
    const [logdata, setlogdata] = useState(null)

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
    const [loading, setloading] = useState(false)
    return (
        <>
            <NavBar logindata={logdata} />
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