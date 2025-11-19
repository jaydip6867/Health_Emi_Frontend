import React, { useEffect, useState } from 'react'
import FooterBar from './Component/FooterBar'
import NavBar from './Component/NavBar'
import { Container } from 'react-bootstrap'
import Loader from '../Loader'
import axios from 'axios'
import CryptoJS from "crypto-js";
import { Link, useNavigate } from 'react-router-dom';
import defaultSurgeryIcon from '../assets/image/consultant.png'
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';

const Surgeries = () => {
    var navigate = useNavigate();

    const [patient, setpatient] = useState(null)
    const [token, settoken] = useState(null)

    useEffect(() => {
        var getlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
        let data = null;
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            try { data = JSON.parse(decrypted) } catch (e) { data = null }
        }
        if (data) {
            setpatient(data.userData);
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])
    const [loading, setloading] = useState(false)
    const [surgerylist, setsurgerylist] = useState([])
    const [allSurgeries, setAllSurgeries] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        setloading(true)
        getsurgerydata()
    }, [])

    // Client-side filter on search term (no API calls)
    useEffect(() => {
        const term = searchTerm.trim().toLowerCase()
        if (!term) {
            setsurgerylist(allSurgeries)
            return
        }
        const filtered = allSurgeries.filter((item) => {
            const name = (item?.name || '').toLowerCase()
            const type = (item?.surgerytypeid?.name || item?.surgerytypeid || '').toString().toLowerCase()
            return name.includes(term) || type.includes(term)
        })
        setsurgerylist(filtered)
    }, [searchTerm, allSurgeries])

    const getsurgerydata = async (q = '') => {
        await axios({
            method: 'post',
            url: `${API_BASE_URL}/user/surgeries/list`,
            data: {
                "search": q
            }
        }).then((res) => {
            const data = res?.data?.Data || [];
            setAllSurgeries(data);
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
                        <div className='mb-3'>
                            <h4 className='mb-0 text-center'>Popular Surgeries</h4>
                        </div>
                        <div className='d-flex justify-content-center'>
                            <input
                                type='text'
                                className='form-control w-75'
                                placeholder='Search surgeries...'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className='d-flex gap-3 text-center mt-4 flex-wrap'>
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
                                })
                            }
                            {
                                !loading && surgerylist.length === 0 && (
                                    <p className='text-muted w-100 text-center m-0'>No surgeries found.</p>
                                )
                            }
                        </div>
                    </div>
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