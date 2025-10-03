import React, { useEffect, useState } from 'react'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import { Badge, Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { MdCompare, MdClear, MdLocalHospital, MdSchool, MdVerified, MdLocationOn, MdCurrencyRupee } from 'react-icons/md'
import axios from 'axios'
import Loader from '../Loader'
import CryptoJS from "crypto-js";
import { Link, useNavigate } from 'react-router-dom';

const CompareDoctor = () => {
    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();

    const [patient, setpatient] = useState(null)
    const [token, settoken] = useState(null)
    const [loading, setloading] = useState(false)
    const [surgeryOptions, setSurgeryOptions] = useState([])
    const [selectedSurgery, setSelectedSurgery] = useState('')
    const [doctors, setDoctors] = useState([])
    const [selectedDoctors, setSelectedDoctors] = useState([]) // store selected doctor objects (max 2)

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

    // Load surgeries on mount
    useEffect(() => {
        const fetchSurgeries = async () => {
            setloading(true)
            try {
                const res = await axios({
                    method: 'post',
                    url: 'https://healtheasy-o25g.onrender.com/doctor/surgerytypes/list',
                })
                // Be resilient to both shapes: { Data: [...] } or { Data: { docs: [...] } }
                const list = res.data.Data
                // console.log(list)
                setSurgeryOptions(list)
            } catch (e) {
                console.log(e)
            } finally {
                setloading(false)
            }
        }
        fetchSurgeries()
    }, [])

    // Fetch doctors when a surgery is selected
    useEffect(() => {
        const fetchDoctors = async () => {
            if (!selectedSurgery) return
            setloading(true)
            try {
                const res = await axios({
                    method: 'post',
                    url: 'https://healtheasy-o25g.onrender.com/user/doctors/list',
                    data: { surgerytypeid: selectedSurgery }
                })
                setDoctors(res?.data?.Data || [])
                // console.log(res?.data?.Data)
            } catch (e) {
                console.log(e)
            } finally {
                setloading(false)
            }
        }
        fetchDoctors()
    }, [selectedSurgery])

    const handleSelectDoctor = (doc) => {
        const exists = selectedDoctors.find(d => d._id === doc._id)
        if (exists) {
            // unselect
            setSelectedDoctors(prev => prev.filter(d => d._id !== doc._id))
            return
        }
        if (selectedDoctors.length >= 2) return // max 2
        setSelectedDoctors(prev => [...prev, doc])
    }

    return (
        <>
            <NavBar logindata={patient} />
            {/* offers section */}
            <section className='py-5'>
                <Container>
                    <Card className='border-0 rounded-4 p-4 sec_head shadow-sm mb-4' style={{background: 'linear-gradient(135deg, #e0f2ff 0%, #ffffff 60%)'}}>
                        <div className='text-center '>
                            <h2 className='d-flex align-items-center justify-content-center gap-2'>
                                <span className='d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white' style={{width: 38, height: 38}}>
                                    <MdCompare size={20} />
                                </span>
                                Compare Doctors by Surgery
                            </h2>
                            <p className='text-muted mb-0'>Choose a surgery, pick up to two doctors, and instantly compare key details at a glance.</p>
                        </div>
                    </Card>
                    {/* Surgery dropdown and filter row */}
                    <Row className='justify-content-center mt-4 g-3'>
                        <Col xs={12} md={6} lg={5}>
                            <Form.Label className='fw-semibold'>Choose a Surgery</Form.Label>
                            <Form.Select
                                className='rounded-pill outline-secondary'
                                value={selectedSurgery}
                                onChange={(e) => {
                                    setSelectedSurgery(e.target.value)
                                    setSelectedDoctors([]) // reset selection on surgery change
                                    console.log(e.target.value)
                                }}
                            >
                                <option value=''>Select surgery...</option>
                                {surgeryOptions.length > 0 && surgeryOptions.map((s) => (
                                    <option key={s?._id} value={s?._id}>
                                        {s?.surgerytypename || s?.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        <Col xs={12} md={'auto'} className='d-flex align-items-end'>
                            <div className='d-flex align-items-center gap-3'>
                                <div>
                                    <div className='small text-muted'>Selected</div>
                                    <div>
                                        {selectedDoctors.map((d) => (
                                            <Badge bg='primary' key={d._id} className='me-2 rounded-pill d-inline-flex align-items-center'>
                                                Dr. {d.name}
                                                <Button variant='link' size='sm' className='text-white p-0 ms-2'
                                                    onClick={() => setSelectedDoctors(prev => prev.filter(x => x._id !== d._id))}
                                                >
                                                    ×
                                                </Button>
                                            </Badge>
                                        ))}
                                        {selectedDoctors.length === 0 && <span className='text-muted'>None</span>}
                                    </div>
                                </div>
                                {selectedDoctors.length > 0 && (
                                    <Button variant='outline-secondary' className='rounded-pill d-flex align-items-center gap-2' size='sm' onClick={() => setSelectedDoctors([])}>
                                        <MdClear /> Clear
                                    </Button>
                                )}
                            </div>
                        </Col>
                    </Row>

                    {/* Comparison section (matrix) */}
                    <section className='mt-5'>
                        <h5 className='mb-3 d-flex align-items-center gap-2'><MdCompare /> Comparison</h5>
                        {selectedDoctors.length === 0 ? (
                            <div className='text-muted'>Select doctors to compare.</div>
                        ) : (
                            <Card className='p-3 shadow-sm rounded-4'>
                                <Row className='g-4'>
                                    {/* Labels Column */}
                                    <Col xs={12} md={3}>
                                        <div className='text-muted small'>Criteria</div>
                                        <ul className='list-unstyled mt-3 mb-0'>
                                            <li className='py-2 border-bottom'>Profile</li>
                                            <li className='py-2 border-bottom'>Experience</li>
                                            <li className='py-2 border-bottom'>Consultation Fee</li>
                                            <li className='py-2 border-bottom'>Surgeries</li>
                                            {selectedDoctors.length === 1 && (
                                                <li className='py-2 border-bottom text-muted'>Select second doctor</li>
                                            )}
                                            <li className='py-2 border-bottom'>Qualification</li>
                                            <li className='py-2 border-bottom'>Approval Status</li>
                                            <li className='py-2 border-bottom'>Sub Specialty</li>
                                        </ul>
                                    </Col>
                                    {/* Doctor A */}
                                    <Col xs={12} md={4}>
                                        {(() => { const d = selectedDoctors[0]; return (
                                            <div>
                                                <div className='d-flex gap-3 align-items-center py-2 border-bottom'>
                                                    <img src={d?.profile_pic} alt={`Dr. ${d?.name}`} className='rounded-3' style={{ width: 56, height: 56, objectFit: 'cover' }} />
                                                    <div>
                                                        <div className='fw-bold'>Dr. {d?.name}</div>
                                                        <div className='small text-muted d-flex align-items-center gap-1'><MdVerified className='text-primary' /> {d?.specialty || '—'}</div>
                                                    </div>
                                                </div>
                                                <div className='py-2 border-bottom'>{d?.experience ? `${d.experience} yrs` : '—'}</div>
                                                <div className='py-2 border-bottom d-flex align-items-center gap-1'>
                                                    <MdCurrencyRupee />
                                                    {(() => {
                                                        const cd = d?.consultationsDetails;
                                                        if (!cd) return '—';
                                                        const parts = [
                                                            cd?.clinic_visit_price ? `Clinic ₹${cd.clinic_visit_price}` : null,
                                                            cd?.home_visit_price ? `Home ₹${cd.home_visit_price}` : null,
                                                            cd?.eopd_price ? `EOPD ₹${cd.eopd_price}` : null,
                                                        ].filter(Boolean);
                                                        return parts.length ? parts.join(' | ') : '—';
                                                    })()}
                                                </div>
                                                <div className='py-2 border-bottom'>
                                                    {Array.isArray(d?.surgeriesDetails) && d.surgeriesDetails.length > 0
                                                        ? d.surgeriesDetails.map(s => s?.name || s).join(', ')
                                                        : '—'}
                                                </div>
                                                <div className='py-2 border-bottom d-flex align-items-center gap-1'><MdLocalHospital className='text-danger' />{Array.isArray(d?.hospitals) && d.hospitals.length > 0 ? d.hospitals.map(h => h?.name || h).join(', ') : (d?.hospitalname || '—')}</div>
                                                <div className='py-2 border-bottom d-flex align-items-center gap-1'><MdSchool className='text-warning' />{d?.qualifications}</div>
                                                <div className='py-2 border-bottom'>{d?.approval_status}</div>
                                                <div className='py-2 border-bottom'>{typeof d?.sub_specialty !== 'undefined' ? String(d.sub_specialty) : '—'}</div>
                                                <div className='py-2 border-bottom'><Link to={`/doctorprofile/${encodeURIComponent(btoa(d._id))}`} className='text-primary'>View Profile</Link></div>
                                            </div>
                                        )})()}
                                    </Col>
                                    <Col xs={12} md={5}>
                                        {(() => { const d = selectedDoctors[1]; if (!d) return (
                                            <div className='text-muted small border rounded-3 p-3 h-100 d-flex align-items-center justify-content-center'>
                                                Select another doctor to compare
                                            </div>
                                        ); return (
                                            <div>
                                                <div className='d-flex gap-3 align-items-center py-2 border-bottom'>
                                                    <img src={d?.profile_pic} alt={`Dr. ${d?.name}`} className='rounded-3' style={{ width: 56, height: 56, objectFit: 'cover' }} />
                                                    <div>
                                                        <div className='fw-bold'>Dr. {d?.name}</div>
                                                        <div className='small text-muted d-flex align-items-center gap-1'><MdVerified className='text-primary' /> {d?.specialty || '—'}</div>
                                                    </div>
                                                </div>
                                                <div className='py-2 border-bottom'>{d?.experience ? `${d.experience} yrs` : '—'}</div>
                                                <div className='py-2 border-bottom d-flex align-items-center gap-1'>
                                                    <MdCurrencyRupee />
                                                    {(() => {
                                                        const cd = d?.consultationsDetails;
                                                        if (!cd) return '—';
                                                        const parts = [
                                                            cd?.clinic_visit_price ? `Clinic ₹${cd.clinic_visit_price}` : null,
                                                            cd?.home_visit_price ? `Home ₹${cd.home_visit_price}` : null,
                                                            cd?.eopd_price ? `EOPD ₹${cd.eopd_price}` : null,
                                                        ].filter(Boolean);
                                                        return parts.length ? parts.join(' | ') : '—';
                                                    })()}
                                                </div>
                                                <div className='py-2 border-bottom'>
                                                    {Array.isArray(d?.surgeriesDetails) && d.surgeriesDetails.length > 0
                                                        ? d.surgeriesDetails.map(s => s?.name || s).join(', ')
                                                        : '—'}
                                                </div>
                                                <div className='py-2 border-bottom d-flex align-items-center gap-1'><MdLocalHospital className='text-danger' />{Array.isArray(d?.hospitals) && d.hospitals.length > 0 ? d.hospitals.map(h => h?.name || h).join(', ') : (d?.hospitalname || '—')}</div>
                                                <div className='py-2 border-bottom d-flex align-items-center gap-1'><MdSchool className='text-warning' />{Array.isArray(d?.qualifications) && d.qualifications.length > 0 ? d.qualifications.join(', ') : (d?.qualification || '—')}</div>
                                                <div className='py-2 border-bottom'>{typeof d?.approval_status !== 'undefined' ? String(d.approval_status) : (typeof d?.isApproved !== 'undefined' ? (d.isApproved ? 'Approved' : 'Pending') : '—')}</div>
                                                <div className='py-2 border-bottom'>{typeof d?.sub_specialty !== 'undefined' ? String(d.sub_specialty) : '—'}</div>
                                                <div className='py-2 border-bottom'><Link to={`/doctorprofile/${encodeURIComponent(btoa(d._id))}`} className='text-primary'>View Profile</Link></div>
                                            </div>
                                        )})()}
                                    </Col>
                                </Row>
                            </Card>
                        )}
                    </section>

                    {/* Doctors list */}
                    {selectedSurgery && (
                        <section className='mt-4'>
                            <h5 className='mb-3'>Doctors for selected surgery</h5>
                            {doctors.length === 0 ? (
                                <div className='text-muted'>No doctors found.</div>
                            ) : (
                                <Row className='g-3'>
                                    {doctors.map((doc) => {
                                        const isSelected = selectedDoctors.some(d => d._id === doc._id)
                                        return (
                                            <Col xs={12} md={6} lg={4} key={doc._id}>
                                                <Card className={`p-3 h-100 shadow-sm rounded-4 ${isSelected ? 'border border-primary' : ''}`}>
                                                    <div className='d-flex gap-3'>
                                                        <img
                                                            src={doc?.profile_pic}
                                                            alt={`Dr. ${doc?.name}`}
                                                            className='rounded-circle border'
                                                            style={{ width: 72, height: 72, objectFit: 'cover' }}
                                                        />
                                                        <div className='flex-grow-1'>
                                                            <div className='fw-bold d-flex align-items-center gap-2'>Dr. {doc?.name}
                                                                {doc?.isApproved && <MdVerified className='text-primary' title='Verified' />}
                                                            </div>
                                                            <div className='small text-muted'>{doc?.specialty}</div>
                                                            <div className='small text-muted d-flex align-items-center gap-1'><MdLocationOn />{doc?.city}, {doc?.state}</div>
                                                        </div>
                                                    </div>
                                                    <div className='d-flex gap-2 mt-3'>
                                                        <Button
                                                            variant={isSelected ? 'secondary' : 'primary'}
                                                            size='sm'
                                                            className='rounded-pill'
                                                            onClick={() => handleSelectDoctor(doc)}
                                                            disabled={!isSelected && selectedDoctors.length >= 2}
                                                        >
                                                            {isSelected ? 'Remove' : (selectedDoctors.length >= 2 ? 'Max Selected' : 'Add to Compare')}
                                                        </Button>
                                                    </div>
                                                </Card>
                                            </Col>
                                        )
                                    })}
                                </Row>
                            )}
                        </section>
                    )}


                </Container>
            </section>
            <FooterBar />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default CompareDoctor