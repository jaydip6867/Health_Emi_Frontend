import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import AppDownload from './Component/AppDownload'
import { Col, Container, Row } from 'react-bootstrap'
import { FcCheckmark } from 'react-icons/fc'
import { Link } from 'react-router-dom'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {SECRET_KEY, STORAGE_KEYS } from '../config'

const Doctors = () => {
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
            <NavBar logindata={logdata} />
            {/* instant Appointment section */}
            <section className='py-5'>
                <Container>
                    <Row>
                        <Col xs={12} md={6}>
                            <div className='inst_appointment_box'>
                                <h2 className='fs-1'>Instant appointment with doctors.<b>Guaranteed.</b></h2>
                                <div className='chklist fs-5 my-4 text-muted'>
                                    <p className='mb-2'><FcCheckmark /><b className='ms-2'>100,000 </b>Verified doctors</p>
                                    <p className='mb-2'><FcCheckmark /><b className='ms-2'>3M+ </b>Patient recommendations</p>
                                    <p className='mb-2'><FcCheckmark /><b className='ms-2'>25M </b>Patients/year</p>
                                </div>
                                <Link className="btn btn-primary rounded-0">Find me the right doctor</Link>
                            </div>
                        </Col>
                        <Col xs={12} md={6}>
                            <div className='w-50 mx-auto shadow-img'>
                                <img src={require('../assets/image/Appoinment-Booking.png')} className='img-fluid' alt='appointment booking' />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
            {/* App Download Section */}
            <AppDownload />
            <FooterBar />
        </>
    )
}

export default Doctors