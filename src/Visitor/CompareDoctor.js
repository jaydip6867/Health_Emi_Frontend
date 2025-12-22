import React, { useEffect, useState } from 'react'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { MdCompare, MdClear, MdLocalHospital, MdSchool, MdVerified, MdLocationOn, MdCurrencyRupee } from 'react-icons/md'
import axios from 'axios'
import Loader from '../Loader'
import CryptoJS from "crypto-js";
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import defaultDoctorImg from "../assets/image/doctor_img.jpg"
import HeadTitle from './Component/HeadTitle'
import { CiLocationOn } from 'react-icons/ci'
import { FaStar } from 'react-icons/fa'

const CompareDoctor = () => {
  var navigate = useNavigate();

  const [logdata, setlogdata] = useState(null)
  const [token, settoken] = useState(null)
  const [loading, setloading] = useState(false)
  const [surgeryOptions, setSurgeryOptions] = useState([])
  const [selectedSurgery, setSelectedSurgery] = useState('')
  const [doctors, setDoctors] = useState([])
  const [selectedDoctors, setSelectedDoctors] = useState([]) // store selected doctor objects (max 2)

  useEffect(() => {
    let data = null;
    const pgetlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
    const dgetlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);

    if (pgetlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(pgetlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      data = JSON.parse(decrypted);
      setlogdata(data.userData);
    } else if (dgetlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(dgetlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      data = JSON.parse(decrypted);
      setlogdata(data.doctorData);
    }

    if (data?.accessToken) {
      settoken(`Bearer ${data.accessToken}`);
    }
  }, [navigate]);

  // Load surgeries on mount
  useEffect(() => {
    const fetchSurgeries = async () => {
      setloading(true)
      try {
        const res = await axios({
          method: 'post',
          url: `${API_BASE_URL}/doctor/surgerytypes/list`,
        })
        // Be resilient to both shapes: { Data: [...] } or { Data: { docs: [...] } }
        const list = res.data.Data
        // console.log(list)
        setSurgeryOptions(list)
      } catch (e) {
        // console.log(e)
      } finally {
        setloading(false)
      }
    }
    fetchSurgeries()
    fetchCategories()
  }, [])

  // Fetch doctors on page load and when surgery changes
  useEffect(() => {
    const fetchDoctors = async () => {
      setloading(true);
      try {
        const selected = surgeryOptions?.find(s => s?._id === selectedSurgery);
        const res = await axios({
          method: 'post',
          url: `${API_BASE_URL}/user/doctors/list`,
          headers: token ? { Authorization: token } : undefined,
          data: {
            search: '',
            surgerytypeid: selectedSurgery || '',
            // surgeryname: selected ? (selected?.surgerytypename || selected?.name || '') : ''
          }
        });
        setDoctors(res?.data?.Data || []);
      } catch (e) {
        // optional: handle error UI/logging
      } finally {
        setloading(false);
      }
    };
    fetchDoctors();
  }, [selectedSurgery, token, surgeryOptions]);

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

  const [secondDocQuery, setSecondDocQuery] = useState('')
  const [secondDocOpen, setSecondDocOpen] = useState(false)
  const [expandedSurgeries, setExpandedSurgeries] = useState({})

  const secondDoctorMatches = React.useMemo(() => {
    if (selectedDoctors.length !== 1) return []
    const q = secondDocQuery.trim().toLowerCase()
    const firstId = selectedDoctors[0]?._id
    const base = doctors.filter(d => d && d._id !== firstId)
    const filtered = q ? base.filter(d => (d?.name || '').toLowerCase().includes(q)) : base
    return filtered.slice(0, 20)
  }, [secondDocQuery, selectedDoctors, doctors])

  const [categoryOptions, setCategoryOptions] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [category_list, setcategory_list] = useState();

  const fetchCategories = async () => {
    setloading(true)
    try {
      const res = await axios({
        method: 'post',
        url: `${API_BASE_URL}/doctor/doctorcategories/list`,
        data: { search: '' }
      })
      // Be resilient to both shapes: { Data: [...] } or { Data: { docs: [...] } }
      const list = res.data.Data
      // console.log(list)
      setCategoryOptions(list)
      setcategory_list(list)
    } catch (e) {
      // console.log(e)
    } finally {
      setloading(false)
    }
  }

  const selsurgery = (e) => {
    const { name, value } = e.target;

    var cat_list = categoryOptions?.filter((x) => x?.surgerytypeid?._id === value);
    setcategory_list(cat_list);
    // console.log(doctors)
  };

  return (
    <>
      <NavBar logindata={logdata} />
      {/* breadcrumb section */}
      <section className='breadcrumb_Sec'>
        <Container className='text-center '>
          <h2>Compare Doctor</h2>
        </Container>
      </section>
      {/* offers section */}
      <section className='pb-5'>
        <Container>

          <Row className='justify-content-center g-3'>
            <Col xs={12} md={6} lg={5}>
              <Form.Select
                className='rounded-pill outline-secondary'
                value={selectedSurgery}
                onChange={(e) => {
                  setSelectedSurgery(e.target.value)
                  setSelectedDoctors([])
                  setSecondDocQuery('')
                  selsurgery(e)
                }}
              >
                <option value=''>Select surgery...</option>
                {surgeryOptions?.length > 0 && surgeryOptions?.map((s) => (
                  <option key={s?._id} value={s?._id}>
                    {s?.surgerytypename || s?.name}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Container>
      </section>
      <section className='pb-5'>
        <Container>
          <section>
            <h2 className='head_sec mb-5'><HeadTitle title="Comparison" /></h2>
            {selectedDoctors.length === 0 ? (
              <div className='text-muted'>Select doctors to compare.</div>
            ) : (
              <Card className='p-3 shadow-sm rounded-4 mb-5'>
                {(() => {
                  const d1 = selectedDoctors[0];
                  const d2 = selectedDoctors[1];
                  const feeText = (d) => {
                    const cd = d?.consultationsDetails;
                    if (!cd) return '—';
                    const parts = [
                      cd?.clinic_visit_price ? `Clinic ₹${cd.clinic_visit_price}` : null,
                      cd?.home_visit_price ? `Home ₹${cd.home_visit_price}` : null,
                      cd?.eopd_price ? `EOPD ₹${cd.eopd_price}` : null,
                    ].filter(Boolean);
                    return parts.length ? parts.join(' | ') : '—';
                  };
                  const surgeriesPieces = (d) => {
                    if (!Array.isArray(d?.surgeriesDetails) || d.surgeriesDetails.length === 0) return [];
                    return d.surgeriesDetails.map(s => s?.name || s).filter(Boolean);
                  };
                  const hospitalsText = (d) => {
                    return Array.isArray(d?.hospitals) && d.hospitals.length > 0
                      ? d.hospitals.map(h => h?.name || h).join(', ')
                      : (d?.hospitalname || '—');
                  };
                  const qualificationText = (d) => {
                    return Array.isArray(d?.qualifications) && d.qualifications.length > 0
                      ? d.qualifications.join(', ')
                      : (d?.qualification || '—');
                  };
                  const approvalText = (d) => {
                    if (typeof d?.approval_status !== 'undefined') return String(d.approval_status);
                    if (typeof d?.isApproved !== 'undefined') return d.isApproved ? 'Approved' : 'Pending';
                    return '—';
                  };
                  const subSpecialtyText = (d) => {
                    return typeof d?.sub_specialty !== 'undefined' ? String(d.sub_specialty) : '—';
                  };
                  return (
                    <div>
                      <Row className='fw-semibold text-muted small border-bottom pb-2 d-none d-md-flex'>
                        <Col md={3}>Criteria</Col>
                        <Col md={4}>Doctor A</Col>
                        <Col md={5}>Doctor B</Col>
                      </Row>

                      <Row className='align-items-stretch py-3 border-bottom'>
                        <Col xs={12} md={3} className='mb-2 mb-md-0 fw-semibold'>Profile</Col>
                        <Col xs={12} md={4} className='position-relative'>
                          <Button variant='link' className='position-absolute top-0 end-0 text-danger p-1' style={{ zIndex: 10 }} onClick={() => setSelectedDoctors(prev => prev.filter(x => x._id !== d1._id))} title='Remove doctor'>
                            <MdClear size={20} />
                          </Button>
                          <div className='d-flex gap-3 align-items-center'>
                            <img src={d1?.profile_pic} alt={`${d1?.name} profile pic`} className='rounded-3' style={{ width: 56, height: 56, objectFit: 'cover' }} />
                            <div>
                              <div className='fw-bold'>Dr. {d1?.name}</div>
                              <div className='small text-muted d-flex align-items-center gap-1'><MdVerified className='text-primary' /> {d1?.specialty || '—'}</div>
                            </div>
                          </div>
                        </Col>
                        <Col xs={12} md={5} className='position-relative'>
                          {d2 ? (
                            <>
                              <Button variant='link' className='position-absolute top-0 end-0 text-danger p-1' style={{ zIndex: 10 }} onClick={() => setSelectedDoctors(prev => prev.filter(x => x._id !== d2._id))} title='Remove doctor'>
                                <MdClear size={20} />
                              </Button>
                              <div className='d-flex gap-3 align-items-center'>
                                <img src={d2?.profile_pic} alt={`Dr. ${d2?.name} profile pic`} className='rounded-3' style={{ width: 56, height: 56, objectFit: 'cover' }} />
                                <div>
                                  <div className='fw-bold'>Dr. {d2?.name}</div>
                                  <div className='small text-muted d-flex align-items-center gap-1'><MdVerified className='text-primary' /> {d2?.specialty || '—'}</div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className='border rounded-3 p-3'>
                              <div className='text-muted small mb-3 text-center'>Select another doctor to compare</div>
                              <Form.Control type='text' placeholder='Search doctor by name...' value={secondDocQuery} onChange={(e) => setSecondDocQuery(e.target.value)} onFocus={() => setSecondDocOpen(true)} onClick={() => setSecondDocOpen(true)} onBlur={() => setTimeout(() => setSecondDocOpen(false), 120)} className='rounded-pill mb-2' />
                              {secondDocOpen && secondDoctorMatches.length > 0 && (
                                <div className='border rounded-3 mt-2' style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                  {secondDoctorMatches.map((doc) => (
                                    <div key={doc._id} className='p-2 border-bottom cursor-pointer hover-bg-light d-flex gap-2 align-items-center' style={{ cursor: 'pointer' }} onClick={() => { handleSelectDoctor(doc); setSecondDocQuery(''); setSecondDocOpen(false); }}>
                                      <img src={doc?.profile_pic} alt={`Dr. ${doc?.name} profile pic`} className='rounded-circle border' style={{ width: 40, height: 40, objectFit: 'cover' }} />
                                      <div className='flex-grow-1'>
                                        <div className='fw-semibold small'>Dr. {doc?.name}</div>
                                        <div className='text-muted' style={{ fontSize: '0.75rem' }}>{doc?.specialty || '—'}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {secondDocOpen && secondDocQuery.trim() && secondDoctorMatches.length === 0 && (
                                <div className='text-muted small text-center mt-2'>No doctors found</div>
                              )}
                            </div>
                          )}
                        </Col>
                      </Row>

                      <Row className='align-items-center py-3 border-bottom'>
                        <Col xs={12} md={3} className='mb-2 mb-md-0 fw-semibold'>Experience</Col>
                        <Col xs={12} md={4}>{d1?.experience ? `${d1.experience}` : '—'}</Col>
                        <Col xs={12} md={5}>{d2?.experience ? `${d2.experience}` : (d2 ? '—' : '')}</Col>
                      </Row>

                      <Row className='align-items-center py-3 border-bottom'>
                        <Col xs={12} md={3} className='mb-2 mb-md-0 fw-semibold'>Consultation Fee</Col>
                        <Col xs={12} md={4} className='d-flex align-items-center gap-1'><MdCurrencyRupee /> {feeText(d1)}</Col>
                        <Col xs={12} md={5} className='d-flex align-items-center gap-1'><MdCurrencyRupee /> {d2 ? feeText(d2) : ''}</Col>
                      </Row>

                      <Row className='align-items-center py-3 border-bottom'>
                        <Col xs={12} md={3} className='mb-2 mb-md-0 fw-semibold'>Surgeries</Col>
                        <Col xs={12} md={4}>
                          {(() => {
                            const pieces = surgeriesPieces(d1);
                            if (pieces.length === 0) return '—';
                            const expanded = !!expandedSurgeries[d1?._id];
                            const shown = expanded ? pieces : pieces.slice(0, 3);
                            return (
                              <>
                                <span>{shown.join(', ')}</span>
                                {pieces.length > 3 && (
                                  <Button variant='link' size='sm' className='p-0 ms-2' onClick={() => setExpandedSurgeries(prev => ({ ...prev, [d1._id]: !expanded }))}>
                                    {expanded ? 'Read less' : 'Read more'}
                                  </Button>
                                )}
                              </>
                            );
                          })()}
                        </Col>
                        <Col xs={12} md={5}>
                          {d2 ? (() => {
                            const pieces = surgeriesPieces(d2);
                            if (pieces.length === 0) return '—';
                            const expanded = !!expandedSurgeries[d2?._id];
                            const shown = expanded ? pieces : pieces.slice(0, 3);
                            return (
                              <>
                                <span>{shown.join(', ')}</span>
                                {pieces.length > 3 && (
                                  <Button variant='link' size='sm' className='p-0 ms-2' onClick={() => setExpandedSurgeries(prev => ({ ...prev, [d2._id]: !expanded }))}>
                                    {expanded ? 'Read less' : 'Read more'}
                                  </Button>
                                )}
                              </>
                            );
                          })() : ''}
                        </Col>
                      </Row>

                      <Row className='align-items-center py-3 border-bottom'>
                        <Col xs={12} md={3} className='mb-2 mb-md-0 fw-semibold'>Hospitals</Col>
                        <Col xs={12} md={4} className='d-flex align-items-center gap-1'><MdLocalHospital className='text-danger' /> {hospitalsText(d1)}</Col>
                        <Col xs={12} md={5} className='d-flex align-items-center gap-1'><MdLocalHospital className='text-danger' /> {d2 ? hospitalsText(d2) : ''}</Col>
                      </Row>

                      <Row className='align-items-center py-3 border-bottom'>
                        <Col xs={12} md={3} className='mb-2 mb-md-0 fw-semibold'>Qualification</Col>
                        <Col xs={12} md={4} className='d-flex align-items-center gap-1'><MdSchool className='text-warning' /> {qualificationText(d1)}</Col>
                        <Col xs={12} md={5} className='d-flex align-items-center gap-1'><MdSchool className='text-warning' /> {d2 ? qualificationText(d2) : ''}</Col>
                      </Row>

                      <Row className='align-items-center py-3 border-bottom'>
                        <Col xs={12} md={3} className='mb-2 mb-md-0 fw-semibold'>Approval Status</Col>
                        <Col xs={12} md={4}>{approvalText(d1)}</Col>
                        <Col xs={12} md={5}>{d2 ? approvalText(d2) : ''}</Col>
                      </Row>

                      <Row className='align-items-center py-3 border-bottom'>
                        <Col xs={12} md={3} className='mb-2 mb-md-0 fw-semibold'>Sub Specialty</Col>
                        <Col xs={12} md={4}>{subSpecialtyText(d1)}</Col>
                        <Col xs={12} md={5}>{d2 ? subSpecialtyText(d2) : ''}</Col>
                      </Row>

                      <Row className='align-items-center pt-3'>
                        <Col xs={12} md={3} className='mb-2 mb-md-0 fw-semibold'>Profile</Col>
                        <Col xs={12} md={4}><Link to={`/doctorprofile/${encodeURIComponent(btoa(d1._id))}`} className='text-primary'>View Profile</Link></Col>
                        <Col xs={12} md={5}>{d2 && <Link to={`/doctorprofile/${encodeURIComponent(btoa(d2._id))}`} className='text-primary'>View Profile</Link>}</Col>
                      </Row>
                    </div>
                  );
                })()}
              </Card>
            )}
          </section>

          <section className='mt-4'>
            <h2 className='head_sec mb-5'><HeadTitle title="Select Doctor" /></h2>
            {doctors.length === 0 ? (
              <div className='text-muted'>No doctors found.</div>
            ) : (
              // doctor card
              <Row className='g-3'>
                {doctors.map((doc) => {
                  const isSelected = selectedDoctors.some(d => d._id === doc._id)
                  return (
                    <Col xs={6} md={4} lg={3} key={doc._id}>
                      <Card text="secondary" className="my-3 rounded-4 doctor_card doctor-card-v2 overflow-hidden">
                        <div className="position-relative">
                          <img
                            src={doc?.profile_pic || defaultDoctorImg}
                            alt={`Dr. ${doc?.name || 'Doctor'}`}
                            className="w-100 doctor-card-img"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = defaultDoctorImg; }}
                          />
                          <div className="rating-badge-orange d-inline-flex align-items-center gap-2 position-absolute top-0 start-0 m-3 px-2 py-1 rounded-3">
                            <FaStar size={14} className="text-white" />
                            <small className="fw-bold text-white fs-7">{doc?.averageRating === 0 ? '0' : doc?.averageRating}</small>
                          </div>
                        </div>

                        <Card.Body className="pt-3 pb-4 px-0">
                          <div className="d-flex align-items-center justify-content-between mb-2 pe-2">
                            <div className="spec-chip d-inline-flex align-items-center" style={{ width: '60%' }}>
                              <small className="fw-semibold text-truncate">{doc?.specialty || 'Specialist'}</small>
                            </div>
                            <div className="chip chip-available">
                              {doc?.is_available === true ? <small className="fw-semibold fs-7 px-2 py-1 rounded-3" style={{ backgroundColor: '#EDF9F0', color: '#04BD6C' }}>Available</small> : <small className="fw-semibold fs-7 px-2 py-1 rounded-3" style={{ backgroundColor: '#ebebebff', color: '#797979ff' }}>Unavailable</small>}
                            </div>
                          </div>

                          <div className="px-3">
                            <h5 className="mb-2 doctor_name">Dr. {doc?.name}</h5>
                            <div className="d-flex align-items-start mb-3 location">
                              <CiLocationOn className="me-1 pt-1 fs-6" />
                              <small>
                                {doc?.city}{doc?.city ? ', ' : ''}{doc?.state}
                              </small>
                            </div>

                            <div className="dotted-divider my-3"></div>

                            <Row className="align-items-center g-2 consultation_fees justify-content-center">

                              <Col xs="auto" className="text-end">
                                <button
                                  variant={isSelected ? 'secondary' : 'primary'}
                                  size='sm'
                                  className='compare_btn rounded-pill'
                                  onClick={() => handleSelectDoctor(doc)}
                                  disabled={!isSelected && selectedDoctors.length >= 2}
                                >
                                  {isSelected ? 'Remove' : (selectedDoctors.length >= 2 ? 'Max Selected' : 'Add to Compare')}
                                </button>
                              </Col>
                            </Row>
                          </div>

                          {/* <Link to={`/doctorprofile/${encodeURIComponent(btoa(details._id))}`} className="m-0 stretched-link"></Link> */}
                        </Card.Body>
                      </Card>
                      {/* <Card className={`p-3 h-100 shadow-sm rounded-4 ${isSelected ? 'border border-primary' : ''}`}>
                          <div className='d-flex gap-3'>
                            <img
                              src={doc?.profile_pic}
                              alt={`Dr. ${doc?.name} profile`}
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
                        </Card> */}
                    </Col>
                  )
                })}
              </Row>
            )}
          </section>
        </Container>
      </section>
      <FooterBar />
      {loading ? <Loader /> : ''}
    </>
  )
}

export default CompareDoctor