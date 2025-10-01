import React, { useEffect, useState } from 'react'
import NavBar from './Component/NavBar'
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import Loader from '../Loader'
import FooterBar from './Component/FooterBar'
import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import SearchBox from './Component/SearchBox'
import { MdFilterListAlt } from 'react-icons/md'
import DoctorListComponents from './Component/DoctorListComponent'

const Surgerydoctorlist = () => {
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
    var { id } = useParams()
    const d_id = atob(decodeURIComponent(id))
    const [doctor_list, setdoclist] = useState([])
    // Filters state
    const [genderFilter, setGenderFilter] = useState('')
    const [feeFilter, setFeeFilter] = useState('') // e.g. '0-1000','1000-2000','2000-5000','5000-15000','15000+'
    const [typeFilter, setTypeFilter] = useState('') // consult type
    const [expFilter, setExpFilter] = useState('') // e.g. '0+','1+'...

    useEffect(() => {
        // console.log('id = ', d_id)
        setloading(true)
        if (d_id) {
            getdoctorlist(d_id)
        }
    }, [d_id])

    const getdoctorlist = async (d) => {
        await axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/doctors/list',
            data: {
                surgerytypeid: d
            }
        }).then((res) => {
            setdoclist(res.data.Data)
            console.log('doctor ', res.data.Data)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }

    // Helpers for filters
    const withinFeeRange = (doc, range) => {
        if (!range) return true
        const fee = Number(doc?.consultation_fee ?? doc?.fee ?? doc?.fees)
        if (Number.isNaN(fee)) return false
        if (range === '15000+') return fee >= 15000
        const [min, max] = range.split('-').map(n => Number(n))
        return fee >= min && fee <= max
    }

    const matchesGender = (doc, g) => {
        if (!g) return true
        const val = (doc?.gender || doc?.Gender || '').toString().toLowerCase()
        return val === g.toLowerCase()
    }
    const matchesType = (doc, t) => {
        if (!t) return true
        const val = (doc?.consultType || doc?.consult_type || doc?.consultation_type || '').toString().toLowerCase()
        if (Array.isArray(doc?.consultation_modes)) {
            return doc.consultation_modes.map(v => v.toString().toLowerCase()).includes(t.toLowerCase())
        }
        return val.includes(t.toLowerCase())
    }

    const meetsExperience = (doc, threshold) => {
        if (!threshold) return true
        const raw = doc?.experience ?? doc?.exp_years
        let years = NaN
        if (typeof raw === 'number') {
            years = raw
        } else if (typeof raw === 'string') {
            // Extract the first integer from strings like "4+ years", "10 years", "7-9 years"
            const match = raw.match(/(\d+)/)
            if (match) years = Number(match[1])
        }
        if (Number.isNaN(years)) return false
        const min = Number(String(threshold).replace('+', ''))
        return years >= min
    }

    const filteredDoctors = doctor_list.filter(doc =>
        matchesGender(doc, genderFilter)
        && withinFeeRange(doc, feeFilter)
        && matchesType(doc, typeFilter)
        && meetsExperience(doc, expFilter)
    )

    return (
        <>
            <NavBar logindata={patient} />
            {/* search box */}
            <SearchBox />

            {/* filter by below list */}
            <Container>
                <Row className='justify-content-center align-items-center g-2'>
                    <Col xs='auto'>
                        <Button variant='secondary' className='rounded-pill'><MdFilterListAlt className='fs-5' /> Filter</Button>
                    </Col>
                    <Col xs='auto'>
                        <Form.Select className='rounded-pill outline-secondary' value={genderFilter} onChange={(e)=>setGenderFilter(e.target.value)}>
                            <option value=''>Gender</option>
                            <option value='male'>Male</option>
                            <option value='female'>Female</option>
                            <option value='other'>Other</option>
                        </Form.Select>
                    </Col>
                    <Col xs='auto'>
                        <Form.Select className='rounded-pill outline-secondary' value={feeFilter} onChange={(e)=>setFeeFilter(e.target.value)}>
                            <option value=''>Fees</option>
                            <option value='0-1000'>0 - 1000</option>
                            <option value='1000-2000'>1000 - 2000</option>
                            <option value='2000-5000'>2000 - 5000</option>
                            <option value='5000-15000'>5000 - 15000</option>
                            <option value='15000+'>15000 up</option>
                        </Form.Select>
                    </Col>
                    <Col xs='auto'>
                        <Form.Select className='rounded-pill outline-secondary' value={typeFilter} onChange={(e)=>setTypeFilter(e.target.value)}>
                            <option value=''>Consult Type</option>
                            <option value='clinic_visit'>Clinic Visit</option>
                            <option value='home_visit'>Home Visit</option>
                            <option value='eopd'>EOPD</option>
                        </Form.Select>
                    </Col>
                    <Col xs='auto'>
                        <Form.Select className='rounded-pill outline-secondary' value={expFilter} onChange={(e)=>setExpFilter(e.target.value)}>
                            <option value=''>Experience</option>
                            {['0+', '1+', '2+', '3+', '4+', '5+', '10+', '20+'].map((level) => (
                                <option key={level} value={level}>
                                    {level} years
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                    <Col xs='auto'>
                        <Button variant='outline-secondary' className='rounded-pill' onClick={()=>{setGenderFilter('');setFeeFilter('');setTypeFilter('');setExpFilter('')}}>Clear</Button>
                    </Col>
                </Row>
            </Container>

            {/* doctor list section */}
            <section className='py-5'>
                <Container>
                    <h2 className='mb-5'>{doctor_list && doctor_list[0]?.surgerytypeid?.surgerytypename} Doctors List</h2>
                    {filteredDoctors.length <= 0 ? <Col>No Doctor Found...</Col> : filteredDoctors.map((doc, i) => (
                        <DoctorListComponents details={doc} key={i} />
                    ))}
                </Container>
            </section>
            <FooterBar />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default Surgerydoctorlist