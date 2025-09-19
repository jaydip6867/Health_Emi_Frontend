import { useEffect, useState } from 'react'
import NavBar from './Component/NavBar'
import { Card, Col, Container, Row, Button, Image, Form, Modal } from 'react-bootstrap'
import FooterBar from './Component/FooterBar'
import Loader from '../Loader'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import './css/visitor.css'
import { FaEnvelope, FaPhone, FaRegDotCircle } from 'react-icons/fa'
import { BsStarFill, BsGeoAlt } from 'react-icons/bs'
import { format } from 'date-fns';
import Swal from 'sweetalert2'
import DatePicker from 'react-datepicker'
import { addDays } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css'
import { FaLocationDot } from 'react-icons/fa6'

const DoctorProfilePage = () => {
  const SECRET_KEY = "health-emi";
  var navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedConsultationType, setSelectedConsultationType] = useState('');

  // Available time slots
  const timeSlots = [
    { time: '09:00 AM', available: true },
    { time: '09:30 AM', available: true },
    { time: '10:00 AM', available: true },
    { time: '10:30 AM', available: true },
    { time: '11:00 AM', available: true },
    { time: '11:30 AM', available: true },
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

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot) => {
    if (timeSlot.available) {
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
      url: 'https://healtheasy-o25g.onrender.com/user/doctors/getone',
      data: {
        "doctorid": d
      }
    }).then((res) => {
      setdocprofile(res.data.Data)
      console.log('doctor ', res.data.Data)
    }).catch(function (error) {
      console.log(error);
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
      setShow(true)
    }
  };

  const handleServiceModalClose = () => setShowServiceModal(false);
  const handleServiceModalShow = (service) => {
    setSelectedService(service);
    setShowServiceModal(true);
  };

  var app_obj = { alt_mobile: '', surgeryid: '', appointment_reason: '', report: '', visit_types: '' }
  const [apt_data, setaptdata] = useState(app_obj)

  function appchangedata(e) {
    const { name, value } = e.target;
    setaptdata(apt_data => ({
      ...apt_data,
      [name]: value
    }))
  }

  function appointmentbtn(id) {
    if (patient) {
      // Split at the space before the time
      const [datePart, timePart, meridiem] = formattedDateTime.split(' ');
      // Combine time + meridiem
      const timeWithMeridiem = `${timePart} ${meridiem}`;
      console.log(apt_data, datePart, timeWithMeridiem, selectedConsultationType)
      setloading(true)
      axios({
        method: 'post',
        url: 'https://healtheasy-o25g.onrender.com/user/appointments/save',
        headers: {
          Authorization: token
        },
        data: {
          "patientname": patient.name,
          "mobile": patient.mobile,
          "alt_mobile": apt_data.alt_mobile,
          "date": datePart,
          "time": timeWithMeridiem,
          "surgeryid": apt_data.surgeryid,
          "appointment_reason": apt_data.appointment_reason,
          "report": apt_data.report,
          "doctorid": id,
          "visit_types": selectedConsultationType
        }
      }).then((res) => {
        Swal.fire({
          title: "Appointment Add Successfully...",
          icon: "success",
          confirmButtonText: 'Ok.'
        }).then((result) => {
          navigate('/patient/appointment');
        });
      }).catch(function (error) {
        Swal.fire({
          title: "Something Went Wrong.",
          text: "Something Is Missing. Please Check Details...",
          icon: "error",
        });
      }).finally(() => {
        setloading(false)
      });
    } else {
      // navigate('/patient')
    }
  }
  const formattedDateTime = selectedDate && selectedTimeSlot
    ? format(selectedDate, 'dd-MM-yyyy') + ' ' + selectedTimeSlot
    : selectedDate
      ? format(selectedDate, 'dd-MM-yyyy hh:mm a')
      : '';


  var surg_obj = { patientname: '', mobile: '', alt_name: '', alt_mobile: '', surgeryid: '', date: '', time: '', appointment_reason: '', report: [], doctorid: '', roomtype: '' }
  const [addsurgery, setaddsurgery] = useState(surg_obj)
  const [reportFiles, setReportFiles] = useState([])
  const [reportPreviews, setReportPreviews] = useState([])
  const [isUploadingReports, setIsUploadingReports] = useState(false)
  const [single_surg, setsingle_surg] = useState(null)
  const [addshow, setaddshow] = useState(false)
  const handleAddSurgeryClose = () => setaddshow(false)
  function handleAddSurgery(surgdata, d_id) {
    var surg_apt_data = { ...addsurgery, surgeryid: surgdata._id, doctorid: d_id, patientname: patient?.name, mobile: patient?.mobile }
    setaddsurgery(surg_apt_data)
    setsingle_surg(surgdata)
    if (!patient) {
      navigate('/patient')
    }
    else {
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
        'https://healtheasy-o25g.onrender.com/user/upload/multiple',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (response.data.Status === 200 && response.data.Data) {
        return response.data.Data.map(item => item.path || item.url);
      }
      return [];
    } catch (error) {
      console.error('Error uploading report files:', error);
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

        console.log('Surgery data with reports:', surg_data)

        const response = await axios({
          method: 'post',
          url: 'https://healtheasy-o25g.onrender.com/user/surgeryappointments/save',
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
        console.log(error)
      } finally {
        setloading(false)
      }
    } else {
      navigate('/patient')
    }
  }


  return (
    <>
      <NavBar logindata={patient} />
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
                    <Col md={3}>
                      <div className="position-relative">
                        {doctor_profile.profile_pic === "" ? (
                          <Image
                            src={require("../assets/image/doctor_img.jpg")}
                            roundedCircle
                            width={200}
                            height={200}
                            className="border border-3 border-white shadow"
                          />
                        ) : (
                          <Image
                            src={doctor_profile?.profile_pic}
                            roundedCircle
                            width={200}
                            height={200}
                            className="border border-3 border-white shadow"
                            alt={doctor_profile?.name}
                            onError={(e) => {
                              e.target.src = require("../assets/image/doctor_img.jpg");
                            }}
                          />
                        )}
                      </div>
                    </Col>
                    <Col md={4}>
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
                    <Col md={5}>
                      <Row className="g-3">
                        <Col xs={6}>
                          <div className="text-center p-3 bg-white rounded-3 h-100 shadow-sm">
                            <div>
                              <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#d5E1EA', fontSize: '14px' }} >
                                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12.1817 3.27246C8.84714 3.27246 6.13623 5.98337 6.13623 9.31792C6.13623 12.5888 8.69441 15.2361 12.029 15.3506C12.1308 15.3379 12.2326 15.3379 12.309 15.3506C12.3344 15.3506 12.3471 15.3506 12.3726 15.3506C12.3853 15.3506 12.3853 15.3506 12.398 15.3506C15.6562 15.2361 18.2144 12.5888 18.2271 9.31792C18.2271 5.98337 15.5162 3.27246 12.1817 3.27246Z" fill="#1C2A3A" />
                                  <path d="M18.6471 18.7364C15.0962 16.3691 9.30532 16.3691 5.72895 18.7364C4.11259 19.8182 3.22168 21.2818 3.22168 22.8473C3.22168 24.4128 4.11259 25.8637 5.71623 26.9328C7.49804 28.1291 9.83986 28.7273 12.1817 28.7273C14.5235 28.7273 16.8653 28.1291 18.6471 26.9328C20.2508 25.8509 21.1417 24.4 21.1417 22.8218C21.129 21.2564 20.2508 19.8055 18.6471 18.7364Z" fill="#1C2A3A" />
                                  <path d="M26.1687 10.0686C26.3723 12.5377 24.616 14.7013 22.1851 14.9941C22.1723 14.9941 22.1723 14.9941 22.1596 14.9941H22.1214C22.0451 14.9941 21.9687 14.9941 21.9051 15.0195C20.6705 15.0831 19.5378 14.6886 18.6851 13.9631C19.996 12.7922 20.7469 11.0359 20.5941 9.12678C20.5051 8.09587 20.1487 7.15405 19.6142 6.35223C20.0978 6.11041 20.6578 5.95769 21.2305 5.90678C23.7251 5.69041 25.9523 7.5486 26.1687 10.0686Z" fill="#1C2A3A" />
                                  <path d="M28.7145 21.8417C28.6127 23.0762 27.8236 24.1453 26.5 24.8708C25.2273 25.5708 23.6236 25.9017 22.0327 25.8635C22.9491 25.0362 23.4836 24.0053 23.5854 22.9108C23.7127 21.3326 22.9618 19.8181 21.46 18.609C20.6073 17.9344 19.6145 17.3999 18.5327 17.0053C21.3454 16.1908 24.8836 16.7381 27.06 18.4944C28.2309 19.4362 28.8291 20.6199 28.7145 21.8417Z" fill="#1C2A3A" />
                                </svg>

                              </div>
                              <div className="d-flex flex-column mt-1">
                                <span className="fw-bold">2,000+</span>
                                <small className="text-muted">Consultant</small>
                              </div>
                            </div>

                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-3 bg-white rounded-3 h-100 shadow-sm">
                            <div>
                              <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#E2E7F2', fontSize: '14px' }} >
                                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M17.5143 8.36426H9.36882C9.03792 8.36426 8.71973 8.37699 8.41428 8.41517C4.99064 8.70789 3.27246 10.7315 3.27246 14.4606V19.5515C3.27246 24.6424 5.30882 25.6479 9.36882 25.6479H9.87792C10.1579 25.6479 10.527 25.8388 10.6925 26.0552L12.2197 28.0915C12.8943 28.9952 13.9888 28.9952 14.6634 28.0915L16.1906 26.0552C16.3816 25.8006 16.687 25.6479 17.0052 25.6479H17.5143C21.2434 25.6479 23.267 23.9424 23.5597 20.5061C23.5979 20.2006 23.6106 19.8824 23.6106 19.5515V14.4606C23.6106 10.4006 21.5743 8.36426 17.5143 8.36426ZM8.99973 18.5461C8.28701 18.5461 7.72701 17.9733 7.72701 17.2733C7.72701 16.5733 8.29973 16.0006 8.99973 16.0006C9.69973 16.0006 10.2725 16.5733 10.2725 17.2733C10.2725 17.9733 9.69973 18.5461 8.99973 18.5461ZM13.4416 18.5461C12.7288 18.5461 12.1688 17.9733 12.1688 17.2733C12.1688 16.5733 12.7416 16.0006 13.4416 16.0006C14.1416 16.0006 14.7143 16.5733 14.7143 17.2733C14.7143 17.9733 14.1543 18.5461 13.4416 18.5461ZM17.8961 18.5461C17.1834 18.5461 16.6234 17.9733 16.6234 17.2733C16.6234 16.5733 17.1961 16.0006 17.8961 16.0006C18.5961 16.0006 19.1688 16.5733 19.1688 17.2733C19.1688 17.9733 18.5961 18.5461 17.8961 18.5461Z" fill="#3F5FAB" />
                                  <path d="M28.7016 9.3698V14.4607C28.7016 17.0062 27.9126 18.7371 26.3344 19.6916C25.9526 19.9207 25.5071 19.6153 25.5071 19.1698L25.5198 14.4607C25.5198 9.3698 22.6053 6.45526 17.5144 6.45526L9.76346 6.46798C9.31801 6.46798 9.01255 6.02253 9.24164 5.64071C10.1962 4.06253 11.9271 3.27344 14.4598 3.27344H22.6053C26.6653 3.27344 28.7016 5.3098 28.7016 9.3698Z" fill="#3F5FAB" />
                                </svg>

                              </div>
                              <div className="d-flex flex-column mt-1">
                                <span className="fw-bold">6</span>
                                <small className="text-muted">Surgeries</small>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-3 bg-white rounded-3 h-100 shadow-sm">
                            <div>
                              <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#D8F3F1', fontSize: '14px' }} >
                                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M15.9996 19.8189C20.7442 19.8189 24.5905 16.1151 24.5905 11.5462C24.5905 6.97726 20.7442 3.27344 15.9996 3.27344C11.255 3.27344 7.40869 6.97726 7.40869 11.5462C7.40869 16.1151 11.255 19.8189 15.9996 19.8189Z" fill="#12A79D" />
                                  <path d="M20.8234 20.5946C21.2434 20.3783 21.727 20.6965 21.727 21.1674V27.3401C21.727 28.4855 20.9252 29.0455 19.9325 28.5746L16.5216 26.9583C16.2288 26.831 15.7706 26.831 15.4779 26.9583L12.067 28.5746C11.0743 29.0328 10.2725 28.4728 10.2725 27.3274L10.2979 21.1674C10.2979 20.6965 10.7943 20.391 11.2016 20.5946C12.6397 21.3201 14.2688 21.7274 15.9997 21.7274C17.7306 21.7274 19.3725 21.3201 20.8234 20.5946Z" fill="#12A79D" />
                                </svg>

                              </div>
                              <div className="d-flex flex-column mt-1">
                                <span className="fw-bold">10+ Years</span>
                                <small className="text-muted">Experience</small>
                              </div>
                            </div>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-3 bg-white rounded-3 h-100 shadow-sm">
                            <div>
                              <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#F8EFE1', fontSize: '14px' }} >
                                <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10.9326 18.4492C10.5956 18.4604 10.2642 18.5418 10.0117 18.6943L6.98242 20.4941C4.81503 21.7743 3.49702 20.8241 4.06738 18.3652L4.79004 15.2471C4.904 14.6388 4.66325 13.8147 4.24512 13.3965L1.72266 10.874C0.23975 9.39108 0.721132 7.89591 2.78711 7.54102L6.01953 7.00879C6.56431 6.91993 7.21024 6.43839 7.45117 5.94434L9.23828 2.36914C9.70894 1.44019 10.3185 0.960228 10.9326 0.928711V18.4492Z" fill="#FEB052" />
                                  <path d="M10.9326 0.930664C11.5918 0.896922 12.2565 1.38003 12.7617 2.38379L14.5488 5.95801C14.7896 6.45233 15.4364 6.92106 15.9814 7.02246L19.2139 7.55566C21.2794 7.89803 21.761 9.39322 20.2783 10.8887L17.7559 13.4111C17.3376 13.8294 17.0969 14.6533 17.2363 15.249L17.959 18.3672C18.5291 20.8258 17.2103 21.7889 15.043 20.4961L12.0137 18.6963C11.7212 18.5196 11.3231 18.4382 10.9326 18.4512V0.930664Z" fill="#FEB052" />
                                </svg>

                              </div>
                              <div className="d-flex flex-column mt-1">
                                <span className="fw-bold">5</span>
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
                    Dr. {doctor_profile.name}, a dedicated {doctor_profile.specialty}, brings a wealth of experience to Golden Gate {doctor_profile.specialty} Center in
                    Golden Gate, CA Dr. {doctor_profile.name}, a dedicated cardiologist, brings a wealth of experience to Golden Gate
                    {doctor_profile.specialty} Center in Golden Gate, CA Dr. {doctor_profile.name}, a dedicated cardiologist, brings a wealth of experience
                    to Golden Gate {doctor_profile.specialty} Center in Golden Gate, CA Dr. {doctor_profile.name}, a dedicated cardiologist, brings a
                    wealth of experience to Golden Gate {doctor_profile.specialty} Center in Golden Gate, CA Dr. {doctor_profile.name}, a dedicated
                    {doctor_profile.specialty}, brings a wealth of experience to Golden Gate {doctor_profile.specialty} Center in Golden Gate, CA Dr. {doctor_profile.name}, a dedicated
                    {doctor_profile.specialty}, brings a wealth of experience to Golden Gate {doctor_profile.specialty} Center in Golden Gate, CA Dr. <span className="text-primary fw-bold" style={{ cursor: 'pointer' }}>read more</span>
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
                                <h6 className="fw-bold mb-1 border-bottom pb-2">{surgery.name}</h6>
                                <p className="text-muted small mb-1">{surgery.surgery_type || 'Surgery Type'}</p>
                                <p className="text-muted small mb-0">Days of Surgery</p>
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
                  <div className='card p-3 shadow'>
                    <div className="d-flex align-items-start mb-3 pb-2 border-bottom">
                      <Image
                        src={require("../assets/image/doctor_img.jpg")}
                        roundedCircle
                        width={50}
                        height={50}
                        className="me-3"
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <h6 className="fw-bold mb-0 me-2">Bharti patel</h6>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <BsStarFill key={i} className="text-warning me-1" size={14} />
                          ))}
                          <span className="small text-muted ms-2">5.0</span>
                        </div>

                      </div>

                    </div>
                    <h6 className="fw-bold mb-2">Visit For Root Canal Treatment</h6>
                    <p className="text-muted small mb-0">
                      I had a lot of pain in my tooth and not involved in just one sitting. Earlier I have had a bad experience
                      with dentists but after getting my treatment done here I have overcome my fears. The doctor is very
                      good in her work and also knows how to take care of my teeth after treatment.
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Sidebar - Book Consultation */}
            <Col lg={4}>
              <div className="position-sticky" style={{ top: '20px' }}>
                {/* Consultation Type Selection */}
                <Card className="mb-4 border-0" style={{ borderRadius: '15px', backgroundColor: 'transparent' }}>
                  <Card.Body className="p-4">
                    <h6 className="fw-bold mb-3 text-muted">Select Consultation Type</h6>
                    <Row className="g-3">
                      <Col xs={4}>
                        <input
                          type="radio"
                          name="consultationType"
                          value="clinic_visit"
                          checked={selectedConsultationType === 'clinic_visit'}
                          onChange={(e) => { setSelectedConsultationType(e.target.value); setaptdata({ ...apt_data, visit_types: e.target.value }); }}
                          className="d-none"
                          id="clinic_visit"
                        />
                        <label
                          htmlFor="clinic_visit"
                          className={`text-center p-3 bg-white rounded-3 h-100 shadow-sm d-block cursor-pointer ${selectedConsultationType === 'clinic_visit' ? 'bg-primary-subtle' : ''
                            }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div>
                            <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#F8EFE1', fontSize: '14px' }} >
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.25 3.57812H14.25C14.4945 3.57812 14.7295 3.67477 14.9023 3.84766C15.0752 4.02054 15.1719 4.2555 15.1719 4.5V11.0781H21C21.2445 11.0781 21.4795 11.1748 21.6523 11.3477C21.8252 11.5205 21.9219 11.7555 21.9219 12V20.0781H23.25C23.2956 20.0781 23.3389 20.0967 23.3711 20.1289C23.4033 20.1611 23.4219 20.2044 23.4219 20.25C23.4219 20.2956 23.4033 20.3389 23.3711 20.3711C23.3389 20.4033 23.2956 20.4219 23.25 20.4219H3C2.95442 20.4219 2.91114 20.4033 2.87891 20.3711C2.84667 20.3389 2.82812 20.2956 2.82812 20.25C2.82812 20.2044 2.84667 20.1611 2.87891 20.1289C2.91114 20.0967 2.95442 20.0781 3 20.0781H4.32812V4.5C4.32812 4.2555 4.42477 4.02054 4.59766 3.84766C4.77054 3.67477 5.0055 3.57812 5.25 3.57812ZM5.25 3.92188C5.09667 3.92188 4.94924 3.9824 4.84082 4.09082C4.7324 4.19924 4.67188 4.34667 4.67188 4.5V20.0781H7.32812V15C7.32812 14.9544 7.34667 14.9111 7.37891 14.8789C7.41114 14.8467 7.45442 14.8281 7.5 14.8281H12C12.0456 14.8281 12.0889 14.8467 12.1211 14.8789C12.1533 14.9111 12.1719 14.9544 12.1719 15V20.0781H14.8281V4.5C14.8281 4.38521 14.7941 4.27386 14.7314 4.17969L14.6592 4.09082L14.5703 4.01855C14.4761 3.9559 14.3648 3.92188 14.25 3.92188H5.25ZM7.67188 20.0781H11.8281V15.1719H7.67188V20.0781ZM15.1719 20.0781H21.5781V12C21.5781 11.8852 21.5441 11.7739 21.4814 11.6797L21.4092 11.5908L21.3203 11.5186C21.2261 11.4559 21.1148 11.4219 21 11.4219H15.1719V20.0781ZM9.75 6.57812C9.79558 6.57812 9.83886 6.59667 9.87109 6.62891C9.90333 6.66114 9.92188 6.70442 9.92188 6.75V8.82812H12C12.0456 8.82812 12.0889 8.84667 12.1211 8.87891C12.1533 8.91114 12.1719 8.95442 12.1719 9C12.1719 9.04558 12.1533 9.08886 12.1211 9.12109C12.0889 9.15333 12.0456 9.17188 12 9.17188H9.92188V11.25C9.92188 11.2956 9.90333 11.3389 9.87109 11.3711C9.83886 11.4033 9.79558 11.4219 9.75 11.4219C9.70442 11.4219 9.66114 11.4033 9.62891 11.3711C9.59667 11.3389 9.57812 11.2956 9.57812 11.25V9.17188H7.5C7.45442 9.17188 7.41114 9.15333 7.37891 9.12109C7.34667 9.08886 7.32812 9.04558 7.32812 9C7.32812 8.95442 7.34667 8.91114 7.37891 8.87891C7.41114 8.84667 7.45442 8.82812 7.5 8.82812H9.57812V6.75C9.57812 6.70442 9.59667 6.66114 9.62891 6.62891C9.66114 6.59667 9.70442 6.57812 9.75 6.57812Z" fill="black" stroke="#FBB03F" strokeWidth="0.78125" />
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
                          onChange={(e) => { setSelectedConsultationType(e.target.value); setaptdata({ ...apt_data, visit_types: e.target.value }); }}
                          className="d-none"
                          id="home_visit"
                        />
                        <label
                          htmlFor="home_visit"
                          className={`text-center p-3 bg-white rounded-3 h-100 shadow-sm d-block cursor-pointer ${selectedConsultationType === 'home_visit' ? 'bg-primary-subtle' : ''
                            }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div>
                            <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#D8F3F1', fontSize: '14px' }} >
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 20.9998H7C5.93913 20.9998 4.92172 20.5784 4.17157 19.8282C3.42143 19.0781 3 18.0607 3 16.9998V10.7078C2.99999 10.02 3.17732 9.34386 3.51487 8.74461C3.85242 8.14535 4.33879 7.64326 4.927 7.28682L9.927 4.25682C10.5521 3.87801 11.2691 3.67773 12 3.67773C12.7309 3.67773 13.4479 3.87801 14.073 4.25682L19.073 7.28682C19.6611 7.64317 20.1473 8.14511 20.4849 8.74417C20.8224 9.34324 20.9998 10.0192 21 10.7068V16.9998C21 18.0607 20.5786 19.0781 19.8284 19.8282C19.0783 20.5784 18.0609 20.9998 17 20.9998H15M9 20.9998V16.9998C9 16.2042 9.31607 15.4411 9.87868 14.8785C10.4413 14.3159 11.2044 13.9998 12 13.9998C12.7956 13.9998 13.5587 14.3159 14.1213 14.8785C14.6839 15.4411 15 16.2042 15 16.9998V20.9998M9 20.9998H15" stroke="#12A79D" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
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
                          onChange={(e) => { setSelectedConsultationType(e.target.value); setaptdata({ ...apt_data, visit_types: e.target.value }); }}
                          className="d-none"
                          id="eopd"
                        />
                        <label
                          htmlFor="eopd"
                          className={`text-center p-3 bg-white rounded-3 h-100 shadow-sm d-block cursor-pointer ${selectedConsultationType === 'eopd' ? 'bg-primary-subtle' : ''
                            }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div>
                            <div className="rounded-circle d-flex mx-auto align-items-center overflow-hidden justify-content-center fw-bold" style={{ width: '40px', height: '40px', backgroundColor: '#E2E7F2', fontSize: '14px' }} >
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.75 6H6.25C4.317 6 2.75 7.567 2.75 9.5V14.5C2.75 16.433 4.317 18 6.25 18H12.75C14.683 18 16.25 16.433 16.25 14.5V9.5C16.25 7.567 14.683 6 12.75 6Z" stroke="#3F5FAB" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16.25 9.7402L19.804 7.9702C19.9565 7.89423 20.1258 7.85846 20.296 7.86629C20.4661 7.87412 20.6315 7.92528 20.7763 8.01493C20.9211 8.10458 21.0407 8.22974 21.1236 8.37854C21.2065 8.52735 21.25 8.69486 21.25 8.8652V15.1332C21.2501 15.3037 21.2066 15.4713 21.1236 15.6203C21.0407 15.7692 20.921 15.8945 20.776 15.9841C20.631 16.0738 20.4655 16.1249 20.2952 16.1326C20.1249 16.1404 19.9555 16.1044 19.803 16.0282L16.25 14.2552V9.7402Z" stroke="#3F5FAB" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
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
                  </Card.Body>
                </Card>

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
                          <h6 className="fw-bold mb-3 text-center">Time Slots</h6>
                          {selectedDate ? (
                            <div>
                              <Row className="g-2">
                                {timeSlots.map((slot, index) => (
                                  <Col xs={4} key={index}>
                                    <Button
                                      variant={
                                        selectedTimeSlot === slot.time
                                          ? "dark"
                                          : slot.available
                                            ? "outline-primary"
                                            : "outline-danger"
                                      }
                                      size="sm"
                                      className="w-100"
                                      disabled={!slot.available}
                                      onClick={() => handleTimeSlotSelect(slot)}
                                      style={{
                                        opacity: slot.available ? 1 : 0.5,
                                        cursor: slot.available ? 'pointer' : 'not-allowed',
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
                      disabled={!selectedConsultationType || !selectedDate || !selectedTimeSlot}
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
                    <Col xs={4}>
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
                    </Col>
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
                      <Form.Control type='file' value={apt_data.report} name='report' onChange={appchangedata}></Form.Control>
                    </Col>
                    {/* <Col xs={12} md={4}>
                      <Form.Check
                        label={`Home Visit - ${doctor_profile.consultationsDetails.home_visit_price}`}
                        type="radio"
                        name="visit_types"
                        value={"home_visit"}
                        onChange={appchangedata}
                      />
                      <Form.Check
                        label={`Clinic Visit - ${doctor_profile.consultationsDetails.clinic_visit_price}`}
                        type="radio"
                        name="visit_types"
                        value={"clinic_visit"}
                        onChange={appchangedata}
                      />
                      <Form.Check
                        label={`EOPD - ${doctor_profile.consultationsDetails.eopd_price}`}
                        type="radio"
                        name="visit_types"
                        value={"eopd"}
                        onChange={appchangedata}
                      />
                    </Col> */}
                    {/* <Col xs={'auto'}>
                      <Form.Label>Appointment Date</Form.Label>
                      <br /> */}

                    {/* {selectedTimeSlot && (
                        <div className="p-2 bg-success bg-opacity-10 rounded text-center">
                          <small className="text-success fw-bold">
                            ✓ Selected: {format(selectedDate, 'dd/MM/yyyy')} at {selectedTimeSlot}
                          </small>
                        </div>
                      )}
                    </Col> */}
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
            <Modal.Title>Service Details - {selectedService.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container fluid>
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
                              selectedService.inclusive.split(', ').map((v, i) => (
                                <li key={i}><FaRegDotCircle className='me-2' />{v}</li>
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
                              selectedService.exclusive.split(', ').map((v, i) => (
                                <li key={i}><FaRegDotCircle className='me-2' />{v}</li>
                              ))
                            }
                          </ul>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
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
                minDate={new Date()}
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