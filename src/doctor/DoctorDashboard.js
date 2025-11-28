import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import DoctorNav from './DoctorNav';
import { Col, Container, Row } from 'react-bootstrap';
import DoctorSidebar from './DoctorSidebar';
import CryptoJS from "crypto-js";
import { SECRET_KEY, STORAGE_KEYS } from '../config';
import Navbar from '../Visitor/Component/NavBar';
import FooterBar from '../Visitor/Component/FooterBar';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { format } from 'date-fns';
import { FiBarChart, FiClipboard, FiClock, FiScissors, FiVideo } from 'react-icons/fi';
import SmartDataTable from '../components/SmartDataTable';
import Loader from '../Loader';
import { PiHospital } from 'react-icons/pi';
import { HiOutlineHome } from 'react-icons/hi';
import { BsCameraVideo } from 'react-icons/bs';

const DoctorDashboard = () => {

  var navigate = useNavigate();

  const [doctor, setdoctor] = useState(null)
  const [token, settoken] = useState(null)
  const [loading, setloading] = useState(false)

  useEffect(() => {
    var getlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
    }
    if (!data) {
      navigate('/doctor')
    }
    else {
      // var doctorData = {...data.doctorData,logintype: 'doctor'};
      setdoctor(data.doctorData);
      settoken(`Bearer ${data.accessToken}`)
    }
  }, [])

  const [count, setcount] = useState(null)

  const getcount = async () => {
    await axios({
      method: 'get',
      url: `${API_BASE_URL}/doctor/count`,
      headers: {
        Authorization: token
      }
    }).then((res) => {
      // console.log('count = ', res.data.Data);
      setcount(res.data.Data)
    }).catch(function (error) {
      // console.log(error);
    });
  }

  const [appointment, setappointment] = useState([])
  // const [surgeryapt, setsurgeryapt] = useState([])

  useEffect(() => {
    setloading(true)
    if (doctor) {
      getcount()
      appointmentlist()
      // surgappointmentlist()
    }
  }, [token])

  const appointmentlist = async () => {
    // setloading(true)
    await axios({
      method: 'post',
      url: `${API_BASE_URL}/doctor/appointments/list`,
      headers: {
        Authorization: token
      }
    }).then((res) => {
      // console.log(res.data.Data)
      const today = format(new Date(), 'dd-MM-yyyy')
      const all = Array.isArray(res.data?.Data) ? res.data.Data : []
      const onlyToday = all.filter(item => item?.date === today)
      setappointment(onlyToday)
    }).catch(function (error) {
      // console.log(error);
      // toast(error.response.data.Message,{className:'custom-toast-error'})
    }).finally(() => {
      setloading(false)
    });
  }

  // const surgappointmentlist = async () => {
  //   // setloading(true)
  //   await axios({
  //     method: 'post',
  //     url: `${API_BASE_URL}/doctor/surgeryappointments/list`,
  //     headers: {
  //       Authorization: token
  //     }
  //   }).then((res) => {
  //     console.log(res.data.Data)
  //     const today = format(new Date(), 'dd-MM-yyyy')
  //     const all = Array.isArray(res.data?.Data) ? res.data.Data : []
  //     const onlyToday = all.filter(item => item?.date === today)
  //     setsurgeryapt(onlyToday)
  //   }).catch(function (error) {
  //     console.log(error);
  //     // toast(error.response.data.Message,{className:'custom-toast-error'})
  //   }).finally(() => {
  //     setloading(false)
  //   });
  // }


  // Appointment type pill
  const getTypePill = (type) => {
    const t = (type || '').toLowerCase()
    if (t.includes('clinic')) return { label: 'Clinic Visit', cls: 'badge-type badge-type--clinic', icon: <PiHospital size={16} /> }
    if (t.includes('home')) return { label: 'Home Visit', cls: 'badge-type badge-type--home', icon: <HiOutlineHome size={16} /> }
    return { label: type || 'EOPD', cls: 'badge-type badge-type--eopd', icon: <BsCameraVideo size={16} /> }
  }
  // Minimal table inline styles; visuals handled in CSS
  const customTableStyles = {
    table: { backgroundColor: 'transparent', borderRadius: 0, boxShadow: 'none' }
  };

  // table data
  const columns = [{
    name: 'No',
    cell: (row, index) => index + 1,
    width: '50px'
  }, {
    name: 'Patient Name',
    selector: row => row.patientname,
    cell: row =>
    (
      <div className="d-flex align-items-center text-truncate gap-3">
        <img
          // src={row.doctorid?.profile_pic}
          src={row.createdByuser?.profile_pic || require('../Visitor/assets/profile_icon_img.png')}
          alt='patient'
          className="rounded-circle appt-avatar"
        />
        <span className="fw-semibold appt-doctor-name">{row?.patientname}</span>
      </div>
    ),
  },
  {
    name: 'Date & Time',
    selector: row => row.date,
    cell: row => (
      <div className="d-flex align-items-center gap-2 text-muted small">
        <FiClock size={16} className="text-muted" />
        <span>{`${row.date} , ${row.time}`}</span>
      </div>
    ),
  },
  {
    name: 'Amount',
    selector: row => row.visit_types,
    cell: row => (
      <div className="d-flex align-items-center gap-2 text-muted small">
        <span className="text-muted appt-price">₹</span>
        <span className="text-truncate"> ₹ {row?.price || '0'}</span>
      </div>
    ),
  },
  {
    name: 'Type',
    cell: row => {
      const t = getTypePill(row.visit_types)
      return (
        <span className={t.cls}>
          {t.icon}
          {t.label}
        </span>
      )
    },
  }]

  return (
    <>

      <Navbar logindata={doctor} />

      <Container className='my-4'>
        <Row className="align-items-start">
          <DoctorSidebar doctor={doctor} />
          <Col xs={12} md={9}>
            <div className='bg-white rounded dashboard-card p-2'>
              <Col xs={12}>
                <Row>
                  <Col xs={6} md={3}>
                    <div className='bg-light rounded h-100 p-3 d-flex align-items-center gap-3 shadow'>
                      <FiClipboard />
                      <div className='d-flex flex-column'>
                        <small>Today Consultation</small>
                        <span className='fw-bold text-dark'>{count?.todayConsultationsAppointment}</span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className='bg-light rounded h-100 p-3 d-flex align-items-center gap-3 shadow'>
                      <FiVideo />
                      <div className='d-flex flex-column'>
                        <small>Today EOPD</small>
                        <span className='fw-bold text-dark'>{count?.todayEOPDAppointment}</span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className='bg-light rounded h-100 p-3 d-flex align-items-center gap-3 shadow'>
                      <FiScissors />
                      <div className='d-flex flex-column'>
                        <small>Today Surgery</small>
                        <span className='fw-bold text-dark'>{count?.todaySurgeryAppointment}</span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className='bg-light rounded h-100 p-3 d-flex align-items-center gap-3 shadow'>
                      <FiBarChart />
                      <div className='d-flex flex-column'>
                        <small>Today Earning</small>
                        <span className='fw-bold text-dark'>₹ {count?.todayEarnings}</span>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row className='pt-4 g-5 '>
                  <Col xs={12}>
                    <h4 className='mt-3'>Today Appointments</h4>
                    <SmartDataTable className="appointments-table" columns={columns} data={appointment} pagination perPage={5} customStyles={customTableStyles} />
                  </Col>
                  {/* <Col xs={12}>
                    <h4 className=''>Today Surgery Appointments</h4>
                    <SmartDataTable className="appointments-table" columns={columns} data={surgeryapt} pagination perPage={5} customStyles={customTableStyles} />
                  </Col> */}
                </Row>
              </Col>
            </div>
          </Col>
        </Row>
      </Container>
      {loading && <Loader />}
      <FooterBar />
    </>
  )
}

export default DoctorDashboard
