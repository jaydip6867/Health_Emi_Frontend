import React, { useEffect, useMemo, useRef, useState } from 'react'

import { Badge, Button, Card, Col, Container, Form, Modal, OverlayTrigger, Row, Table, Tooltip } from 'react-bootstrap'
import DoctorSidebar from './DoctorSidebar'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../Loader'
import CryptoJS from "crypto-js";
import Swal from 'sweetalert2'
import SmartDataTable from '../components/SmartDataTable'
import { MdClose, MdDone, MdOutlineAutorenew, MdOutlineRemoveRedEye } from 'react-icons/md'
import DatePicker from 'react-datepicker'
import { format, parse, addDays } from 'date-fns'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config'
import { FiClock, FiMail, FiMapPin, FiPhone } from 'react-icons/fi'
import { PiHospital } from 'react-icons/pi'
import { HiOutlineHome } from 'react-icons/hi'
import { BsCameraVideo } from 'react-icons/bs'
import NavBar from '../Visitor/Component/NavBar'
import FooterBar from '../Visitor/Component/FooterBar'

const D_Appointment = () => {
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [doctor, setdoctor] = useState(null)
    const [token, settoken] = useState(null)

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
            setdoctor(data.doctorData);
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])

    const [appointment, setappointment] = useState(null)

    useEffect(() => {
        setloading(true)
        if (doctor) {
            appointmentlist()
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
            // var len = res.data.Data;
            // console.log(len.length)
            // console.log(res.data.Data)
            setappointment(res.data.Data)
        }).catch(function (error) {
            // console.log(error);
            // toast(error.response.data.Message,{className:'custom-toast-error'})
        }).finally(() => {
            setloading(false)
        });
    }

    const appointmentbtn = async (id, s) => {
        setloading(true)
        await axios({
            method: 'post',
            url: `${API_BASE_URL}/doctor/appointments/changestatus`,
            headers: {
                Authorization: token
            },
            data: {
                appointmentid: id,
                status: s
            }
        }).then((res) => {
            // console.log(res)
            Swal.fire({
                title: `Appointment ${s}...`,
                icon: "success",
            });
            appointmentlist()
        }).catch(function (error) {
            // console.log(error);
            // toast(error.response.data.Message,{className:'custom-toast-error'})
        }).finally(() => {
            setloading(false)
        });
    }

    // display Appointment Details in model
    const [show, setShow] = useState(false);
    const [v, setsingleview] = useState(null);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    function btnview(id) {
        var datasingle = appointment.filter((v, i) => { return v._id === id })
        setsingleview(datasingle);
        handleShow()
    }

    const [selectedDate, setSelectedDate] = useState(null);

    const isSameCalendarDay = (d1, d2) => {
        if (!d1 || !d2) return false;
        return format(d1, 'yyyy-MM-dd') === format(d2, 'yyyy-MM-dd');
    };

    const filterRescheduleTime = (dt) => {
        if (!dt) return false;
        const minutes = dt.getHours() * 60 + dt.getMinutes();
        const withinClinicWindow = minutes >= 9 * 60 && minutes <= (20 * 60 + 30);
        if (!withinClinicWindow) return false;
        const base = selectedDate || dt;
        if (isSameCalendarDay(base, new Date())) {
            return dt.getTime() > Date.now();
        }
        return true;
    };

    const [showreschedule, setrescheduleShow] = useState(false);
    const [schedule_data, setschedule_data] = useState(null);

    const handlerescheduleClose = () => setrescheduleShow(false);
    const handlerescheduleShow = () => setrescheduleShow(true);

    const reschedule_modal = (id) => {
        var data = appointment.filter((v) => {
            return v._id === id
        })
        setschedule_data(data)
        handlerescheduleShow()
    }

    const handleOpenStartAppointment = (appointmentRow) => {
        const scheduledStr = `${appointmentRow?.date || ''} ${appointmentRow?.time || ''}`;
        try {
            const scheduledAt = parse(scheduledStr.trim(), 'dd-MM-yyyy hh:mm a', new Date());
            if (isNaN(scheduledAt.getTime())) {
                throw new Error('Invalid date');
            }
            const now = new Date();
            if (now < scheduledAt) {
                Swal.fire({
                    title: 'Too Early',
                    text: 'You can start the appointment at the scheduled time or later.',
                    icon: 'warning',
                });
                return;
            }
        } catch (e) {
            Swal.fire({
                title: 'Invalid schedule',
                text: 'Appointment date/time is invalid. Please reschedule or try again.',
                icon: 'warning',
            });
            return;
        }
        setCurrentAppointment(appointmentRow);
        setShowStartAppointment(true);
    };

    const handleCloseStartAppointment = () => {
        setShowStartAppointment(false);
        setCurrentAppointment(null);
    };

    const confirmStartAppointment = () => {
        setShowStartAppointment(false);
        setShowChoosePrescription(true);
    };

    const [showStartAppointment, setShowStartAppointment] = useState(false);
    const [currentAppointment, setCurrentAppointment] = useState(null);

    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [showChoosePrescription, setShowChoosePrescription] = useState(false);
    const [prescriptionOption, setPrescriptionOption] = useState('write');
    const [prescriptionUploadFiles, setPrescriptionUploadFiles] = useState([]);
    const [uploadingPrescription, setUploadingPrescription] = useState(false);

    const [prescriptionData, setPrescriptionData] = useState({
        diagnosis: '',
        instructions: '',
        bp: '',
        complain: '',
        pasHistory: '',
        followUpDate: '',
        followUpTime: '',
        prescriptionItems: []
    });

    const handleClosePrescriptionModal = () => {
        setShowPrescriptionModal(false);
    };

    const handleCloseChoosePrescription = () => {
        setShowChoosePrescription(false);
        setPrescriptionOption('write');
        setPrescriptionUploadFiles([]);
    };

    const handleContinueChoosePrescription = async () => {
        if (!currentAppointment) return;
        if (prescriptionOption === 'write') {
            setShowChoosePrescription(false);
            setShowPrescriptionModal(true);
            return;
        }
        setloading(true);
        if (prescriptionOption === 'none') {
            try {
                setloading(true);
                await axios({
                    method: 'post',
                    url: `${API_BASE_URL}/doctor/appointments/complete`,
                    headers: { Authorization: token },
                    data: {
                        appointmentid: currentAppointment?._id,
                        payment_mode: 'Cash',
                        totalamount: currentAppointment?.price,
                        doctor_remark: ''
                    }
                });
                Swal.fire('Success', 'Appointment completed without prescription.', 'success');
                setShowChoosePrescription(false);
                appointmentlist();
            } catch (error) {
                Swal.fire('Failed', error.response?.data?.Message || error.message || 'Failed to complete appointment.', 'error');
            } finally {
                setloading(false);
            }
            return;
        }
        if (prescriptionOption === 'upload') {
            if (!prescriptionUploadFiles || prescriptionUploadFiles.length === 0) {
                Swal.fire('Select file', 'Please select at least one image to upload.', 'warning');
                return;
            }
            try {
                setUploadingPrescription(true);
                const formData = new FormData();
                prescriptionUploadFiles.forEach(f => formData.append('file', f));
                const uploadResponse = await axios({
                    method: 'post',
                    url: `${API_BASE_URL}/user/upload/multiple`,
                    headers: { 'Content-Type': 'multipart/form-data' },
                    data: formData,
                });
                const uploadedUrl = Array.isArray(uploadResponse.data?.Data)
                    ? uploadResponse.data?.Data?.[0]?.path || uploadResponse.data?.Data?.[0]?.url
                    : uploadResponse.data?.Data?.url || uploadResponse.data?.Data;
                if (!uploadedUrl) throw new Error('Failed to get uploaded file URL');

                setUploadingPrescription(false);

                // console.log({
                //         appointmentid: currentAppointment?._id,
                //         payment_mode: 'Cash',
                //         totalamount: currentAppointment?.price,
                //         doctor_remark: uploadedUrl
                //     })
                setloading(true);
                await axios({
                    method: 'post',
                    url: `${API_BASE_URL}/doctor/appointments/complete`,
                    headers: { Authorization: token },
                    data: {
                        appointmentid: currentAppointment?._id,
                        payment_mode: 'Cash',
                        totalamount: currentAppointment?.price,
                        doctor_remark: uploadedUrl
                    }
                });
                Swal.fire('Success', 'Prescription image uploaded and appointment completed.', 'success');
                setShowChoosePrescription(false);
                setPrescriptionUploadFiles([]);
                appointmentlist();
            } catch (error) {
                setUploadingPrescription(false);
                Swal.fire('Failed', error.response?.data?.Message || error.message || 'Failed to upload/complete appointment.', 'error');
            } finally {
                setloading(false);
            }
        }
    };

    const [newPrescriptionItem, setNewPrescriptionItem] = useState({
        medicine: '',
        type: 'tablet',
        mo: false,
        an: false,
        ev: false,
        nt: false,
        moDose: 0,
        anDose: 0,
        evDose: 0,
        ntDose: 0,
        days: 1,
        quantity: 0,
        instruction: '-SELECT-'
    });

    const medicineTypes = [
        'tablet', 'capsule', 'syrup', 'injection', 'drops', 'inhaler', 'ointment', 'cream'
    ];

    const instructionOptions = [
        '-SELECT-',
        'After Breakfast',
        'After Lunch',
        'After Dinner',
        'Before Breakfast',
        'Before Lunch',
        'Before Dinner',
        'After Breakfast, Lunch and Dinner',
        'After Breakfast and Dinner',
        'Before Breakfast and Before Dinner',
        'Subcutaneous at 10 PM in night',
        'Sublingual/Chewable',
        'To apply as explained',
        'Mix with 1 lit of drinking water',
        'Twice a day',
        'Once a day',
        'Three times a day',
        'On empty stomach in morning',
        'SOS For Fever',
        'SOS For Abdominal Pain'
    ];

    const [followUpDate, setFollowUpDate] = useState(null);
    const [followUpTime, setFollowUpTime] = useState(null);

    const handlePrescriptionChange = (field, value) => {
        setPrescriptionData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNewItemChange = (field, value) => {
        setNewPrescriptionItem(prev => {
            const updatedItem = {
                ...prev,
                [field]: value
            };

            if (['mo', 'an', 'ev', 'nt', 'moDose', 'anDose', 'evDose', 'ntDose', 'days'].includes(field)) {
                let total = 0;
                if (updatedItem.mo) total += parseInt(updatedItem.moDose || 0);
                if (updatedItem.an) total += parseInt(updatedItem.anDose || 0);
                if (updatedItem.ev) total += parseInt(updatedItem.evDose || 0);
                if (updatedItem.nt) total += parseInt(updatedItem.ntDose || 0);
                updatedItem.quantity = total * parseInt(updatedItem.days || 1);
            }

            return updatedItem;
        });
    };

    const addPrescriptionItem = () => {
        if (!newPrescriptionItem.medicine.trim()) return;

        setPrescriptionData(prev => ({
            ...prev,
            prescriptionItems: [...prev.prescriptionItems, { ...newPrescriptionItem }]
        }));

        setNewPrescriptionItem({
            medicine: '',
            type: 'tablet',
            mo: false,
            an: false,
            ev: false,
            nt: false,
            moDose: 0,
            anDose: 0,
            evDose: 0,
            ntDose: 0,
            days: 1,
            quantity: 0,
            instruction: '-SELECT-'
        });
    };

    const removePrescriptionItem = (index) => {
        setPrescriptionData(prev => ({
            ...prev,
            prescriptionItems: prev.prescriptionItems.filter((_, i) => i !== index)
        }));
    };

    const submitPrescription = async () => {
        const hasItems = prescriptionData.prescriptionItems && prescriptionData.prescriptionItems.length > 0;
        if (!prescriptionData.diagnosis.trim() || !hasItems) {
            Swal.fire({
                title: 'Required Fields Missing',
                text: 'Please enter diagnosis and add at least one medicine.',
                icon: 'warning'
            });
            return;
        }

        try {
            setloading(true);

            const itemsText = (prescriptionData.prescriptionItems || []).map(item => {
                const times = [];
                if (item.mo) times.push(`MO(${item.moDose})`);
                if (item.an) times.push(`AN(${item.anDose})`);
                if (item.ev) times.push(`EV(${item.evDose})`);
                if (item.nt) times.push(`NT(${item.ntDose})`);
                const instr = item.instruction && item.instruction !== '-SELECT-' ? ` - Instr: ${item.instruction}` : '';
                return `${item.medicine} (${item.type}) - ${times.join(', ')} - ${item.days} days - Qty: ${item.quantity}${instr}`;
            }).join('\n');

            const { pdfBlob, fileName } = await generatePrescriptionPDF();

            const pdfFile = new File([pdfBlob], fileName, {
                type: 'application/pdf',
                lastModified: Date.now()
            });

            const formData = new FormData();
            formData.append('file', pdfFile);

            const uploadResponse = await axios({
                method: 'post',
                url: `${API_BASE_URL}/user/upload/multiple`,
                headers: { 'Content-Type': 'multipart/form-data' },
                data: formData,
            });

            const uploadedFileUrl = Array.isArray(uploadResponse.data?.Data)
                ? uploadResponse.data?.Data?.[0]?.path || uploadResponse.data?.Data?.[0]?.url
                : uploadResponse.data?.Data?.url || uploadResponse.data?.Data;

            if (!uploadedFileUrl) throw new Error('Failed to get uploaded file URL');

            const followup_date = followUpDate ? format(followUpDate, 'dd-MM-yyyy') : '';
            const followup_time = followUpTime ? format(followUpTime, 'hh:mm a') : '';
            await axios({
                method: 'post',
                url: `${API_BASE_URL}/doctor/appointments/complete`,
                headers: { Authorization: token },
                data: {
                    appointmentid: currentAppointment?._id,
                    payment_mode: 'Cash',
                    totalamount: currentAppointment?.price,
                    doctor_remark: uploadedFileUrl,
                    prescription: prescriptionData.prescriptionItems,
                    followup_date,
                    followup_time
                }
            });

            Swal.fire('Success', 'Prescription saved and appointment completed!', 'success');
            handleClosePrescriptionModal();
            appointmentlist();
            setPrescriptionData({ diagnosis: '', instructions: '', bp: '', complain: '', pasHistory: '', followUpDate: '', followUpTime: '', prescriptionItems: [] });
            setFollowUpDate(addDays(new Date(), 2));
            const resetTime = new Date();
            resetTime.setHours(9, 0, 0, 0);
            setFollowUpTime(resetTime);
        } catch (error) {
            // console.log('Error completing appointment:', error);
            Swal.fire('Failed', error.response?.data?.Message || error.message || 'Failed to complete appointment.', 'error');
        } finally {
            setloading(false);
        }
    };

    const printRef = useRef(null);

    const generatePrescriptionPDF = () => {
        const node = printRef.current;
        const fileName = `prescription_${currentAppointment?.patientname?.replace(/\s+/g, '_') || 'patient'}_${Date.now()}.pdf`;
        return html2canvas(node, { scale: 2, useCORS: true, backgroundColor: '#ffffff' }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            if (imgHeight <= pageHeight) {
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            } else {
                let remaining = imgHeight;
                let y = 0;
                while (remaining > 0) {
                    pdf.addImage(imgData, 'PNG', 0, y, imgWidth, imgHeight);
                    remaining -= pageHeight;
                    if (remaining > 0) {
                        pdf.addPage();
                        y -= pageHeight;
                    }
                }
            }

            const pdfBlob = pdf.output('blob');
            return { pdfBlob, fileName };
        });
    };

    const formattedDateTime = selectedDate
        ? format(selectedDate, 'dd-MM-yyyy hh:mm a')
        : '';

    const reschedule_appointment = () => {
        if (!selectedDate) {
            Swal.fire({
                title: 'Select Date & Time',
                text: 'Please pick a valid future date and time.',
                icon: 'warning',
            });
            return;
        }
        if (selectedDate.getTime() <= Date.now()) {
            Swal.fire({
                title: 'Invalid time',
                text: 'Please select a time in the future.',
                icon: 'warning',
            });
            return;
        }

        const [datePart, timePart, meridiem] = formattedDateTime.split(' ');
        const timeWithMeridiem = `${timePart} ${meridiem}`;

        setloading(true);
        axios({
            method: 'post',
            url: `${API_BASE_URL}/doctor/appointments/reschedule`,
            headers: {
                Authorization: token
            },
            data: {
                appointmentid: schedule_data[0]._id,
                date: datePart,
                time: timeWithMeridiem
            }
        }).then((res) => {
            Swal.fire({
                title: 'Appointment Rescheduled Successfully!',
                text: `New appointment time: ${datePart} at ${timeWithMeridiem}`,
                icon: 'success',
            });
            appointmentlist();
            handlerescheduleClose();
        }).catch(function (error) {
            // console.log(error);
            Swal.fire({
                title: 'Reschedule Failed!',
                text: error.response?.data?.Message || 'This time slot may already be booked or unavailable. Please select a different time.',
                icon: 'error',
                confirmButtonText: 'Try Again'
            });
        }).finally(() => {
            setloading(false);
        });
    };

    const renderTooltip = (label) => (props) => (
        <Tooltip id="button-tooltip" {...props}>
            {label} Appointment
        </Tooltip>
    );


    // Get status badge styling
    const getStatusBadge = (status) => {
        const statusConfig = {
            'Accept': { bg: 'var(--primary-color-600)', text: 'Accepted', dot: 'var(--primary-color-600)' },
            'Pending': { bg: 'var(--secondary-color-600)', text: 'Pending', dot: 'var(--secondary-color-600)' },
            'Cancel': { bg: 'var(--grayscale-color-700)', text: 'Cancelled', dot: 'var(--grayscale-color-700)' },
            'Completed': { bg: 'var(--tertary-color-600)', text: 'Completed', dot: 'var(--tertary-color-600)' },
        };
        return statusConfig[status] || { bg: 'var(--grayscale-color-500)', text: status, dot: 'var(--grayscale-color-500)' };
    };

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
                {/* <span className="text-truncate"> {row?.status === "Cancel" || row?.status === "Pending" || row?.status === "Accept" ? row?.price : row?.totalamount}</span> */}
                <span className="text-truncate"> {row?.price}</span>
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
    },
    {
        name: 'View',
        cell: row => (
            <OverlayTrigger placement="top" overlay={renderTooltip('View Details')}>
                <button
                    className="btn btn-sm p-1 appt-view-btn"
                    onClick={() => btnview(row._id)}
                >
                    <MdOutlineRemoveRedEye size={18} />
                </button>
            </OverlayTrigger>
        ),
        width: '80px',
        center: true
    }, {
        name: 'Action',
        cell: row => (
            <div className="d-flex align-items-center gap-1">
                {row.status === "Pending" && (
                    <>
                        <OverlayTrigger placement="top" overlay={renderTooltip('Accept')}>
                            <button
                                className="btn btn-sm p-1 apt_status_btn success"
                                onClick={() => appointmentbtn(row._id, 'Accept')}
                            >
                                <MdDone size={18} />
                            </button>
                        </OverlayTrigger>

                        <OverlayTrigger placement="top" overlay={renderTooltip('Cancel')}>
                            <button
                                className="btn btn-sm p-1 apt_status_btn danger"
                                onClick={() => appointmentbtn(row._id, 'Cancel')}
                            >
                                <MdClose size={18} />
                            </button>
                        </OverlayTrigger>

                        <OverlayTrigger placement="top" overlay={renderTooltip('Reschedule')}>
                            <button
                                className="btn btn-sm p-1 apt_status_btn dark"
                                onClick={() => reschedule_modal(row._id)}
                            >
                                <MdOutlineAutorenew size={18} />
                            </button>
                        </OverlayTrigger>
                    </>
                )}
                {row.status === "Accept" && (
                    <button
                        className="btn btn-sm apt_accept_btn"
                        onClick={() => handleOpenStartAppointment(row)}
                    >
                        Start Appointment
                    </button>
                )}
                {row.status === "Completed" && (
                    <span className="btn btn-sm apt_complete_btn">Complete</span>
                )}
                {row.status === "Cancel" && (
                    <span className="btn btn-sm apt_cancel_btn">Cancelled</span>
                )}

            </div>
        ),
        width: '130px',
        center: true
    }]

    const [activeTab, setActiveTab] = useState('Pending')

    // Filter by status based on active tab
    const filteredData = useMemo(() => {
        if (!appointment) return []
        const map = {
            'Pending': ['Pending'],
            'Accepted': ['Accept'],
            'Completed': ['Completed'],
            'Cancelled': ['Cancel']
        }
        const allowed = map[activeTab] || []
        return appointment.filter(r => allowed.includes(r.status))
    }, [appointment, activeTab])

    const counts = useMemo(() => {
        const c = { Pending: 0, Accepted: 0, Completed: 0, Cancelled: 0 }
            ; (appointment || []).forEach(r => {
                if (r.status === 'Pending') c.Pending++
                else if (r.status === 'Accept') c.Accepted++
                else if (r.status === 'Completed') c.Completed++
                else if (r.status === 'Cancel') c.Cancelled++
            })
        return c
    }, [appointment])

    return (
        <>

            <NavBar logindata={doctor} />
            <Container className='my-4'>
                <Row className="align-items-start">
                    <DoctorSidebar doctor={doctor} />
                    <Col xs={12} md={9}>
                        <div className='appointments-card mb-3 '>
                            <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3'>
                                <h4 className='mb-0'>Consultation Appointments</h4>
                            </div>
                            <div className='appt-tabs d-flex gap-2 mb-3 flex-wrap'>
                                <button type='button' className={`appt-tab ${activeTab === 'Pending' ? 'active' : ''}`} onClick={() => setActiveTab('Pending')}>Pending <span className='count'>{counts.Pending}</span></button>
                                <button type='button' className={`appt-tab ${activeTab === 'Accepted' ? 'active' : ''}`} onClick={() => setActiveTab('Accepted')}>Accepted <span className='count'>{counts.Accepted}</span></button>
                                <button type='button' className={`appt-tab ${activeTab === 'Completed' ? 'active' : ''}`} onClick={() => setActiveTab('Completed')}>Completed <span className='count'>{counts.Completed}</span></button>
                                <button type='button' className={`appt-tab ${activeTab === 'Cancelled' ? 'active' : ''}`} onClick={() => setActiveTab('Cancelled')}>Cancelled <span className='count'>{counts.Cancelled}</span></button>
                            </div>
                            <SmartDataTable className="appointments-table" columns={columns} data={filteredData} pagination customStyles={customTableStyles} />
                        </div>
                    </Col>
                </Row>
                {/* view single surgery */}
                {
                    v && v.map((v, i) => {
                        return (
                            <Modal show={show} onHide={handleClose} centered size="lg" key={i}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Appointment Detail</Modal.Title>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className='p-2 rounded-3 border rounded' style={{ background: 'var(--white)' }}>
                                        <div className='d-flex flex-wrap align-items-center justify-content-between gap-3 p-3'>
                                            <div className='d-flex align-items-center gap-3'>
                                                <img src={v?.createdByuser?.profile_pic || require('../Visitor/assets/profile_icon_img.png')} className='rounded-3' style={{ width: 72, height: 72, objectFit: 'cover' }} />
                                                <div>
                                                    <div className='d-flex align-items-center gap-2 flex-wrap'>
                                                        <h5 className='mb-0'>{v?.patientname}</h5>
                                                    </div>
                                                    <div className='text-muted small'><FiMail className='me-1' /> {v?.createdByuser?.email}</div>
                                                    <div className='text-muted small'><FiPhone className='me-1' /> +91 {v?.createdByuser?.mobile}</div>
                                                </div>
                                            </div>
                                            <div className='d-flex align-items-center gap-4 flex-wrap appointment_model text-center'>
                                                <div>
                                                    <p className='mb-0'>Consultation Type</p>
                                                    <span className='badge d-inline-flex align-items-center gap-2' style={{ background: '#F1F5F8', color: '#253948' }}>{v?.visit_types}</span>
                                                </div>
                                                <div>
                                                    <p className='mb-0'>Consultation Status</p>
                                                    <span className='badge d-inline-flex align-items-center gap-2' style={{ background: '#E8F7EE', color: '#1F9254' }}>
                                                        {v?.status}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className='mb-0'>Consultation Fee</p>
                                                    {/* <span className='badge' style={{ background: '#E04F16', color: '#fff' }}>₹ {v?.status === "Cancel" || v?.status === "Pending" || v?.status === "Accept" ? v?.price === "" ? "0" : v?.price : v?.totalamount}</span> */}
                                                    <span className='badge' style={{ background: '#E04F16', color: '#fff' }}>₹ {v?.price}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <hr />
                                        <Row className='g-3'>
                                            <Col md={6} xs={12}>
                                                <div className='text-muted small mb-1'>Appointment Date & Time</div>
                                                <div className='d-flex align-items-center gap-2'>
                                                    <FiClock />
                                                    <span>{v?.date}, {v?.time}</span>
                                                </div>
                                            </Col>
                                            {
                                                v?.visit_types === "clinic_visit" ? <>
                                                    <Col md={6} xs={12}>
                                                        <div className='text-muted small mb-1'>Clinic Name</div>
                                                        <div className='d-flex align-items-center gap-2'>
                                                            <PiHospital size={18} />
                                                            <span>{v?.hospital_name?.name || ''}</span>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12}>
                                                        <div className='text-muted small mb-1'>Clinic Location</div>
                                                        <div className='d-flex align-items-center gap-2'>
                                                            <FiMapPin />
                                                            <span className='text-truncate'>{v?.hospital_name?.address || ''} , {v?.hospital_name?.city || ''} , {v?.hospital_name?.state || ''}</span>
                                                        </div>
                                                    </Col> </> : null
                                            }
                                            <Col xs={12}>
                                                <div className='text-muted small mb-1'>Reason</div>
                                                <div className='d-flex align-items-center gap-2'>
                                                    <span className='text-truncate'>{v?.appointment_reason || '-'}</span>
                                                </div>
                                            </Col>
                                        </Row>
                                        <hr />
                                        <div>
                                            <div className='fw-semibold mb-3'>Reports</div>
                                            <Row className='g-3'>
                                                {(v?.report || []).length > 0 ? (
                                                    v.report.map((item, idx) => (
                                                        <Col md={4} sm={6} xs={12} key={idx}>
                                                            <Card className='h-100'>
                                                                <div className='ratio ratio-16x9 bg-light'>
                                                                    <iframe src={item?.path} title={`report_${idx}`} className='w-100 h-100 border-0'></iframe>
                                                                </div>
                                                                <Card.Body className='d-flex justify-content-between align-items-center'>
                                                                    <div className='small text-muted'>Report {idx + 1}</div>
                                                                    <Button size='sm' variant='outline-primary' onClick={() => window.open(item?.path, '_blank')}>View</Button>
                                                                </Card.Body>
                                                            </Card>
                                                        </Col>
                                                    ))
                                                ) : (
                                                    <Col xs={12} md={5}>
                                                        <div className='text-muted small p-2 border rounded'>No reports uploaded.</div>
                                                    </Col>
                                                )}
                                            </Row>
                                        </div>
                                        <div>
                                            {
                                                v.status === "Completed" ? <div>
                                                    <hr />
                                                    <div className='fw-semibold mb-3'>Prescription</div>
                                                    <Row className='g-3'>
                                                        {(() => {
                                                            const remark = (v?.doctor_remark || '');
                                                            const base = remark.toLowerCase().split('?')[0];
                                                            const isImage = base.endsWith('.jpg') || base.endsWith('.jpeg') || base.endsWith('.png');
                                                            const link = isImage
                                                                ? remark
                                                                : `https://drive.google.com/viewerng/viewer?embedded=true&url=${encodeURIComponent(remark)}`;

                                                            return (
                                                                <Col md={4} sm={6}>
                                                                    <Card className='h-100'>
                                                                        <div className='ratio ratio-16x9 bg-light'>
                                                                            <iframe src={link} title={`prescription consultant`} className='border-0'></iframe>
                                                                        </div>
                                                                        <Card.Body className='d-flex justify-content-between align-items-center'>
                                                                            <div className='small text-muted'>Prescription</div>
                                                                            <Button size='sm' variant='outline-primary' onClick={() => window.open(link, '_blank')}>View</Button>
                                                                        </Card.Body>
                                                                    </Card>
                                                                </Col>
                                                            );
                                                        })()}
                                                    </Row>
                                                </div> : null
                                            }
                                        </div>
                                    </div>

                                </Modal.Body>
                            </Modal>
                        )
                    })
                }
                {/* reschedule surgery surgery */}
                {
                    schedule_data && schedule_data.map((v, i) => {
                        return (
                            <Modal show={showreschedule} onHide={handlerescheduleClose} centered size="lg" key={i}>
                                <Modal.Header closeButton>
                                    <Modal.Title>Reschedule Appointment</Modal.Title>
                                </Modal.Header>
                                <Modal.Body style={{ padding: '24px' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                        <h5 >Select New Appointment Date & Time</h5>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            marginBottom: '20px'
                                        }}>
                                            <DatePicker
                                                selected={selectedDate}
                                                onChange={(date) => setSelectedDate(date)}
                                                showTimeSelect
                                                timeFormat="hh:mm aa"
                                                timeIntervals={30}
                                                dateFormat="dd-MM-yyyy hh:mm aa"
                                                minDate={new Date()}
                                                filterTime={filterRescheduleTime}
                                                inline
                                                calendarClassName="custom-calendar"
                                                className="custom-datepicker"
                                                wrapperClassName="date-picker-wrapper"
                                            />
                                        </div>
                                    </div>
                                    <style jsx global>{`
                                        .custom-calendar {
                                            border: 1px solid #e0e0e0;
                                            border-radius: 8px;
                                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                                            padding: 15px;
                                            background: white;
                                        }
                                        .react-datepicker__header {
                                            background-color: #f8f9fa;
                                            border-bottom: 1px solid #e0e0e0;
                                            position: relative;
                                            padding-top: 12px;
                                            display: flex;
                                            justify-content: center;
                                            align-items: center;
                                        }
                                        .react-datepicker__navigation {
                                            top: 18px !important;
                                            position: absolute;
                                            font-weight: 500;
                                        }
                                        .react-datepicker__day--selected,
                                        .react-datepicker__day--keyboard-selected {
                                            background-color: #3f51b5;
                                            color: white;
                                        }
                                        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
                                            background-color: #3f51b5;
                                            color: white;
                                        }
                                        .react-datepicker__navigation--next,
                                        .react-datepicker__navigation--previous {
                                            border-color: #3f51b5;
                                        }
                                        .react-datepicker__navigation--next:hover,
                                        .react-datepicker__navigation--previous:hover {
                                            border-color: #303f9f;
                                        }
                                        .custom-calendar .react-datepicker-time__header {
                                            color: #fff !important;
                                        }
                                    `}</style>
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button onClick={reschedule_appointment}>Reschedule Date</Button>
                                </Modal.Footer>
                            </Modal>
                        )
                    })
                }
                {/* Start Appointment Modal */}
                <Modal show={showStartAppointment} onHide={handleCloseStartAppointment} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Start Appointment</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {currentAppointment ? (
                            <div className='d-flex flex-column gap-2'>
                                <div className='d-flex justify-content-between'>
                                    <span className='text-muted'>Patient Name</span>
                                    <span className='fw-semibold'>{currentAppointment.patientname}</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='text-muted'>Date</span>
                                    <span className='fw-semibold'>{currentAppointment.date}</span>
                                </div>
                                <div className='d-flex justify-content-between'>
                                    <span className='text-muted'>Time</span>
                                    <span className='fw-semibold'>{currentAppointment.time}</span>
                                </div>
                            </div>
                        ) : (
                            <p className='text-muted mb-0'>No appointment selected.</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' onClick={handleCloseStartAppointment}>
                            Close
                        </Button>
                        <Button variant='primary' onClick={confirmStartAppointment} disabled={!currentAppointment}>
                            Start Appointment
                        </Button>
                    </Modal.Footer>
                </Modal>

                {/* Prescription Writing Modal */}
                <Modal show={showPrescriptionModal} onHide={handleClosePrescriptionModal} centered size="xl">
                    <Modal.Header closeButton>
                        <Modal.Title>Prescription Box</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {currentAppointment ? (
                            <div className='d-flex flex-column gap-3'>
                                {/* Patient Info Header */}
                                <div className='bg-light p-3 rounded'>
                                    <div className='row'>
                                        <div className='col-md-6'>
                                            <strong>Patient:</strong> {currentAppointment.patientname}
                                        </div>
                                        <div className='col-md-6'>
                                            <strong>Date:</strong> {currentAppointment.date}
                                        </div>
                                    </div>
                                    <div className='row mt-2'>
                                        <div className='col-md-6'>
                                            <strong>Time:</strong> {currentAppointment.time}
                                        </div>
                                        <div className='col-md-6'>
                                            <strong>Reason:</strong> {currentAppointment.appointment_reason || 'Not provided'}
                                        </div>
                                    </div>
                                </div>

                                {/* Prescription Form */}
                                <Form>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className='mb-3'>
                                                <Form.Label><strong>BP *</strong></Form.Label>
                                                <Form.Control
                                                    type='text'
                                                    placeholder='Enter BP...'
                                                    value={prescriptionData.bp}
                                                    onChange={(e) => handlePrescriptionChange('bp', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className='mb-3'>
                                                <Form.Label><strong>Diagnosis *</strong></Form.Label>
                                                <Form.Control
                                                    rows={3}
                                                    placeholder='Enter diagnosis...'
                                                    value={prescriptionData.diagnosis}
                                                    onChange={(e) => handlePrescriptionChange('diagnosis', e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className='mb-3 mt-3'>
                                                <Form.Label><strong>Complain *</strong></Form.Label>
                                                <Form.Control
                                                    as='textarea'
                                                    rows={3}
                                                    placeholder='Enter complain...'
                                                    value={prescriptionData.complain}
                                                    onChange={(e) => handlePrescriptionChange('complain', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className='mb-3 mt-3'>
                                                <Form.Label><strong>Pas History *</strong></Form.Label>
                                                <Form.Control
                                                    as='textarea'
                                                    rows={3}
                                                    placeholder='Enter past history...'
                                                    value={prescriptionData.pasHistory}
                                                    onChange={(e) => handlePrescriptionChange('pasHistory', e.target.value)}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Form.Group className='mb-3'>
                                        <Form.Label><strong>Instructions</strong></Form.Label>
                                        <Form.Control
                                            as='textarea'
                                            rows={2}
                                            placeholder='Enter special instructions for patient...'
                                            value={prescriptionData.instructions}
                                            onChange={(e) => handlePrescriptionChange('instructions', e.target.value)}
                                        />
                                    </Form.Group>

                                    <Card className='mb-4'>
                                        <Card.Header className='bg-light'>
                                            <h6 className='mb-0'>Prescription Items</h6>
                                        </Card.Header>
                                        <Card.Body>
                                            <Row className='g-2 mb-3'>
                                                <Col md={2}>
                                                    <Form.Group>
                                                        <Form.Label>Type</Form.Label>
                                                        <Form.Select
                                                            value={newPrescriptionItem.type}
                                                            onChange={(e) => handleNewItemChange('type', e.target.value)}
                                                        >
                                                            {medicineTypes.map(type => (
                                                                <option key={type} value={type}>
                                                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Group>
                                                        <Form.Label>Medicine Name *</Form.Label>
                                                        <Form.Control
                                                            type='text'
                                                            placeholder='e.g. Paracetamol'
                                                            value={newPrescriptionItem.medicine}
                                                            onChange={(e) => handleNewItemChange('medicine', e.target.value)}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={5}>
                                                    <Form.Group>
                                                        <Form.Label>Dosage (Check when to take)</Form.Label>
                                                        <div className='d-flex flex-wrap gap-2'>
                                                            {[
                                                                { id: 'mo', label: 'MO' },
                                                                { id: 'an', label: 'AN' },
                                                                { id: 'ev', label: 'EV' },
                                                                { id: 'nt', label: 'NT' }
                                                            ].map(time => (
                                                                <div key={time.id} className='d-flex align-items-center'>
                                                                    <Form.Check
                                                                        type='checkbox'
                                                                        id={`${time.id}-check`}
                                                                        checked={newPrescriptionItem[time.id]}
                                                                        onChange={(e) => handleNewItemChange(time.id, e.target.checked)}
                                                                        className='me-1'
                                                                    />
                                                                    <Form.Label htmlFor={`${time.id}-check`} className='mb-0 me-2'>{time.label}</Form.Label>
                                                                    <Form.Control
                                                                        type='number'
                                                                        min='0'
                                                                        size='sm'
                                                                        style={{ width: '40px' }}
                                                                        value={newPrescriptionItem[`${time.id}Dose`]}
                                                                        onChange={(e) => handleNewItemChange(`${time.id}Dose`, Math.max(0, e.target.value))}
                                                                        disabled={!newPrescriptionItem[time.id]}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Group>
                                                        <Form.Label>Instruction</Form.Label>
                                                        <Form.Select
                                                            value={newPrescriptionItem.instruction}
                                                            onChange={(e) => handleNewItemChange('instruction', e.target.value)}
                                                        >
                                                            {instructionOptions.map(opt => (
                                                                <option key={opt} value={opt}>{opt}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={1}>
                                                    <Form.Group>
                                                        <Form.Label>Days</Form.Label>
                                                        <Form.Control
                                                            type='number'
                                                            min='1'
                                                            value={newPrescriptionItem.days}
                                                            onChange={(e) => handleNewItemChange('days', Math.max(1, e.target.value))}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>

                                            <div className='d-flex justify-content-between align-items-center mb-3'>
                                                <div>
                                                    <strong>Total Quantity: {newPrescriptionItem.quantity} {newPrescriptionItem.type}s</strong>
                                                </div>
                                                <Button
                                                    variant='primary'
                                                    size='sm'
                                                    onClick={addPrescriptionItem}
                                                    disabled={!newPrescriptionItem.medicine.trim() || !['mo', 'an', 'ev', 'nt'].some(t => newPrescriptionItem[t])}
                                                >
                                                    Add to Prescription
                                                </Button>
                                            </div>

                                            {prescriptionData.prescriptionItems.length > 0 && (
                                                <Table striped bordered size='sm' className='mt-3'>
                                                    <thead>
                                                        <tr>
                                                            <th>Medicine</th>
                                                            <th>Type</th>
                                                            <th>Dosage</th>
                                                            <th>Days</th>
                                                            <th>Qty</th>
                                                            <th>Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {prescriptionData.prescriptionItems.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>{item.medicine}</td>
                                                                <td>{item.type}</td>
                                                                <td>
                                                                    {[
                                                                        { id: 'mo', label: 'MO' },
                                                                        { id: 'an', label: 'AN' },
                                                                        { id: 'ev', label: 'EV' },
                                                                        { id: 'nt', label: 'NT' }
                                                                    ]
                                                                        .filter(time => item[time.id])
                                                                        .map(time => `${time.label}(${item[`${time.id}Dose`]})`)
                                                                        .join(', ')}
                                                                </td>
                                                                <td>{item.days}</td>
                                                                <td>{item.quantity} {item.type}s</td>
                                                                <td>
                                                                    <Button
                                                                        variant='link'
                                                                        size='sm'
                                                                        className='text-danger p-0'
                                                                        onClick={() => removePrescriptionItem(index)}
                                                                    >
                                                                        <MdClose size={18} />
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            )}
                                        </Card.Body>
                                    </Card>

                                    <Row className='g-3'>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label><strong>Follow-up Date</strong></Form.Label>
                                                <DatePicker selected={followUpDate} onChange={setFollowUpDate} dateFormat='dd-MM-yyyy' className='form-control' minDate={new Date()} placeholderText='Select follow-up date' />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label><strong>Follow-up Time</strong></Form.Label>
                                                <DatePicker selected={followUpTime} onChange={setFollowUpTime} showTimeSelect showTimeSelectOnly timeIntervals={30} timeCaption='Time' dateFormat='hh:mm aa' className='form-control' placeholderText='Select time' />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                </Form>
                            </div>
                        ) : (
                            <p className='text-muted mb-0'>No appointment data available.</p>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' onClick={handleClosePrescriptionModal}>
                            Cancel
                        </Button>
                        <Button
                            variant='primary'
                            onClick={submitPrescription}
                            disabled={
                                !prescriptionData.diagnosis.trim() ||
                                (prescriptionData.prescriptionItems?.length || 0) === 0
                            }
                        >
                            Save Prescription
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={showChoosePrescription} onHide={handleCloseChoosePrescription} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Choose Prescription Option</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Select an option</Form.Label>
                            <Form.Select value={prescriptionOption} onChange={(e) => setPrescriptionOption(e.target.value)}>
                                <option value='write'>Write prescription</option>
                                <option value='upload'>Upload prescription image</option>
                                <option value='none'>not add prescription</option>
                            </Form.Select>
                        </Form.Group>
                        {prescriptionOption === 'upload' && (
                            <Form.Group className='mt-3'>
                                <Form.Label>Upload prescription image</Form.Label>
                                <Form.Control type='file' accept='image/*' multiple onChange={(e) => setPrescriptionUploadFiles(Array.from(e.target.files || []))} />
                            </Form.Group>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' onClick={handleCloseChoosePrescription}>Cancel</Button>
                        <Button variant='primary' onClick={handleContinueChoosePrescription} disabled={uploadingPrescription}>Continue</Button>
                    </Modal.Footer>
                </Modal>

            </Container >
            <div
                ref={printRef}
                style={{ position: 'absolute', left: -9999, top: -9999, width: 794, background: '#ffffff', color: '#111827', fontFamily: 'Inter, Arial, Helvetica, sans-serif', lineHeight: 1.2, letterSpacing: 0 }}
            >
                <div style={{ background: '#16A498', color: '#fff', padding: '20px 20px' }}>
                    <div style={{ fontSize: 36, fontWeight: 800, textAlign: 'center' }}>Dr. {doctor?.name || '-'}</div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, marginTop: 8, justifyContent: 'center' }}>
                        {doctor?.email && <div>{doctor.email}</div>}
                        {doctor?.mobile && <div>{doctor.mobile}</div>}
                    </div>
                </div>
                <div style={{ padding: 24, lineHeight: 1.25 }}>
                    <div style={{ background: '#132031', color: '#fff', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                            Patient Name : <span style={{ fontWeight: 600 }}>{currentAppointment?.patientname || '-'}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                            Date : <span style={{ fontWeight: 400 }}>{currentAppointment ? `${currentAppointment.date}${currentAppointment.time ? `, ${currentAppointment.time}` : ''}` : '-'}</span>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                            BP : <span style={{ fontWeight: 400 }}>{prescriptionData?.bp ? `${prescriptionData.bp}` : '-'}</span>
                        </div>
                    </div>
                    {prescriptionData?.complain ? (
                        <div style={{ background: '#F2F6FF', borderRadius: 8, padding: '10px 14px', marginTop: 12, lineHeight: 1.25 }}>
                            <div style={{ color: '#6B7280', fontWeight: 700, fontSize: 13, lineHeight: '18px' }}>Complains :</div>
                            <div style={{ marginTop: 4, fontSize: 14, lineHeight: '20px' }}>{prescriptionData.complain}</div>
                        </div>
                    ) : null}
                    {prescriptionData?.pasHistory ? (
                        <div style={{ background: '#F2F6FF', borderRadius: 8, padding: '10px 14px', marginTop: 10, lineHeight: 1.25 }}>
                            <div style={{ color: '#6B7280', fontWeight: 700, fontSize: 13, lineHeight: '18px' }}>Past History :</div>
                            <div style={{ marginTop: 4, fontSize: 14, lineHeight: '20px' }}>{prescriptionData.pasHistory}</div>
                        </div>
                    ) : null}
                    {prescriptionData?.diagnosis ? (
                        <div style={{ background: '#F2F6FF', borderRadius: 8, padding: '10px 14px', marginTop: 10, lineHeight: 1.25 }}>
                            <div style={{ color: '#6B7280', fontWeight: 700, fontSize: 13, lineHeight: '18px' }}>Dignosis :</div>
                            <div style={{ marginTop: 4, fontSize: 14, lineHeight: '20px' }}>{prescriptionData.diagnosis}</div>
                        </div>
                    ) : null}

                    {(prescriptionData?.prescriptionItems || []).length > 0 ? (
                        <div style={{ background: '#FFFFFF', borderRadius: 8, padding: '10px 14px', marginTop: 12, border: '1px solid #E5E7EB' }}>
                            <div style={{ color: '#111827', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Prescription</div>
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', fontSize: 12, fontWeight: 700, color: '#374151', borderBottom: '1px solid #E5E7EB', paddingBottom: 6 }}>
                                    <div style={{ flex: 2 }}>Medicine</div>
                                    <div style={{ flex: 1 }}>Type</div>
                                    <div style={{ flex: 2 }}>Dosage</div>
                                    <div style={{ width: 60, textAlign: 'center' }}>Days</div>
                                    <div style={{ width: 70, textAlign: 'center' }}>Qty</div>
                                </div>
                                {(prescriptionData.prescriptionItems || []).map((item, idx) => {
                                    const times = [];
                                    if (item.mo) times.push(`MO(${item.moDose})`);
                                    if (item.an) times.push(`AN(${item.anDose})`);
                                    if (item.ev) times.push(`EV(${item.evDose})`);
                                    if (item.nt) times.push(`NT(${item.ntDose})`);
                                    return (
                                        <div key={idx} style={{ display: 'flex', fontSize: 12, color: '#111827', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                                            <div style={{ flex: 2 }}>
                                                <div style={{ fontWeight: 600 }}>{item.medicine}</div>
                                                {item.instruction && item.instruction !== '-SELECT-' ? (
                                                    <div style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>Instr: {item.instruction}</div>
                                                ) : null}
                                            </div>
                                            <div style={{ flex: 1 }}>{item.type}</div>
                                            <div style={{ flex: 2 }}>{times.join(', ')}</div>
                                            <div style={{ width: 60, textAlign: 'center' }}>{item.days}</div>
                                            <div style={{ width: 70, textAlign: 'center' }}>{item.quantity}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    {(followUpDate || followUpTime) ? (
                        <div style={{ background: '#FEF3C7', borderRadius: 8, padding: '10px 14px', marginTop: 12 }}>
                            <div style={{ color: '#92400E', fontWeight: 700, fontSize: 13, lineHeight: '18px' }}>Follow-up :</div>
                            <div style={{ marginTop: 4, fontSize: 14 }}>
                                {followUpDate ? `Date: ${format(followUpDate, 'dd-MM-yyyy')}` : ''}
                                {followUpDate && followUpTime ? ' | ' : ''}
                                {followUpTime ? `Time: ${format(followUpTime, 'hh:mm a')}` : ''}
                            </div>
                        </div>
                    ) : null}
                    {prescriptionData?.instructions ? (
                        <div style={{ background: '#EFF6FF', borderRadius: 8, padding: '10px 14px', marginTop: 12 }}>
                            <div style={{ color: '#6B7280', fontWeight: 700, fontSize: 13, lineHeight: '18px' }}>Instructions :</div>
                            <div style={{ marginTop: 4, fontSize: 14 }}>
                                {prescriptionData.instructions.split('\n').map((ln, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: i ? 6 : 0, lineHeight: '20px' }}>
                                        <div style={{ width: 6, height: 6, borderRadius: 3, background: '#6B7280' }} />
                                        <div>{ln}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                    <div style={{ position: 'relative', height: 80, marginTop: 32 }}>
                        <div style={{ position: 'absolute', bottom: 40, right: 24, width: 200, borderTop: '1px solid #E5E7EB' }} />
                        <div style={{ position: 'absolute', bottom: 18, right: 24, fontSize: 12, color: '#374151' }}>Signature</div>
                        <div style={{ position: 'absolute', bottom: 0, right: 24, fontWeight: 700 }}>Dr. {doctor?.name || '-'}</div>
                    </div>
                    <div style={{ opacity: 0.08, fontWeight: 800, fontSize: 48, marginTop: 12 }}>HEALTH EASY EMI</div>
                </div>
            </div>
            <FooterBar />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default D_Appointment