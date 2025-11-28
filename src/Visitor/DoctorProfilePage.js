import { useEffect, useState } from 'react'
import NavBar from './Component/NavBar'
import { Card, Col, Container, Row, Button, Image, Form, Modal, Badge } from 'react-bootstrap'
import FooterBar from './Component/FooterBar'
import Loader from '../Loader'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import './css/visitor.css'
import { FaEnvelope } from 'react-icons/fa'
import { BsStarFill, BsGeoAlt } from 'react-icons/bs'
import { format, addDays } from 'date-fns';
import Swal from 'sweetalert2'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { FaLocationDot } from 'react-icons/fa6'
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config'

const DoctorProfilePage = () => {
  var navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedConsultationType, setSelectedConsultationType] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [consultError, setConsultError] = useState(false);
  const [hospitalError, setHospitalError] = useState(false);

  // Available time slots
  const timeSlots = [
    { time: '09:00 AM', available: true },
    { time: '09:30 AM', available: true },
    { time: '10:00 AM', available: true },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '11:30 AM', available: true },
    { time: '12:00 PM', available: true },
    { time: '12:30 PM', available: true },
    { time: '01:00 PM', available: true },
    { time: '01:30 PM', available: true },
    { time: '02:00 PM', available: true },
    { time: '02:30 PM', available: true },
    { time: '03:00 PM', available: true },
    { time: '03:30 PM', available: true },
    { time: '04:00 PM', available: true },
    { time: '04:30 PM', available: true },
    { time: '05:00 PM', available: true },
    { time: '05:30 PM', available: true },
    { time: '06:00 PM', available: true },
    { time: '06:30 PM', available: true },
    { time: '07:00 PM', available: true },
    { time: '07:30 PM', available: true },
    { time: '08:00 PM', available: true },
    { time: '08:30 PM', available: true }
  ];

  // Helpers: determine if a slot can be selected relative to now and selected date
  const isSameCalendarDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return format(d1, 'yyyy-MM-dd') === format(d2, 'yyyy-MM-dd');
  };

  const isSlotInFutureForSelectedDate = (slotTime) => {
    if (!selectedDate) return true;
    // If selected date is not today, all slots are in the future (minDate prevents past dates)
    if (!isSameCalendarDay(selectedDate, new Date())) return true;

    // Parse 'hh:mm AM/PM' and build a Date on selectedDate
    const [time, meridiem] = slotTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    hours = (hours % 12) + (meridiem === 'PM' ? 12 : 0);
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(hours, minutes, 0, 0);
    return slotDateTime.getTime() > Date.now();
  };

  const canSelectSlot = (slot) => {
    if (!slot?.available) return false;
    return isSlotInFutureForSelectedDate(slot.time);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot) => {
    if (canSelectSlot(timeSlot)) {
      setSelectedTimeSlot(timeSlot.time);
    }
  };

  // Handle date range selection
  const onDateChange = (dates) => {
    const [start, end] = dates;
    setSelectedDate(start);
    setEndDate(end);
    setSelectedTimeSlot(null); // Reset time slot when date changes
  };

  const [patient, setpatient] = useState(null)
  const [token, settoken] = useState(null)
  const [logdata, setlogdata] = useState(null)

  useEffect(() => {
    var pgetlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
    var dgetlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
    if (pgetlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(pgetlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
      setpatient(data.userData);
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
  var { id } = useParams()
  const d_id = atob(decodeURIComponent(id))
  // console.log('ID:', id, d_id);

  const [doctor_profile, setdocprofile] = useState(null)

  useEffect(() => {
    setloading(true)
    if (d_id) {
      getdoctordata(d_id)
    }
  }, [d_id])

  const getdoctordata = async (d) => {
    await axios({
      method: 'post',
      url: `${API_BASE_URL}/user/doctors/getone`,
      data: {
        "doctorid": d
      }
    }).then((res) => {
      setdocprofile(res.data.Data)
      // console.log('doctor ', res.data.Data)
    }).catch(function (error) {
      // console.log(error);
    }).finally(() => {
      setloading(false)
    });
  }

  const [show, setShow] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    if (!patient) {
      navigate('/patient')
    }
    else {
      if (!selectedConsultationType) {
        setConsultError(true);
      }
      if (selectedConsultationType === 'clinic_visit' && !selectedHospital) {
        setHospitalError(true);
      }
      if (!selectedConsultationType) {
        return;
      }
      if (selectedConsultationType === 'clinic_visit' && !selectedHospital) {
        return;
      }

      if (!selectedDate || !selectedTimeSlot) {
        Swal.fire({
          title: "Please Select Date & Time",
          text: "You must select both date and time slot before booking.",
          icon: "warning",
          confirmButtonText: 'Ok'
        });
        return;
      }

      setShow(true)
    }
  };

  const handleServiceModalClose = () => setShowServiceModal(false);
  const handleServiceModalShow = (service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  var app_obj = { alt_mobile: '', surgeryid: '', appointment_reason: '', report: [], visit_types: '' }
  const [apt_data, setaptdata] = useState(app_obj)

  function appchangedata(e) {
    const { name, value, type, files } = e.target;
    setaptdata(apt_data => ({
      ...apt_data,
      [name]: type === 'file' ? files : value
    }))
  }

  async function appointmentbtn(id) {
    if (patient) {
      try {
        setloading(true);
        const [datePart, timePart, meridiem] = formattedDateTime.split(' ');
        const timeWithMeridiem = `${timePart} ${meridiem}`;

        let reportUrls = [];

        // Upload report file first if exists
        if (apt_data.report && apt_data.report.length > 0) {
          const formData = new FormData();

          // Handle single or multiple files
          if (apt_data.report instanceof FileList || Array.isArray(apt_data.report)) {
            Array.from(apt_data.report).forEach(file => {
              formData.append('file', file);
            });
          } else {
            formData.append('file', apt_data.report);
          }

          const uploadResponse = await axios.post(
            `${API_BASE_URL}/user/upload/multiple`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              }
            }
          );

          // console.log('Upload Response:', uploadResponse.data);

          // Extract URLs from response
          if (uploadResponse.data.Status === 200 && uploadResponse.data.Data) {
            reportUrls = uploadResponse.data.Data
          }
        }

        // console.log('Report URLs to save:', reportUrls);

        // Now save appointment with uploaded report URLs
        const response = await axios({
          method: 'post',
          url: `${API_BASE_URL}/user/appointments/save`,
          headers: {
            Authorization: token
          },
          data: {
            patientname: patient.name,
            mobile: patient.mobile,
            alt_mobile: apt_data.alt_mobile,
            date: datePart,
            time: timeWithMeridiem,
            surgeryid: apt_data.surgeryid,
            appointment_reason: apt_data.appointment_reason,
            ...(reportUrls.length > 0 && { report: reportUrls }), // Only add report if array is not empty
            doctorid: id,
            visit_types: selectedConsultationType,
            hospital_name: selectedHospital || ''
          }
        });

        Swal.fire({
          title: "Appointment Add Successfully...",
          icon: "success",
          confirmButtonText: 'Ok.'
        }).then((result) => {
          navigate('/patient/appointment');
        });

      } catch (error) {
        // console.error('Error:', error);
        Swal.fire({
          title: "Something Went Wrong.",
          text: error.response?.data?.Message || "Something Is Missing. Please Check Details...",
          icon: "error",
        });
      } finally {
        setloading(false);
      }
    } else {
      // navigate('/patient')
    }
  }
  const formattedDateTime = selectedDate && selectedTimeSlot
    ? format(selectedDate, 'dd-MM-yyyy') + ' ' + selectedTimeSlot
    : selectedDate
      ? format(selectedDate, 'dd-MM-yyyy hh:mm a')
      : '';


  var surg_obj = { patientname: '', mobile: '', alt_name: '', alt_mobile: '', surgeryid: '', date: '', time: '', appointment_reason: '', report: [], doctorid: '', roomtype: '', hospital_name: '' }
  const [addsurgery, setaddsurgery] = useState(surg_obj)
  const [reportFiles, setReportFiles] = useState([])
  const [reportPreviews, setReportPreviews] = useState([])
  const [isUploadingReports, setIsUploadingReports] = useState(false)
  const [single_surg, setsingle_surg] = useState(null)
  const [addshow, setaddshow] = useState(false)
  const [surgeryHospitalError, setSurgeryHospitalError] = useState(false)
  const handleAddSurgeryClose = () => setaddshow(false)
  function handleAddSurgery(surgdata, d_id) {
    var surg_apt_data = { ...addsurgery, surgeryid: surgdata._id, doctorid: d_id, patientname: patient?.name, mobile: patient?.mobile, hospital_name: '' }
    setaddsurgery(surg_apt_data)
    setsingle_surg(surgdata)
    if (!patient) {
      navigate('/patient')
    }
    else {
      setSurgeryHospitalError(false)
      setaddshow(true)
      // setShow(true)
    }
    // console.log(patient, surg_apt_data, surgdata)
  }

  const surghandlechange = (e) => {
    const { name, value } = e.target;
    setaddsurgery(addsurgery => ({
      ...addsurgery,
      [name]: value
    }))
  }

  // Handle multiple report files selection
  const handleReportFilesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setReportFiles(prev => [...prev, ...files]);
      // Create previews for images
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setReportPreviews(prev => [...prev, {
              name: file.name,
              url: e.target.result,
              type: 'image'
            }]);
          };
          reader.readAsDataURL(file);
        } else {
          setReportPreviews(prev => [...prev, {
            name: file.name,
            url: null,
            type: 'file'
          }]);
        }
      });
    }
  };

  // Remove report file
  const removeReportFile = (index) => {
    setReportFiles(prev => prev.filter((_, i) => i !== index));
    setReportPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Upload multiple report files
  const uploadReportFiles = async (files) => {
    if (files.length === 0) return [];

    setIsUploadingReports(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/user/upload/multiple`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      // console.log(response.data)

      if (response.data.Status === 200 && response.data.Data) {
        return response.data.Data.map(item => item.path || item.url);
      }
      return [];
    } catch (error) {
      // console.error('Error uploading report files:', error);
      Swal.fire({
        title: "Upload Error",
        text: error.response.data.Message,
        icon: "error",
      });
      return [];
    } finally {
      setIsUploadingReports(false);
    }
  };

  async function booksurgery(d_id) {

    if (patient) {
      // console.log('book surgery : ',addsurgery, d_id)
      if (!addsurgery?.hospital_name) {
        Swal.fire({
          title: "Please select Hospital",
          icon: "warning",
          confirmButtonText: 'Ok'
        });
        setSurgeryHospitalError(true)
        return;
      }
      // Split at the space before the time
      const [datePart, timePart, meridiem] = formattedDateTime.split(' ');
      // Combine time + meridiem
      const timeWithMeridiem = `${timePart} ${meridiem}`;

      setloading(true)

      try {
        // Upload report files first
        let reportUrls = [];
        if (reportFiles.length > 0) {
          reportUrls = await uploadReportFiles(reportFiles);
        }

        // Prepare surgery data with uploaded report URLs
        var surg_data = {
          ...addsurgery,
          date: datePart,
          time: timeWithMeridiem,
          report: reportUrls // Pass the array of uploaded file URLs
        }

        // console.log('Surgery data with reports:', surg_data)

        const response = await axios({
          method: 'post',
          url: `${API_BASE_URL}/user/surgeryappointments/save`,
          headers: {
            Authorization: token
          },
          data: surg_data
        });

        Swal.fire({
          title: "Surgery Appointment Add Successfully...",
          icon: "success",
          confirmButtonText: 'Ok.'
        }).then((result) => {
          // Clear the form data
          setReportFiles([]);
          setReportPreviews([]);
          setaddsurgery(surg_obj);
          navigate('/patient/surgeries');
        });

      } catch (error) {
        Swal.fire({
          title: "Something Went Wrong.",
          text: "Something Is Missing. Please Check Details...",
          icon: "error",
        });
        // console.log(error)
      } finally {
        setloading(false)
      }
    } else {
      navigate('/patient')
    }
  }


  return (
    <>
      <NavBar logindata={logdata} />
      {/* doctor profile section */}
      <section className='doctor-profile-section' style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
        {doctor_profile && <Container className="py-4">
          <Row>
            {/* Main Content */}
            <Col lg={8}>
              {/* Header Section */}
              <Card className="mb-4 border-0 shadow-sm" style={{ backgroundColor: '#fff', borderRadius: '15px' }}>
                <Card.Body className="p-4">
                  <Row className="align-items-center">
                    <Col md={'auto'}>
                      <div className="position-relative">
                        {doctor_profile.profile_pic === "" ? (
                          <Image
                            src={require("../assets/image/doctor_img.jpg")}
                            roundedCircle
                            className="border border-3 border-white shadow mx-auto"
                            style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                          />
                        ) : (
                          <Image
                            src={doctor_profile?.profile_pic}
                            roundedCircle
                            className="border border-3 border-white shadow mx-auto"
                            style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                            alt={doctor_profile?.name}
                            onError={(e) => {
                              e.target.src = require("../assets/image/doctor_img.jpg");
                            }}
                          />
                        )}
                      </div>
                    </Col>
                    <Col md={7} xl={4} className='mt-3 mt-md-0'>
                      <h3 className="fw-bold">Dr. {doctor_profile.name}</h3>
                      <hr />
                      <p className="text-dark mb-2">{doctor_profile.specialty} ({doctor_profile.qualification})</p>
                      <div className="d-flex align-items-center mb-2">
                        <FaLocationDot className="me-2 text-muted" />
                        <small className="text-muted">{doctor_profile.address || 'Address Not Available'}</small>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <FaEnvelope className="me-2 text-muted" />
                        <small className="text-muted">{doctor_profile.email}</small>
                      </div>
                    </Col>
                    <Col md={12} xl={4} className='ms-xl-auto mt-3 mt-xl-0'>
                      <Row className="g-3">
                        <Col xs={6}>
                          <div className="text-center p-3 bg-white rounded-3 h-100 shadow-sm">
                            <div>
                              <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#d5E1EA', fontSize: '14px' }} >
                                <svg width="21" height="21" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8.96001 0C5.62546 0 2.91455 2.71091 2.91455 6.04545C2.91455 9.31636 5.47273 11.9636 8.80728 12.0782C8.9091 12.0655 9.01091 12.0655 9.08728 12.0782C9.11273 12.0782 9.12546 12.0782 9.15091 12.0782C9.16364 12.0782 9.16364 12.0782 9.17637 12.0782C12.4346 11.9636 14.9927 9.31636 15.0055 6.04545C15.0055 2.71091 12.2946 0 8.96001 0Z" fill="#1C2A3A" />
                                  <path d="M15.4255 15.4639C11.8745 13.0967 6.08364 13.0967 2.50727 15.4639C0.890909 16.5457 0 18.0094 0 19.5748C0 21.1403 0.890909 22.5912 2.49455 23.6603C4.27636 24.8567 6.61818 25.4548 8.96 25.4548C11.3018 25.4548 13.6436 24.8567 15.4255 23.6603C17.0291 22.5785 17.92 21.1276 17.92 19.5494C17.9073 17.9839 17.0291 16.533 15.4255 15.4639Z" fill="#1C2A3A" />
                                  <path d="M22.947 6.79614C23.1507 9.26523 21.3943 11.4289 18.9634 11.7216C22.6801 16.6473 22.2346 16.3418 22.2346 15.8964L22.2474 11.1873C22.2474 6.09636 19.3328 3.18182 14.2419 3.18182L6.491 3.19455C6.04555 3.19455 5.74009 2.74909 5.96918 2.36727C6.92373 0.789091 8.65464 0 11.1874 0H19.3328C23.3928 0 25.4292 2.03636 25.4292 6.09636Z" fill="#1C2A3A" />
                                </svg>


                              </div>
                              <div className="d-flex flex-column mt-1">
                                <span className="fw-bold">{!doctor_profile?.completedappointment ? 0 : doctor_profile?.completedappointment}+</span>
                                <small className="text-muted">Consultant</small>
                              </div>
                            </div>

                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-3 bg-white rounded-3 h-100 shadow-sm">
                            <div>
                              <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#E2E7F2', fontSize: '14px' }} >
                                <svg width="21" height="21" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M14.2418 5.09082H6.09636C5.76545 5.09082 5.44727 5.10355 5.14182 5.14173C1.71818 5.43446 0 7.45809 0 11.1872V16.2781C0 21.369 2.03636 22.3745 6.09636 22.3745H6.60545C6.88545 22.3745 7.25455 22.5654 7.42 22.7817L8.94727 24.8181C9.62182 25.7217 10.7164 25.7217 11.3909 24.8181L12.9182 22.7817C13.1091 22.5272 13.4145 22.3745 13.7327 22.3745H14.2418C17.9709 22.3745 19.9945 20.669 20.2873 17.2326C20.3255 16.9272 20.3382 16.609 20.3382 16.2781V11.1872C20.3382 7.12718 18.3018 5.09082 14.2418 5.09082ZM5.72727 15.2726C5.01455 15.2726 4.45455 14.6999 4.45455 13.9999C4.45455 13.2999 5.02727 12.7272 5.72727 12.7272C6.42727 12.7272 7 13.2999 7 13.9999C7 14.6999 6.42727 15.2726 5.72727 15.2726ZM10.1691 15.2726C9.45636 15.2726 8.89636 14.6999 8.89636 13.9999C8.89636 13.2999 9.46909 12.7272 10.1691 12.7272C10.8691 12.7272 11.4418 13.2999 11.4418 13.9999C11.4418 14.6999 10.8818 15.2726 10.1691 15.2726ZM14.6236 15.2726C13.9109 15.2726 13.3509 14.6999 13.3509 13.9999C13.3509 13.2999 13.9236 12.7272 14.6236 12.7272C15.3236 12.7272 15.8964 13.2999 15.8964 13.9999C15.8964 14.6999 15.3236 15.2726 14.6236 15.2726Z" fill="#3F5FAB" />
                                  <path d="M25.4292 6.09636V11.1873C25.4292 13.7327 24.6401 15.4636 23.0619 16.4182C22.6801 16.6473 22.2346 16.3418 22.2346 15.8964L22.2474 11.1873C22.2474 6.09636 19.3328 3.18182 14.2419 3.18182L6.491 3.19455C6.04555 3.19455 5.74009 2.74909 5.96918 2.36727C6.92373 0.789091 8.65464 0 11.1874 0H19.3328C23.3928 0 25.4292 2.03636 25.4292 6.09636Z" fill="#3F5FAB" />
                                </svg>


                              </div>
                              <div className="d-flex flex-column mt-1">
                                <span className="fw-bold">{!doctor_profile?.surgeriesDetails || doctor_profile?.surgeriesDetails?.length === 0 ? "0" : doctor_profile?.surgeriesDetails?.length}</span>
                                <small className="text-muted">Surgeries</small>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-3 bg-white rounded-3 h-100 shadow-sm">
                            <div>
                              <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#D8F3F1', fontSize: '14px' }} >
                                <svg width="24" height="24" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8.59091 16.5455C13.3355 16.5455 17.1818 12.8416 17.1818 8.27273C17.1818 3.70383 13.3355 0 8.59091 0C3.84628 0 0 3.70383 0 8.27273C0 12.8416 3.84628 16.5455 8.59091 16.5455Z" fill="#12A79D" />
                                  <path d="M13.4147 17.3212C13.8347 17.1048 14.3183 17.423 14.3183 17.8939V24.0667C14.3183 25.2121 13.5165 25.7721 12.5238 25.3012L9.11286 23.6848C8.82013 23.5576 8.36195 23.5576 8.06922 23.6848L4.65831 25.3012C3.66559 25.7594 2.86377 25.1994 2.86377 24.0539L2.88922 17.8939C2.88922 17.423 3.38559 17.1176 3.79286 17.3212C5.23104 18.0467 6.86013 18.4539 8.59104 18.4539C10.322 18.4539 11.9638 18.0467 13.4147 17.3212Z" fill="#12A79D" />
                                </svg>
                              </div>
                              <div className="d-flex flex-column mt-1">
                                <span className="fw-bold">{!doctor_profile?.experience ? '0 Years' : doctor_profile?.experience}</span>
                                <small className="text-muted">Experience</small>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-3 bg-white rounded-3 h-100 shadow-sm">
                            <div>
                              <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#F8EFE1', fontSize: '14px' }} >
                                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10.0713 17.5215C9.73425 17.5327 9.40283 17.614 9.15039 17.7666L6.12109 19.5664C3.9537 20.8466 2.63569 19.8964 3.20605 17.4375L3.92871 14.3193C4.04268 13.711 3.80193 12.887 3.38379 12.4688L0.861328 9.94629C-0.621578 8.46335 -0.140196 6.96817 1.92578 6.61328L5.1582 6.08105C5.70299 5.9922 6.34891 5.51066 6.58984 5.0166L8.37695 1.44141C8.84761 0.512455 9.4572 0.0324938 10.0713 0.000976562V17.5215Z" fill="#FEB052" />
                                  <path d="M10.0713 0.00195312C10.7305 -0.0317732 11.3952 0.452158 11.9004 1.45605L13.6875 5.03027C13.9283 5.52459 14.5751 5.99333 15.1201 6.09473L18.3525 6.62695C20.4182 6.9693 20.8998 8.46541 19.417 9.96094L16.8945 12.4834C16.4764 12.9017 16.2356 13.7257 16.375 14.3213L17.0977 17.4385C17.668 19.8974 16.349 20.8612 14.1816 19.5684L11.1523 17.7686C10.8599 17.5918 10.4618 17.5105 10.0713 17.5234V0.00195312Z" fill="#FEB052" />
                                </svg>




                              </div>
                              <div className="d-flex flex-column mt-1">
                                <span className="fw-bold">{!doctor_profile?.averageRating ? 0 : doctor_profile?.averageRating}</span>
                                <small className="text-muted">Rating</small>
                              </div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* About Me Section */}
              <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">About me</h5>
                  <p className="text-muted mb-0">
                    {doctor_profile?.aboutme}
                  </p>
                </Card.Body>
              </Card>

              {/* Surgeries Section */}
              <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4">Surgeries</h5>
                  <Row className="g-4">
                    {doctor_profile.surgeriesDetails.length === 0 ? <p className='text-muted'>Surgery not added...</p> : doctor_profile.surgeriesDetails.map((surgery, index) => (
                      <Col md={6} key={index}>
                        <Card className="border-1 pointer shadow-sm border-opacity-25 h-100" style={{ borderRadius: '12px' }} onClick={() => handleServiceModalShow(surgery)}>
                          <Card.Body className="p-3">
                            <Row >
                              <Col xs={5}>
                                <Image
                                  src={surgery.surgery_photo || require("../assets/image/doctor_img.jpg")}
                                  style={{ minHeight: 100, maxHeight: 100, objectFit: 'cover' }}
                                  className="border border-2 border-light rounded-3 w-100 h-100"
                                  onError={(e) => {
                                    e.target.src = require("../assets/image/doctor_img.jpg");
                                  }}
                                />
                              </Col>
                              <Col xs={7}>
                                <h6 className="fw-bold mb-1 border-bottom pb-2">{surgery?.name}</h6>
                                <p className="text-muted small mb-1">{surgery?.surgerytypeid?.surgerytypename || 'Surgery Type'}</p>
                                <p className="text-muted small mb-0">{surgery?.days + ' Days of Surgery'}</p>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>

              {/* Hospitals Section */}
              <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4">Hospitals</h5>
                  <Row className="g-3">
                    {
                      doctor_profile.hospitals.map((v, i) => {
                        return (
                          <Col md={6} key={i}>
                            <Card className="border-1 border-opacity-25 shadow-sm h-100" style={{ borderRadius: '12px' }}>
                              <Card.Body className="p-3">
                                <div>
                                  <h6 className="fw-bold mb-1 pb-2 border-bottom">{v.name}</h6>
                                  <p className="text-muted small m-0">
                                    <BsGeoAlt className="text-dark me-2" /> {v.address}
                                  </p>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        )
                      })
                    }
                  </Row>
                </Card.Body>
              </Card>

              {/* Reviews Section */}
              <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4">Reviews</h5>
                  {
                    doctor_profile?.allReviewData?.length > 0 ? (
                      doctor_profile?.allReviewData?.map((v, i) => {
                        return (
                          <div className='card p-3 shadow mb-3' key={i}>
                            <div className="d-flex align-items-center pb-2 border-bottom">
                              <Image
                                src={v?.createdBy?.profile_pic || require("../assets/image/doctor_img.jpg")}
                                roundedCircle
                                width={50}
                                height={50}
                                className="me-3 review_pic"
                              />
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center mt-1">
                                  <h6 className="fw-bold mb-1">{v?.appointmentid?.patientname}</h6>
                                  <div className='ms-auto'>
                                    {[...Array(5)].map((_, idx) => {
                                      const num = Number(v?.rating);
                                      const clamped = Number.isFinite(num) ? Math.max(0, Math.min(5, num)) : 0;
                                      const filled = Math.round(clamped);
                                      return (
                                        <BsStarFill
                                          key={idx}
                                          className={(idx < filled ? 'text-warning' : 'text-secondary') + ' me-1'}
                                          size={14}
                                        />
                                      );
                                    })}
                                    <span className="small text-muted ms-2">
                                      {Number.isFinite(Number(v?.rating)) ? Number(v?.rating).toFixed(1) : '0.0'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <p className="mt-3 mb-0">
                              {v?.description}
                            </p>
                          </div>
                        )
                      })
                    ) : (
                      <p>No reviews available</p>
                    )
                  }

                </Card.Body>
              </Card>
            </Col>

            {/* Sidebar - Book Consultation */}
            <Col lg={4}>
              <div>
                {/* Consultation Type Selection */}
                <Card className="mb-4 border-0 p-4 shadow-sm" style={{ borderRadius: '15px', backgroundColor: 'transparent' }}>
                  <Card.Body className="p-0">
                    <h5 className="fw-bold mb-4 text-center">Select Consultation Type</h5>
                    <Row className={`g-3`}>
                      <Col xs={4}>
                        <input
                          type="radio"
                          name="consultationType"
                          value="clinic_visit"
                          checked={selectedConsultationType === 'clinic_visit'}
                          onChange={(e) => { setSelectedConsultationType(e.target.value); setConsultError(false); setaptdata({ ...apt_data, visit_types: e.target.value }); }}
                          className="d-none"
                          id="clinic_visit"
                        />

                        <label
                          htmlFor="clinic_visit"
                          className={`text-center check_room_type p-3 bg-white rounded-3 h-100 shadow-sm d-block cursor-pointer ${selectedConsultationType === 'clinic_visit' ? 'active' : ''
                            }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div>
                            <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#F8EFE1', fontSize: '14px' }} >
                              <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.8125 0.390625H11.8125C12.057 0.390625 12.292 0.487271 12.4648 0.660156C12.6377 0.833042 12.7344 1.068 12.7344 1.3125V7.89062H18.5625C18.807 7.89062 19.042 7.98727 19.2148 8.16016C19.3877 8.33304 19.4844 8.568 19.4844 8.8125V16.8906H20.8125C20.8581 16.8906 20.9014 16.9092 20.9336 16.9414C20.9658 16.9736 20.9844 17.0169 20.9844 17.0625C20.9844 17.1081 20.9658 17.1514 20.9336 17.1836C20.9014 17.2158 20.8581 17.2344 20.8125 17.2344H0.5625C0.516915 17.2344 0.473638 17.2158 0.441406 17.1836C0.409174 17.1514 0.390625 17.1081 0.390625 17.0625C0.390625 17.0169 0.409174 16.9736 0.441406 16.9414C0.473638 16.9092 0.516915 16.8906 0.5625 16.8906H1.89062V1.3125C1.89063 1.068 1.98727 0.833041 2.16016 0.660156C2.33304 0.487271 2.568 0.390625 2.8125 0.390625ZM2.8125 0.734375C2.65917 0.734375 2.51174 0.7949 2.40332 0.90332C2.2949 1.01174 2.23438 1.15917 2.23438 1.3125V16.8906H4.89062V11.8125C4.89062 11.7669 4.90917 11.7236 4.94141 11.6914C4.97364 11.6592 5.01692 11.6406 5.0625 11.6406H9.5625C9.60809 11.6406 9.65136 11.6592 9.68359 11.6914C9.71583 11.7236 9.73438 11.7669 9.73438 11.8125V16.8906H12.3906V1.3125C12.3906 1.19771 12.3566 1.08636 12.2939 0.992188L12.2217 0.90332L12.1328 0.831055C12.0386 0.768399 11.9273 0.734375 11.8125 0.734375H2.8125ZM5.23438 16.8906H9.39062V11.9844H5.23438V16.8906ZM12.7344 16.8906H19.1406V8.8125C19.1406 8.69771 19.1066 8.58636 19.0439 8.49219L18.9717 8.40332L18.8828 8.33105C18.7886 8.2684 18.6773 8.23438 18.5625 8.23438H12.7344V16.8906ZM7.3125 3.39062C7.35808 3.39062 7.40136 3.40917 7.43359 3.44141C7.46583 3.47364 7.48438 3.51692 7.48438 3.5625V5.64062H9.5625C9.60808 5.64062 9.65136 5.65917 9.68359 5.69141C9.71583 5.72364 9.73438 5.76692 9.73438 5.8125C9.73438 5.85808 9.71583 5.90136 9.68359 5.93359C9.65136 5.96583 9.60808 5.98438 9.5625 5.98438H7.48438V8.0625C7.48438 8.10808 7.46583 8.15136 7.43359 8.18359C7.40136 8.21583 7.35808 8.23438 7.3125 8.23438C7.26692 8.23438 7.22364 8.21583 7.19141 8.18359C7.15917 8.15136 7.14062 8.10808 7.14062 8.0625V5.98438H5.0625C5.01692 5.98438 4.97364 5.96583 4.94141 5.93359C4.90917 5.90136 4.89062 5.85808 4.89062 5.8125C4.89062 5.76692 4.90917 5.72364 4.94141 5.69141C4.97364 5.65917 5.01692 5.64062 5.0625 5.64062H7.14062V3.5625C7.14062 3.51692 7.15917 3.47364 7.19141 3.44141C7.22364 3.40917 7.26692 3.39062 7.3125 3.39062Z" fill="black" stroke="#FBB03F" stroke-width="0.78125" />
                              </svg>
                            </div>
                            <div className="d-flex flex-column mt-1">
                              <span className="fw-bold">Clinic Visit</span>
                              <small className="text-muted">₹{doctor_profile?.consultationsDetails === null ? 0 : doctor_profile?.consultationsDetails?.clinic_visit_price}</small>
                            </div>
                          </div>
                        </label>
                      </Col>
                      <Col xs={4}>
                        <input
                          type="radio"
                          name="consultationType"
                          value="home_visit"
                          checked={selectedConsultationType === 'home_visit'}
                          onChange={(e) => { setSelectedConsultationType(e.target.value); setConsultError(false); setSelectedHospital(''); setHospitalError(false); setaptdata({ ...apt_data, visit_types: e.target.value }); }}
                          className="d-none"
                          id="home_visit"
                        />

                        <label
                          htmlFor="home_visit"
                          className={`text-center p-3 bg-white check_room_type rounded-3 h-100 shadow-sm d-block cursor-pointer ${selectedConsultationType === 'home_visit' ? 'active' : ''
                            }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div>
                            <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#D8F3F1', fontSize: '14px' }} >
                              <svg width="20" height="19" viewBox="0 0 20 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.5498 17.8719H4.5498C3.48894 17.8719 2.47152 17.4505 1.72138 16.7003C0.971232 15.9502 0.549805 14.9328 0.549805 13.8719V7.57989C0.54979 6.8921 0.727121 6.21593 1.06467 5.61668C1.40222 5.01742 1.88859 4.51533 2.4768 4.15889L7.4768 1.12889C8.10192 0.750083 8.81887 0.549805 9.5498 0.549805C10.2807 0.549805 10.9977 0.750083 11.6228 1.12889L16.6228 4.15889C17.2109 4.51524 17.6971 5.01718 18.0347 5.61624C18.3722 6.21531 18.5496 6.89127 18.5498 7.57889V13.8719C18.5498 14.9328 18.1284 15.9502 17.3782 16.7003C16.6281 17.4505 15.6107 17.8719 14.5498 17.8719H12.5498M6.5498 17.8719V13.8719C6.5498 13.0762 6.86587 12.3132 7.42848 11.7506C7.99109 11.188 8.75416 10.8719 9.5498 10.8719C10.3455 10.8719 11.1085 11.188 11.6711 11.7506C12.2337 12.3132 12.5498 13.0762 12.5498 13.8719V17.8719M6.5498 17.8719H12.5498" stroke="#12A79D" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" />
                              </svg>

                            </div>
                            <div className="d-flex flex-column mt-1">
                              <span className="fw-bold">Home Visit</span>
                              <small className="text-muted">₹{doctor_profile?.consultationsDetails === null ? 0 : doctor_profile?.consultationsDetails?.home_visit_price}</small>
                            </div>
                          </div>
                        </label>
                      </Col>
                      <Col xs={4}>
                        <input
                          type="radio"
                          name="consultationType"
                          value="eopd"
                          checked={selectedConsultationType === 'eopd'}
                          onChange={(e) => { setSelectedConsultationType(e.target.value); setConsultError(false); setSelectedHospital(''); setHospitalError(false); setaptdata({ ...apt_data, visit_types: e.target.value }); }}
                          className="d-none"
                          id="eopd"
                        />

                        <label
                          htmlFor="eopd"
                          className={`text-center p-3 bg-white check_room_type rounded-3 h-100 shadow-sm d-block cursor-pointer ${selectedConsultationType === 'eopd' ? 'active' : ''
                            }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div>
                            <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#E2E7F2', fontSize: '14px' }} >
                              <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.5498 0.549805H4.0498C2.11681 0.549805 0.549805 2.11681 0.549805 4.0498V9.0498C0.549805 10.9828 2.11681 12.5498 4.0498 12.5498H10.5498C12.4828 12.5498 14.0498 10.9828 14.0498 9.0498V4.0498C14.0498 2.11681 12.4828 0.549805 10.5498 0.549805Z" stroke="#3F5FAB" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M14.0498 4.29001L17.6038 2.52001C17.7563 2.44404 17.9256 2.40827 18.0958 2.4161C18.2659 2.42392 18.4313 2.47509 18.5761 2.56474C18.7209 2.65439 18.8405 2.77955 18.9234 2.92835C19.0063 3.07715 19.0498 3.24467 19.0498 3.41501V9.68301C19.0499 9.85348 19.0064 10.0211 18.9234 10.1701C18.8405 10.319 18.7208 10.4443 18.5758 10.5339C18.4309 10.6236 18.2654 10.6747 18.095 10.6825C17.9247 10.6902 17.7553 10.6542 17.6028 10.578L14.0498 8.80501V4.29001Z" stroke="#3F5FAB" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" />
                              </svg>

                            </div>
                            <div className="d-flex flex-column mt-1">
                              <span className="fw-bold">EOPD</span>
                              <small className="text-muted">₹{doctor_profile?.consultationsDetails === null ? 0 : doctor_profile?.consultationsDetails?.eopd_price}</small>
                            </div>
                          </div>
                        </label>
                      </Col>
                    </Row>
                    {consultError && <div className="text-danger small text-center mb-2">Please select consultation type</div>}
                  </Card.Body>
                </Card>

                {/* Select Hospital - only for Clinic Visit */}
                {selectedConsultationType === 'clinic_visit' && (
                  <Card className={`border-0 shadow-sm ${hospitalError ? 'error-outline' : ''}`} style={{ borderRadius: '15px' }}>
                    <Card.Body className="p-4">
                      <h5 className="fw-bold mb-4 text-center">Select Hospital</h5>
                      {hospitalError && <div className="text-danger small text-center mb-2">Please select hospital</div>}
                      <Row className="g-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {doctor_profile?.hospitals?.map((hospital, index) => (
                          <Col xs={12} key={index}>
                            <label
                              htmlFor={`hospital_${index}`}
                              className={`hospital-option w-100 ${selectedHospital === hospital.name ? 'selected' : ''}`}
                            >
                              <input
                                type="radio"
                                id={`hospital_${index}`}
                                name="hospital"
                                value={hospital.name}
                                checked={selectedHospital === hospital.name}
                                onChange={(e) => { setSelectedHospital(e.target.value); setHospitalError(false); }}
                                className="visually-hidden"
                              />

                              <div className="d-flex align-items-start p-3">
                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center mb-1">
                                    <div className="hospital-dot me-2"></div>
                                    <h6 className="mb-0">{hospital.name}</h6>
                                  </div>
                                </div>
                                <div className="ms-2 align-self-start">
                                  <span className={`badge ${selectedHospital === hospital.name ? 'bg-primary' : 'bg-light text-dark border'}`}>
                                    {selectedHospital === hospital.name ? 'Selected' : 'Choose'}
                                  </span>
                                </div>
                              </div>
                            </label>
                          </Col>
                        ))}
                      </Row>
                    </Card.Body>
                  </Card>
                )}

                {/* Book Consultation Card */}
                <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                  <Card.Body className="p-4">
                    <h5 className="fw-bold mb-4 text-center">Book Consultation</h5>

                    {/* Select Date with DatePicker */}
                    <div className="mb-4">
                      <h6 className="fw-bold mb-3">Select Date & Time</h6>
                      <div className="custom-datepicker-container w-100">
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date) => {
                            setSelectedDate(date);
                            setSelectedTimeSlot(null); // Reset time slot when date changes
                          }}
                          inline
                          minDate={new Date()}
                          className="form-control"
                          calendarClassName="custom-calendar"
                          style={{ width: "100%" }}
                        />

                        {/* Time Slots Below Calendar */}
                        <div className="time-slots-container mt-3 p-3" style={{
                          backgroundColor: '#f8f9fa',
                          borderRadius: '8px',
                          border: '1px solid #e9ecef'
                        }}>
                          <h6 className="fw-bold mb-3 text-center">Select Hour</h6>
                          {selectedDate ? (
                            <div>
                              <Row className="g-2">
                                {timeSlots.map((slot, index) => (
                                  <Col xs={4} key={index}>
                                    <Button
                                      variant={
                                        selectedTimeSlot === slot.time
                                          ? "dark"
                                          : canSelectSlot(slot)
                                            ? "light"
                                            : "outline-secondary"
                                      }
                                      size="sm"
                                      className="w-100 btn-hour"
                                      disabled={!canSelectSlot(slot)}
                                      onClick={() => handleTimeSlotSelect(slot)}
                                      style={{
                                        opacity: canSelectSlot(slot) ? 1 : 0.5,
                                        cursor: canSelectSlot(slot) ? 'pointer' : 'not-allowed',
                                        fontSize: '12px',
                                        padding: '8px 4px'
                                      }}
                                    >
                                      {slot.time}
                                      {!slot.available && ' (Booked)'}
                                    </Button>
                                  </Col>
                                ))}
                              </Row>
                              {selectedTimeSlot && (
                                <div className="mt-3 p-2 bg-success bg-opacity-10 rounded text-center">
                                  <small className="text-success fw-bold">
                                    ✓ Selected: {format(selectedDate, 'dd/MM/yyyy')} at {selectedTimeSlot}
                                  </small>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-muted text-center py-3">
                              <small>Select a date above to view available time slots</small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Book Button */}
                    <Button
                      variant="dark"
                      className="w-100 rounded-pill py-3 fw-bold"
                      onClick={handleShow}
                    >
                      Book Consultation
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>}
      </section>
      <FooterBar />
      {loading ? <Loader /> : ''}

      {/* Existing Modals */}
      {patient && doctor_profile && (
        <Modal show={show} size="lg" onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Book Appointment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-4">
              <Col xs={12}>
                <Form>
                  <Row className="g-4">
                    <Col xs={4}>
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        value={patient.name}
                        disabled
                      ></Form.Control>
                    </Col>
                    <Col xs={4}>
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        value={patient.mobile}
                        disabled
                      ></Form.Control>
                    </Col>
                    <Col xs={4}>
                      <Form.Label>Alt Phone Number</Form.Label>
                      <Form.Control
                        value={apt_data.alt_mobile}
                        name="alt_mobile"
                        onChange={appchangedata}
                        placeholder="Alt. Phone Number"
                      ></Form.Control>
                    </Col>
                    {/* <Col xs={4}>
                      <Form.Label>Surgery</Form.Label>
                      <Form.Select name="surgeryid" onChange={appchangedata}>
                        <option value="">Select Surgery</option>
                        {doctor_profile.surgeriesDetails.map((v, i) => {
                          return (
                            <option value={v._id} key={i}>
                              {v.name}
                            </option>
                          );
                        })}
                      </Form.Select>
                    </Col> */}
                    <Col xs={4}>
                      <Form.Label>Reason</Form.Label>
                      <Form.Control
                        value={apt_data.appointment_reason}
                        name="appointment_reason"
                        onChange={appchangedata}
                        placeholder="Appointment Reason"
                      ></Form.Control>
                    </Col>
                    <Col xs={4}>
                      <Form.Label>Reports</Form.Label>
                      <Form.Control type='file' name='report' onChange={appchangedata}></Form.Control>
                    </Col>
                  </Row>
                </Form>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => {
                appointmentbtn(doctor_profile._id);
                handleClose();
              }}
            >
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Service Detail Modal */}
      {selectedService && (
        <Modal
          show={showServiceModal}
          size="xl"
          onHide={handleServiceModalClose}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Surgery Details - {selectedService?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="p-2 rounded-3 border rounded surgery_model" style={{ background: 'var(--white)' }}>
              <Row className="align-items-center">
                <Col xs={12} md={8}>
                  <div className="d-flex align-items-start gap-4">
                    <div>
                      <img src={selectedService?.surgery_photo} alt={`surgery photo of ${selectedService?.name}`} />
                    </div>
                    <div>
                      <h5>{selectedService?.name}</h5>
                      <span className="text-muted small">Surgery Type:</span>
                      <p className="fw-medium">{selectedService?.surgerytype}</p>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={4}>
                  <Row className="g-0 justify-content-center">
                    <Col xs={6}>
                      <div className="text-center p-1 h-100">
                        <div>
                          <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#d5E1EA', fontSize: '14px' }} >
                            <svg width="21" height="21" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8.96001 0C5.62546 0 2.91455 2.71091 2.91455 6.04545C2.91455 9.31636 5.47273 11.9636 8.80728 12.0782C8.9091 12.0655 9.01091 12.0655 9.08728 12.0782C9.11273 12.0782 9.12546 12.0782 9.15091 12.0782C9.16364 12.0782 9.16364 12.0782 9.17637 12.0782C12.4346 11.9636 14.9927 9.31636 15.0055 6.04545C15.0055 2.71091 12.2946 0 8.96001 0Z" fill="#1C2A3A" />
                              <path d="M15.4255 15.4639C11.8745 13.0967 6.08364 13.0967 2.50727 15.4639C0.890909 16.5457 0 18.0094 0 19.5748C0 21.1403 0.890909 22.5912 2.49455 23.6603C4.27636 24.8567 6.61818 25.4548 8.96 25.4548C11.3018 25.4548 13.6436 24.8567 15.4255 23.6603C17.0291 22.5785 17.92 21.1276 17.92 19.5494C17.9073 17.9839 17.0291 16.533 15.4255 15.4639Z" fill="#1C2A3A" />
                              <path d="M22.947 6.79614C23.1507 9.26523 21.3943 11.4289 18.9634 11.7216C18.9507 11.7216 18.9507 11.7216 18.9379 11.7216H18.8997C18.8234 11.7216 18.747 11.7216 18.6834 11.747C17.4488 11.8107 16.3161 11.4161 15.4634 10.6907C16.7743 9.51977 17.5252 7.76341 17.3725 5.85432C17.2834 4.82341 16.927 3.88159 16.3925 3.07977C16.8761 2.83795 17.4361 2.68523 18.0088 2.63432C20.5034 2.41795 22.7307 4.27614 22.947 6.79614Z" fill="#1C2A3A" />
                              <path d="M25.4929 18.5692C25.391 19.8038 24.6019 20.8729 23.2783 21.5983C22.0056 22.2983 20.4019 22.6292 18.811 22.5911C19.7274 21.7638 20.2619 20.7329 20.3638 19.6383C20.491 18.0602 19.7401 16.5456 18.2383 15.3365C17.3856 14.662 16.3929 14.1274 15.311 13.7329C18.1238 12.9183 21.6619 13.4656 23.8383 15.222C25.0092 16.1638 25.6074 17.3474 25.4929 18.5692Z" fill="#1C2A3A" />
                            </svg>
                          </div>
                          <div className="d-flex flex-column mt-1">
                            <span className="fw-bold">{selectedService?.completed_surgery}</span>
                            <small className="text-muted">Surgery Done</small>
                          </div>
                        </div>

                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center p-1 h-100">
                        <div>
                          <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#E2E7F2', fontSize: '14px' }} >
                            <svg width="21" height="21" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M14.2418 5.09082H6.09636C5.76545 5.09082 5.44727 5.10355 5.14182 5.14173C1.71818 5.43446 0 7.45809 0 11.1872V16.2781C0 21.369 2.03636 22.3745 6.09636 22.3745H6.60545C6.88545 22.3745 7.25455 22.5654 7.42 22.7817L8.94727 24.8181C9.62182 25.7217 10.7164 25.7217 11.3909 24.8181L12.9182 22.7817C13.1091 22.5272 13.4145 22.3745 13.7327 22.3745H14.2418C17.9709 22.3745 19.9945 20.669 20.2873 17.2326C20.3255 16.9272 20.3382 16.609 20.3382 16.2781V11.1872C20.3382 7.12718 18.3018 5.09082 14.2418 5.09082ZM5.72727 15.2726C5.01455 15.2726 4.45455 14.6999 4.45455 13.9999C4.45455 13.2999 5.02727 12.7272 5.72727 12.7272C6.42727 12.7272 7 13.2999 7 13.9999C7 14.6999 6.42727 15.2726 5.72727 15.2726ZM10.1691 15.2726C9.45636 15.2726 8.89636 14.6999 8.89636 13.9999C8.89636 13.2999 9.46909 12.7272 10.1691 12.7272C10.8691 12.7272 11.4418 13.2999 11.4418 13.9999C11.4418 14.6999 10.8818 15.2726 10.1691 15.2726ZM14.6236 15.2726C13.9109 15.2726 13.3509 14.6999 13.3509 13.9999C13.3509 13.2999 13.9236 12.7272 14.6236 12.7272C15.3236 12.7272 15.8964 13.2999 15.8964 13.9999C15.8964 14.6999 15.3236 15.2726 14.6236 15.2726Z" fill="#3F5FAB" />
                              <path d="M25.4292 6.09636V11.1873C25.4292 13.7327 24.6401 15.4636 23.0619 16.4182C22.6801 16.6473 22.2346 16.3418 22.2346 15.8964L22.2474 11.1873C22.2474 6.09636 19.3328 3.18182 14.2419 3.18182L6.491 3.19455C6.04555 3.19455 5.74009 2.74909 5.96918 2.36727C6.92373 0.789091 8.65464 0 11.1874 0H19.3328C23.3928 0 25.4292 2.03636 25.4292 6.09636Z" fill="#3F5FAB" />
                            </svg>
                          </div>
                          <div className="d-flex flex-column mt-1">
                            <span className="fw-bold">{selectedService?.yearsof_experience}</span>
                            <small className="text-muted">Surgery Experience</small>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="text-center p-1  h-100">
                        <div>
                          <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#D8F3F1', fontSize: '14px' }} >
                            <svg width="24" height="24" viewBox="0 0 18 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8.59091 16.5455C13.3355 16.5455 17.1818 12.8416 17.1818 8.27273C17.1818 3.70383 13.3355 0 8.59091 0C3.84628 0 0 3.70383 0 8.27273C0 12.8416 3.84628 16.5455 8.59091 16.5455Z" fill="#12A79D" />
                              <path d="M13.4147 17.3212C13.8347 17.1048 14.3183 17.423 14.3183 17.8939V24.0667C14.3183 25.2121 13.5165 25.7721 12.5238 25.3012L9.11286 23.6848C8.82013 23.5576 8.36195 23.5576 8.06922 23.6848L4.65831 25.3012C3.66559 25.7594 2.86377 25.1994 2.86377 24.0539L2.88922 17.8939C2.88922 17.423 3.38559 17.1176 3.79286 17.3212C5.23104 18.0467 6.86013 18.4539 8.59104 18.4539C10.322 18.4539 11.9638 18.0467 13.4147 17.3212Z" fill="#12A79D" />
                            </svg>
                          </div>
                          <div className="d-flex flex-column mt-1">
                            <span className="fw-bold">{selectedService?.days}</span>
                            <small className="text-muted">Stays Days</small>
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col xs={12} md={8}>
                  <h6>Description</h6>
                  <p className="text-muted">{selectedService?.description}</p>
                </Col>
                <Col xs={12} md={4}>
                  <Row className="g-2">
                    <Col xs={6}>
                      <div className="bg-success-subtle p-2 rounded-3 text-center">
                        <span className="small text-muted">General Price</span>
                        <p className="fw-bold m-0">{selectedService?.general_price}</p>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="bg-success-subtle p-2 rounded-3 text-center">
                        <span className="small text-muted">Semi-Private Price</span>
                        <p className="fw-bold m-0">{selectedService?.semiprivate_price}</p>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="bg-success-subtle p-2 rounded-3 text-center">
                        <span className="small text-muted">Private Price</span>
                        <p className="fw-bold m-0">{selectedService?.private_price}</p>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="bg-success-subtle p-2 rounded-3 text-center">
                        <span className="small text-muted">Delux Price</span>
                        <p className="fw-bold m-0">{selectedService?.delux_price}</p>
                      </div>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <hr />
              <div>
                <h6>Additional Facility</h6>
                <div className="d-flex flex-wrap gap-2">
                  {
                    selectedService?.additional_features?.split(',')?.map((feature, index) => {

                      return (
                        <Badge
                          className={`me-1 bg-secondary-subtle text-dark fs-7 fw-normal px-3 py-2`}
                          key={index}
                        >
                          {feature}
                        </Badge>
                      );
                    })
                  }
                </div>
              </div>
              <hr />
              <Row>
                <Col xs={12} md={6}>
                  <h6>Included</h6>
                  {selectedService?.inclusive ? (
                    <ul className="list-unstyled mb-0">
                      {selectedService.inclusive.split(', ').map((item, index) => (
                        <li key={index} className="mb-1">
                          <svg width="15" height="10" viewBox="0 0 15 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.16669 5.00016L5.33335 9.16683L13.6667 0.833496" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>

                          <span className="ms-2 text-muted small">{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">No inclusive items specified</p>
                  )
                }
                </Col>
                <Col xs={12} md={6}>
                  <h6>Excluded</h6>
                  {selectedService?.exclusive ? (
                    <ul className="list-unstyled mb-0">
                      {selectedService.exclusive.split(',').map((item, index) => (
                        <li key={index} className="mb-1">
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 5L5 15" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5 5L15 15" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>

                          <span className="ms-2 text-muted small">{item.trim()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted mb-0">No exclusive items specified</p>
                  )}
                </Col>
              </Row>
            </div>
            {/* <Container fluid>
              <Row className="g-4">
                <Col md={4}>
                  <Card className="h-100">
                    <Card.Header>
                      <h6 className="mb-0">Service Image</h6>
                    </Card.Header>
                    <Card.Body className="d-flex flex-column justify-content-around">
                      <div className="text-center">
                        {selectedService.surgery_photo ? (
                          <Image
                            src={selectedService.surgery_photo}
                            alt={selectedService.name}
                            fluid
                            rounded
                            className="mb-3"
                            style={{ maxHeight: "200px" }}
                          />
                        ) : (
                          <div
                            className="bg-light p-4 rounded mb-3"
                            style={{
                              height: "200px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span className="text-muted">No image available</span>
                          </div>
                        )}
                        <p><strong>Surgery Type:</strong> {selectedService.surgery_type || "Not specified"}</p>
                        <p><strong>Duration:</strong> {selectedService.days || "Not specified"} days</p>
                        <p><strong>Price:</strong> ₹{selectedService.price || "Contact for pricing"}</p>
                      </div>
                      <div className="d-flex justify-content-center">
                        <Button
                          variant="primary"
                          onClick={() => {
                            handleAddSurgery(selectedService, doctor_profile._id)
                            handleServiceModalClose()
                          }}
                        >
                          Book Appointment for this Service
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={8}>
                  <Card>
                    <Card.Header>
                      <h6 className="mb-0">Service Information</h6>
                    </Card.Header>
                    <Card.Body>
                      <Row className='gy-2'>
                        <Col xs={2}><strong>Name:</strong></Col>
                        <Col xs={10}>{selectedService.name}</Col>
                        <Col xs={2}><strong>Description:</strong></Col>
                        <Col xs={10}>{selectedService.description || "No description available"}</Col>
                        <Col xs={2}><strong>Features:</strong></Col>
                        <Col xs={10}>{selectedService.features || "No features listed"}</Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <Row className='mt-3'>
                    <Col xs={12} md={6}>
                      <Card className='bg-success-subtle'>
                        <Card.Header>
                          <h6 className="mb-0">Inclusive</h6>
                        </Card.Header>
                        <Card.Body>
                          <ul>
                            {
                              selectedService?.inclusive?.split(',').map((v, i) => (
                                <li key={i} className="mb-1">
                                  <svg width="15" height="10" viewBox="0 0 15 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.16669 5.00016L5.33335 9.16683L13.6667 0.833496" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>

                                  <span className="ms-2">{v.trim()}</span>
                                </li>
                              ))
                            }
                          </ul>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col xs={12} md={6}>
                      <Card className='bg-danger-subtle'>
                        <Card.Header>
                          <h6 className="mb-0">Exclusive</h6>
                        </Card.Header>
                        <Card.Body>
                          <ul>
                            {
                              selectedService.exclusive.split(',').map((v, i) => (
                                <li key={i} className="mb-1">
                                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 5L5 15" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M5 5L15 15" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>

                                  <span className="ms-2">{v.trim()}</span>
                                </li>
                              ))
                            }
                          </ul>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Container> */}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={() => {
                handleAddSurgery(selectedService, doctor_profile._id)
                handleServiceModalClose()
              }}
            >
              Book Appointment for this Surgery
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Surgery Appointment Modal */}
      <Modal show={addshow} onHide={handleAddSurgeryClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Book Surgery Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='text-center fs-5 mb-3'>
            <p><b>Surgery:</b> {single_surg?.name}</p>
          </div>
          <Form className='row g-3'>
            <Form.Group className='col-6'>
              <Form.Label>Patient Name</Form.Label>
              <Form.Control type="text" name='patientname' value={addsurgery?.patientname} disabled />
            </Form.Group>
            <Form.Group className='col-6'>
              <Form.Label>Mobile No</Form.Label>
              <Form.Control type="text" name='mobile' value={addsurgery?.mobile} disabled />
            </Form.Group>
            <Form.Group className='col-6'>
              <Form.Label>Alt Name</Form.Label>
              <Form.Control type="text" name='alt_name' value={addsurgery?.alt_name} onChange={surghandlechange} />
            </Form.Group>
            <Form.Group className='col-6'>
              <Form.Label>Alt Mobile No</Form.Label>
              <Form.Control type="text" name='alt_mobile' value={addsurgery?.alt_mobile} onChange={surghandlechange} />
            </Form.Group>
            <Form.Group className='col-6'>
              <Form.Label>Hospital</Form.Label>
              <Form.Select
                name='hospital_name'
                value={addsurgery?.hospital_name || ''}
                onChange={(e) => { surghandlechange(e); setSurgeryHospitalError(false); }}
              >
                <option value=''>Select Hospital</option>
                {doctor_profile?.hospitals?.map((v, i) => (
                  <option key={i} value={v?.name}>{v?.name}</option>
                ))}
              </Form.Select>
              {surgeryHospitalError && <div className="text-danger small mt-1">Please select hospital</div>}
            </Form.Group>
            <Form.Group className='col-4'>
              <Form.Label>Room Type</Form.Label>
              <div>
                <Form.Check
                  name="roomtype"
                  type="radio"
                  value="General"
                  id='label-1'
                  onChange={surghandlechange}
                  label={`General - ₹${single_surg?.general_price || 'N/A'}`}
                />

                <Form.Check
                  name="roomtype"
                  type="radio"
                  value="Semiprivate"
                  id='label-2'
                  onChange={surghandlechange}
                  label={`SemiPrivate - ₹${single_surg?.semiprivate_price || 'N/A'}`}
                />
                <Form.Check
                  name="roomtype"
                  type="radio"
                  value="Private"
                  id='label-3'
                  onChange={surghandlechange}
                  label={`Private - ₹${single_surg?.private_price || 'N/A'}`}
                />
                <Form.Check
                  name="roomtype"
                  type="radio"
                  value="Delux"
                  id='label-4'
                  onChange={surghandlechange}
                  label={`Delux - ₹${single_surg?.delux_price || 'N/A'}`}
                />
              </div>
            </Form.Group>
            <Form.Group className='col-8'>
              <Form.Label>Appointment Date & Time</Form.Label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                inline
                showTimeSelect
                timeFormat="hh:mm a"
                timeIntervals={15}
                dateFormat="dd-MM-yyyy hh:mm a"
                placeholderText="Select date and time"
                minDate={addDays(new Date(), 3)}
                className="form-control"
              />
            </Form.Group>
            <Form.Group className='col-4'>
              <Form.Label>Reports</Form.Label>
              <input
                type="file"
                className="form-control"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleReportFilesChange}
              />
              {reportPreviews.length > 0 && (
                <div className="d-flex flex-wrap mt-2 gap-2">
                  {reportPreviews.map((preview, index) => (
                    <div key={index} className="position-relative">
                      {preview.type === 'image' ? (
                        <img
                          src={preview.url}
                          alt={`Report ${index + 1}`}
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          className="img-thumbnail"
                        />
                      ) : (
                        <div
                          className="d-flex align-items-center justify-content-center img-thumbnail"
                          style={{ width: '80px', height: '80px', fontSize: '12px' }}
                        >
                          📄<br />{preview.name.substring(0, 8)}...
                        </div>
                      )}
                      <button
                        type="button"
                        className="btn-close position-absolute top-0 end-0"
                        onClick={() => removeReportFile(index)}
                        style={{ fontSize: '10px' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>

            <Form.Group className='col-8'>
              <Form.Label>Appointment Reason</Form.Label>
              <Form.Control as="textarea" name='appointment_reason' value={addsurgery?.appointment_reason} onChange={surghandlechange} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='primary'
            onClick={() => booksurgery(doctor_profile._id)}
            disabled={isUploadingReports}
          >
            {isUploadingReports ? 'Uploading Reports...' : 'Book Surgery Appointment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default DoctorProfilePage