import React, { useEffect, useRef, useState } from 'react'
import NavBar from './Component/NavBar'
import { Button, Col, Container, Row } from 'react-bootstrap'
import Loader from '../Loader'
import FooterBar from './Component/FooterBar'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import SearchBox from './Component/SearchBox'
import { MdFilterListAlt } from 'react-icons/md'
import DoctorListComponents from './Component/DoctorListComponent'
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';

const Surgerydoctorlist = () => {
    var navigate = useNavigate();


    const [patient, setpatient] = useState(null)
    const [token, settoken] = useState(null)

    useEffect(() => {
        var getlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
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
    const d_id = id ? atob(decodeURIComponent(id)) : null;
    const [doctor_list, setdoclist] = useState([])
    // Filters state
    const [genderFilter, setGenderFilter] = useState('')
    const [feeFilter, setFeeFilter] = useState('') // e.g. '0-1000','1000-2000','2000-5000','5000-15000','15000+'
    const [typeFilter, setTypeFilter] = useState('') // consult type
    const [expFilter, setExpFilter] = useState('') // e.g. '0+','1+'...

    // Lightweight custom dropdown (no external deps)
    const CustomDropdown = ({ options, value, onChange, placeholder = 'Select', minWidth = 180 }) => {
        const [open, setOpen] = useState(false)
        const ref = useRef(null)

        useEffect(() => {
            const onDocClick = (e) => {
                if (ref.current && !ref.current.contains(e.target)) setOpen(false)
            }
            document.addEventListener('mousedown', onDocClick)
            return () => document.removeEventListener('mousedown', onDocClick)
        }, [])

        const selected = options.find(o => o.value === value)

        return (
            <div ref={ref} style={{ position: 'relative', minWidth }}>
                <button
                    type='button'
                    className='btn btn-light border rounded-pill d-flex align-items-center justify-content-between w-100'
                    onClick={() => setOpen(o => !o)}
                    style={{
                        padding: '8px 14px',
                        color: selected ? '#212529' : '#6c757d',
                        backgroundColor: '#fff'
                    }}
                >
                    <span className='text-truncate' style={{ maxWidth: minWidth - 40 }}>
                        {selected ? selected.label : placeholder}
                    </span>
                    <span className='ms-2' style={{ lineHeight: 0 }}>▾</span>
                </button>

                {open && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 1050,
                            marginTop: 6,
                            background: '#fff',
                            borderRadius: 14,
                            boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
                            border: '1px solid rgba(0,0,0,0.06)'
                        }}
                    >
                        <div style={{ maxHeight: 260, overflowY: 'auto', padding: '6px 4px' }}>
                            {options.map(opt => (
                                <div
                                    key={opt.value}
                                    role='button'
                                    onClick={() => { onChange(opt.value); setOpen(false) }}
                                    style={{
                                        margin: '6px 8px',
                                        padding: '10px 12px',
                                        borderRadius: 12,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: (value === opt.value) ? '#f1f6ff' : '#fff',
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fbff' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = (value === opt.value) ? '#f1f6ff' : '#fff' }}
                                >
                                    <span style={{ color: '#212529' }}>{opt.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Option lists for filters
    const genderOptions = [
        { value: '', label: 'Gender' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
    ]
    const typeOptions = [
        { value: '', label: 'Consult Type' },
        { value: 'clinic_visit', label: 'Clinic Visit' },
        { value: 'home_visit', label: 'Home Visit' },
        { value: 'eopd', label: 'EOPD' },
    ]
    const feeOptions = [
        { value: '', label: 'Fees' },
        { value: '0-1000', label: '0 - 1000' },
        { value: '1000-2000', label: '1000 - 2000' },
        { value: '2000-5000', label: '2000 - 5000' },
        { value: '5000-15000', label: '5000 - 15000' },
        { value: '15000+', label: '15000 up' },
    ]
    const expOptions = ['0+', '1+', '2+', '3+', '4+', '5+', '10+', '20+'].map(level => ({ value: level, label: `${level} years` }))

    useEffect(() => {
        setloading(true);
        // Always call getdoctorlist, it will handle both cases
        getdoctorlist(d_id);
    }, [d_id]);  // Add d_id to dependency array to refetch when it changes

    const getdoctorlist = async (d) => {
        console.log('Fetching doctors with ID:', d);
        try {
            const endpoint = d
                ? `${API_BASE_URL}/user/doctors/list`  // When specific surgery ID is provided
                : `${API_BASE_URL}/user/doctors`;     // When no ID, get all doctors

            const requestData = d
                ? { surgeryname: d }  // For specific surgery
                : {                  // For all doctors with pagination
                    page: 1,
                    limit: 100,       // Increased limit to get more results
                    search: "",
                    surgerytypeid: "",
                    //   surgeryname: ""
                };

            const response = await axios({
                method: 'post',
                url: endpoint,
                headers: token ? { Authorization: token } : {},
                data: requestData
            });
            // console.log('API Response:', response.data);
            // If ID is provided, use response.data.Data
            // If no ID, use response.data.Data.docs
            const doctorsData = d ? response.data.Data : (response.data.Data?.docs || []);
            setdoclist(Array.isArray(doctorsData) ? doctorsData : []);
        } catch (error) {
            // console.error('Error fetching doctors list:', error);
            setdoclist([]);
        } finally {
            setloading(false);
        }
        // await axios({
        //     method: 'post',
        //     url: `${API_BASE_URL}/user/doctors/list`,
        //     data: {
        //         surgeryname: d || ''
        //     }
        // }).then((res) => {
        //     setdoclist(res.data.Data)
        // }).catch(function (error) {
        //     console.error('Error fetching doctors list:', error);
        //     setdoclist([]); // Set empty array on error
        // }).finally(() => {
        //     setloading(false)
        // });
    }

    // Helpers for filters
    const getConsultPrice = (doc, type) => {
        const cd = doc?.consultationsDetails || doc?.consultations_details
        if (!cd) return undefined
        const map = {
            clinic_visit: 'clinic_visit_price',
            home_visit: 'home_visit_price',
            eopd: 'eopd_price',
        }
        const key = map[type]
        if (!key) return undefined
        const value = Number(cd[key])
        return Number.isNaN(value) ? undefined : value
    }

    // Collect all available consult prices for a doctor as numbers
    const getAllConsultPrices = (doc) => {
        const prices = []
        const cd = doc?.consultationsDetails || doc?.consultations_details
        if (cd) {
            ;['clinic_visit_price', 'home_visit_price', 'eopd_price']
                .forEach(k => {
                    const v = Number(cd[k])
                    if (!Number.isNaN(v)) prices.push(v)
                })
        }
        const legacy = Number(doc?.consultation_fee ?? doc?.fee ?? doc?.fees)
        if (!Number.isNaN(legacy)) prices.push(legacy)
        return prices
    }

    // Determine the baseline fee to compare against range
    const resolveFeeForRange = (doc) => {
        // If a type is selected, use that specific price
        if (typeFilter) {
            const v = getConsultPrice(doc, typeFilter)
            return typeof v === 'number' ? v : undefined
        }
        // Otherwise use the minimum available consult price for the doctor
        const cd = doc?.consultationsDetails || doc?.consultations_details
        if (cd) {
            const candidates = [cd?.clinic_visit_price, cd?.home_visit_price, cd?.eopd_price]
                .map(n => Number(n))
                .filter(v => !Number.isNaN(v))
            if (candidates.length > 0) return Math.min(...candidates)
        }
        // Fallback to any legacy fields if consultationsDetails is not present
        const legacy = Number(doc?.consultation_fee ?? doc?.fee ?? doc?.fees)
        return Number.isNaN(legacy) ? undefined : legacy
    }

    const withinFeeRange = (doc, range) => {
        if (!range) return true
        // If a type is selected, use that specific fee only
        if (typeFilter) {
            const fee = resolveFeeForRange(doc)
            if (typeof fee !== 'number') return false
            if (range === '15000+') return fee >= 15000
            const [min, max] = range.split('-').map(n => Number(n))
            return fee >= min && fee <= max
        }
        // Otherwise, include the doctor if ANY available consult price falls within range
        const prices = getAllConsultPrices(doc)
        if (prices.length === 0) return false
        if (range === '15000+') return prices.some(p => p >= 15000)
        const [min, max] = range.split('-').map(n => Number(n))
        return prices.some(p => p >= min && p <= max)
    }

    const matchesGender = (doc, g) => {
        if (!g) return true
        const val = (doc?.gender || doc?.Gender || '').toString().toLowerCase()
        return val === g.toLowerCase()
    }
    const matchesType = (doc, t) => {
        if (!t) return true
        // Prefer consultationsDetails keys if present
        const cd = doc?.consultationsDetails || doc?.consultations_details
        if (cd) {
            const map = {
                clinic_visit: 'clinic_visit_price',
                home_visit: 'home_visit_price',
                eopd: 'eopd_price',
            }
            const key = map[t.toLowerCase()]
            if (key && Object.prototype.hasOwnProperty.call(cd, key)) {
                const v = Number(cd[key])
                return !Number.isNaN(v) && v > 0
            }
        }
        // Fallbacks for older structures
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
            const match = raw.match(/(\d+)/)
            if (match) years = Number(match[1])
        }
        if (Number.isNaN(years)) return false
        const min = Number(String(threshold).replace('+', ''))
        return years >= min
    }

    const filteredDoctors = (Array.isArray(doctor_list) ? doctor_list : []).filter(doc =>
        matchesGender(doc, genderFilter)
        && withinFeeRange(doc, feeFilter)
        && matchesType(doc, typeFilter)
        && meetsExperience(doc, expFilter)
    )

    return (
        <>
            <NavBar logindata={patient} />
            {/* header bg */}
            <section className='spacer-y bg_sec_search'>
                <Container>
                    <Row>
                        <Col xs={12}>
                            <h2 className='head_sec text-center'>Find Perfect <span className='sky-blue'>Doctor</span> </h2>
                        </Col>
                    </Row>
                </Container>
            </section>
            {/* search box */}
            <div style={{ marginTop: '-22px' }}>
                <SearchBox />
            </div>

            {/* filter by below list */}
            <Container>
                <Row className='justify-content-center align-items-center g-2 mt-3'>
                    <Col xs='auto'>
                        <Button variant='secondary' className='rounded-pill'><MdFilterListAlt className='fs-5' /> Filter</Button>
                    </Col>
                    <Col xs='auto'>
                        <CustomDropdown
                            options={genderOptions}
                            value={genderFilter}
                            onChange={setGenderFilter}
                            placeholder='Gender'
                            minWidth={200}
                        />
                    </Col>
                    <Col xs='auto'>
                        <CustomDropdown
                            options={typeOptions}
                            value={typeFilter}
                            onChange={setTypeFilter}
                            placeholder='Consult Type'
                        />
                    </Col>
                    <Col xs='auto'>
                        <CustomDropdown
                            options={feeOptions}
                            value={feeFilter}
                            onChange={setFeeFilter}
                            placeholder='Fees'
                        />
                    </Col>
                    <Col xs='auto'>
                        <CustomDropdown
                            options={[{ value: '', label: 'Experience' }, ...expOptions]}
                            value={expFilter}
                            onChange={setExpFilter}
                            placeholder='Experience'
                        />
                    </Col>
                    <Col xs='auto'>
                        <Button variant='outline-secondary' className='rounded-pill' onClick={() => { setGenderFilter(''); setFeeFilter(''); setTypeFilter(''); setExpFilter('') }}>Clear</Button>
                    </Col>
                </Row>
            </Container>

            {/* doctor list section */}
            <section className='py-5'>
                <Container>
                    <h2 className='mb-5'>{doctor_list && doctor_list[0]?.surgerytypeid?.surgerytypename} Doctors List</h2>
                    <Row>
                        {filteredDoctors.length <= 0 ? <Col>No Doctor Found...</Col> : filteredDoctors.map((doc, i) => (
                            <Col xs={12} md={6} lg={4} xl={3} key={i}>
                                <DoctorListComponents details={doc} />
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>
            <FooterBar />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default Surgerydoctorlist