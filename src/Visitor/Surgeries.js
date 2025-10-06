import React, { useEffect, useState } from 'react'
import FooterBar from './Component/FooterBar'
import NavBar from './Component/NavBar'
import { Card, Container, Image } from 'react-bootstrap'
import Loader from '../Loader'
import axios from 'axios'
import CryptoJS from "crypto-js";
import { Link, useNavigate } from 'react-router-dom';
import Speciality from './Component/Speciality'
import defaultSurgeryIcon from '../assets/image/consultant.png'

const Surgeries = () => {
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
    const [surgerylist, setsurgerylist] = useState([])

    useEffect(() => {
        setloading(true)
        getsurgerydata()
    }, [])

    const getsurgerydata = async () => {
        await axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/surgeries/list',
            data: {
                "search": ''
            }
        }).then((res) => {
            const data = res?.data?.Data || [];
            setsurgerylist(data);
        }).catch(function (error) {
            console.log(error);
            setsurgerylist([]);
        }).finally(() => {
            setloading(false)
        });
    }

    return (
        <>
            <NavBar logindata={patient} />
            {/* surgery list section */}
            <section className='py-5'>
                <Container>
                    <div className='text-center sec_head'>
                        <h3>We are experts in Surgical solutions for 50+ ailments.</h3>
                    </div>
                    {/* <Speciality /> */}
                    <div className='rounded-4 border border-secondary-subtle p-4'>
                        <h5>Popular Surgeries</h5>
                        <div className='d-flex gap-4 text-center mt-4 flex-wrap'>
                            {
                                surgerylist.map((item) => {
                                    const name = item?.name;
                                    const img = item?.surgery_photo;
                                    // Surgerydoctorlist expects a surgerytypeid in the API body.
                                    // Prefer nested id if available, fallback to string field or surgery id to avoid crashes.
                                    const typeId = item?.surgerytypeid?._id || item?.surgerytypeid || item?._id;
                                    return (
                                        <Link to={`/surgery/${encodeURIComponent(btoa(typeId))}`} className='surgery_list_box' key={item?._id}>
                                            <img
                                                src={img || defaultSurgeryIcon}
                                                alt={name}
                                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultSurgeryIcon; }}
                                            />
                                            <p className='mt-2 fw-semibold text-capitalize'>{name}</p>
                                        </Link>
                                    )
                                })}
                        </div>
                    </div>
                    <Card className='border-0 py-3 border-bottom w-50'>
                        <div className="d-flex align-items-center">
                            <div>
                                <Image src={require('../assets/image/Sergeon.png')} className='benefit_img' alt='benefit sergeon' />
                            </div>
                            <Card.Body className="px-2 py-0">
                                {/* Doctor Name & Favorite Icon */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <Card.Title className="mb-1 fs-6 fw-bold">Expert surgeons</Card.Title>
                                </div>

                                {/* Specialty */}
                                <Card.Text className="mb-0 text-secondary" style={{ fontSize: '0.9rem' }}>
                                    Qualified & Experienced Specialists
                                </Card.Text>

                            </Card.Body>
                        </div>
                    </Card>
                    <Card className='border-0 py-2 border-bottom w-50'>
                        <div className="d-flex align-items-center">
                            <div>
                                <Image src={require('../assets/image/Sergeon.png')} className='benefit_img' alt='benefit sergeon' />
                            </div>
                            <Card.Body className="px-2 py-0">
                                {/* Doctor Name & Favorite Icon */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <Card.Title className="mb-1 fs-6 fw-bold">Expert surgeons</Card.Title>
                                </div>

                                {/* Specialty */}
                                <Card.Text className="mb-0 text-secondary" style={{ fontSize: '0.9rem' }}>
                                    Qualified & Experienced Specialists
                                </Card.Text>

                            </Card.Body>
                        </div>
                    </Card>
                    <Card className='border-0 py-2 border-bottom w-50'>
                        <div className="d-flex align-items-center">
                            <div>
                                <Image src={require('../assets/image/Sergeon.png')} className='benefit_img' alt='benefit sergeon' />
                            </div>
                            <Card.Body className="px-2 py-0">
                                {/* Doctor Name & Favorite Icon */}
                                <div className="d-flex justify-content-between align-items-center">
                                    <Card.Title className="mb-1 fs-6 fw-bold">Expert surgeons</Card.Title>
                                </div>

                                {/* Specialty */}
                                <Card.Text className="mb-0 text-secondary" style={{ fontSize: '0.9rem' }}>
                                    Qualified & Experienced Specialists
                                </Card.Text>

                            </Card.Body>
                        </div>
                    </Card>
                </Container>
            </section>
            {/* benefit & explained */}
            <section className='py-5 border-top border-5'>
                <Container>
                    <div>
                        <h4>Know more about Health Care</h4>
                        <p className='text-muted fs-6 my-4'>Health Care is your partner in your journey to improve the health of yourself, your family members and friends. Practo Care believes in providing affordable access to quality healthcare and helps patients pick the best surgery option for their health condition. Practo Care operates 70 clinics, along with 100 partner hospitals and 200 surgeons to provide the best care for its customers.</p>
                        <p className='text-muted fs-6'>Practo Care provides best-in-class treatment for common ailments such as Piles, Kidney Stones, Hernia, Anal Fissures and other troubling health conditions. Practo Care also helps secure easy financing including no cost EMI options and also helps handle insurance claims and other documentation during the entire journey till post-surgery recovery.</p>
                    </div>
                    <div className='mt-5'>
                        <h4>You can get hassle-free treatment for following ailments</h4>
                    </div>
                </Container>
            </section>
            <FooterBar />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default Surgeries