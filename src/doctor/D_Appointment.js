import React, { useEffect, useState } from 'react'
import { Badge, Button, Card, Col, Container, Dropdown, Form, ListGroup, ListGroupItem, Modal, OverlayTrigger, Row, Table, Tooltip } from 'react-bootstrap'
import DoctorSidebar from './DoctorSidebar'
import DoctorNav from './DoctorNav'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Loader from '../Loader'
import CryptoJS from "crypto-js";
import Swal from 'sweetalert2'
import SmartDataTable from '../components/SmartDataTable'
import { MdClose, MdDone, MdOutlineAutorenew, MdOutlineRemoveRedEye, MdEdit, MdDelete, MdMoreVert } from 'react-icons/md'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'
import jsPDF from 'jspdf'

const D_Appointment = () => {
    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [doctor, setdoctor] = useState(null)
    const [token, settoken] = useState(null)


    useEffect(() => {
        var getlocaldata = localStorage.getItem('healthdoctor');
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
            url: 'https://healtheasy-o25g.onrender.com/doctor/appointments/list',
            headers: {
                Authorization: token
            }
        }).then((res) => {
            // console.log(res.data.Data)
            setappointment(res.data.Data)
        }).catch(function (error) {
            console.log(error);
            // toast(error.response.data.Message,{className:'custom-toast-error'})
        }).finally(() => {
            setloading(false)
        });
    }

    const appointmentbtn = async (id, s) => {
        setloading(true)
        await axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/appointments/changestatus',
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
            console.log(error);
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
        console.log(datasingle)
    }

    // reschedule appoinetment date
    const [selectedDate, setSelectedDate] = useState(null);

    const [showreschedule, setrescheduleShow] = useState(false);
    const [schedule_data, setschedule_data] = useState(null);

    const handlerescheduleClose = () => setrescheduleShow(false);
    const handlerescheduleShow = () => setrescheduleShow(true);

    const reschedule_modal = (id) => {
        var data = appointment.filter((v) => {
            return v._id === id
        })
        setschedule_data(data)
        // console.log(data)
        handlerescheduleShow()
    }
    const handleOpenStartAppointment = (appointmentRow) => {
        setCurrentAppointment(appointmentRow);
        setStartNotes('');
        setShowStartAppointment(true);
    };

    const handleCloseStartAppointment = () => {
        setShowStartAppointment(false);
        setCurrentAppointment(null);
        setStartNotes('');
    };

    const confirmStartAppointment = () => {
        setShowStartAppointment(false);
        setShowPrescriptionModal(true);
    };

    const [showStartAppointment, setShowStartAppointment] = useState(false);
    const [currentAppointment, setCurrentAppointment] = useState(null);
    const [startNotes, setStartNotes] = useState('');

    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [prescriptionData, setPrescriptionData] = useState({
        diagnosis: '',
        medications: '',
        instructions: '',
        followUp: ''
    });

    const handleClosePrescriptionModal = () => {
        setShowPrescriptionModal(false);
        setPrescriptionData({
            diagnosis: '',
            medications: '',
            instructions: '',
            followUp: ''
        });
        setCurrentAppointment(null);
        setStartNotes('');
    };

    const handlePrescriptionChange = (field, value) => {
        setPrescriptionData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generatePrescriptionPDF = () => {
        const doc = new jsPDF();
        
        // Set up the document
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        let yPosition = 30;
        
        // Header - Clinic Name
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('HEALTH EMI CLINIC', pageWidth / 2, yPosition, { align: 'center' });
        
        yPosition += 10;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('Medical Prescription', pageWidth / 2, yPosition, { align: 'center' });
        
        // Line separator
        yPosition += 15;
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        
        // Doctor Information
        yPosition += 15;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Doctor Information:', margin, yPosition);
        
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(`Dr. ${doctor?.name || 'N/A'}`, margin, yPosition);
        
        yPosition += 6;
        doc.text(`Specialty: ${doctor?.specialty || 'N/A'}`, margin, yPosition);
        
        yPosition += 6;
        doc.text(`Qualification: ${doctor?.qualification || 'N/A'}`, margin, yPosition);
        
        // Patient Information
        yPosition += 15;
        doc.setFont('helvetica', 'bold');
        doc.text('Patient Information:', margin, yPosition);
        
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        doc.text(`Patient Name: ${currentAppointment?.patientname || 'N/A'}`, margin, yPosition);
        
        yPosition += 6;
        doc.text(`Date: ${currentAppointment?.date || 'N/A'}`, margin, yPosition);
        
        yPosition += 6;
        doc.text(`Time: ${currentAppointment?.time || 'N/A'}`, margin, yPosition);
        
        if (currentAppointment?.appointment_reason) {
            yPosition += 6;
            doc.text(`Reason for Visit: ${currentAppointment.appointment_reason}`, margin, yPosition);
        }
        
        // Appointment Notes
        if (startNotes) {
            yPosition += 15;
            doc.setFont('helvetica', 'bold');
            doc.text('Appointment Notes:', margin, yPosition);
            
            yPosition += 8;
            doc.setFont('helvetica', 'normal');
            const notesLines = doc.splitTextToSize(startNotes, pageWidth - 2 * margin);
            doc.text(notesLines, margin, yPosition);
            yPosition += notesLines.length * 6;
        }
        
        // Diagnosis
        yPosition += 15;
        doc.setFont('helvetica', 'bold');
        doc.text('Diagnosis:', margin, yPosition);
        
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        const diagnosisLines = doc.splitTextToSize(prescriptionData.diagnosis, pageWidth - 2 * margin);
        doc.text(diagnosisLines, margin, yPosition);
        yPosition += diagnosisLines.length * 6;
        
        // Medications
        yPosition += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('Prescribed Medications:', margin, yPosition);
        
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        const medicationsLines = doc.splitTextToSize(prescriptionData.medications, pageWidth - 2 * margin);
        doc.text(medicationsLines, margin, yPosition);
        yPosition += medicationsLines.length * 6;
        
        // Instructions
        if (prescriptionData.instructions) {
            yPosition += 10;
            doc.setFont('helvetica', 'bold');
            doc.text('Instructions:', margin, yPosition);
            
            yPosition += 8;
            doc.setFont('helvetica', 'normal');
            const instructionsLines = doc.splitTextToSize(prescriptionData.instructions, pageWidth - 2 * margin);
            doc.text(instructionsLines, margin, yPosition);
            yPosition += instructionsLines.length * 6;
        }
        
        // Follow-up
        if (prescriptionData.followUp) {
            yPosition += 10;
            doc.setFont('helvetica', 'bold');
            doc.text('Follow-up:', margin, yPosition);
            
            yPosition += 8;
            doc.setFont('helvetica', 'normal');
            const followUpLines = doc.splitTextToSize(prescriptionData.followUp, pageWidth - 2 * margin);
            doc.text(followUpLines, margin, yPosition);
            yPosition += followUpLines.length * 6;
        }
        
        // Footer
        yPosition += 30;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('This is a digitally generated prescription from Health EMI Clinic System', pageWidth / 2, yPosition, { align: 'center' });
        
        yPosition += 6;
        doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
        
        // Doctor's signature area
        yPosition += 20;
        doc.setFont('helvetica', 'normal');
        doc.text('Doctor\'s Signature: ________________________', pageWidth - margin - 80, yPosition);
        
        // Save the PDF
        const fileName = `prescription_${currentAppointment?.patientname?.replace(/\s+/g, '_') || 'patient'}_${Date.now()}.pdf`;
        doc.save(fileName);
        
        return fileName;
    };
    
    const submitPrescription = () => {
        if (!prescriptionData.diagnosis.trim() || !prescriptionData.medications.trim()) {
            Swal.fire({
                title: "Required Fields Missing",
                text: "Please fill in diagnosis and medications",
                icon: "warning",
            });
            return;
        }
    
        // Generate and download PDF
        const fileName = generatePrescriptionPDF();
    
        // Here you can add API call to save prescription
        console.log('Prescription Data:', {
            appointmentId: currentAppointment._id,
            patientName: currentAppointment.patientname,
            ...prescriptionData,
            notes: startNotes
        });
    
        Swal.fire({
            title: "Prescription Created Successfully!",
            text: `PDF has been downloaded as ${fileName}`,
            icon: "success",
        });
    
        handleClosePrescriptionModal();
    };
    const formattedDateTime = selectedDate
        ? format(selectedDate, 'dd-MM-yyyy hh:mm a')
        : '';
    const reschedule_appointment = (date) => {
        // Split at the space before the time
        const [datePart, timePart, meridiem] = formattedDateTime.split(' ');
        // Combine time + meridiem
        const timeWithMeridiem = `${timePart} ${meridiem}`;
        // console.log(apt_data, datePart, timeWithMeridiem )
        // console.log(schedule_data)

        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/doctor/appointments/reschedule',
            headers: {
                Authorization: token
            },
            data: {
                appointmentid: schedule_data[0]._id,
                date: datePart,
                time: timeWithMeridiem
            }
        }).then((res) => {
            // console.log('doctor ', res.data.Data)
            Swal.fire({
                title: "Appointment Rescheduled Done...",
                icon: "success",
            });
            appointmentlist()
            handlerescheduleClose()
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });

    }

    const renderTooltip = (label) => (props) => (
        <Tooltip id="button-tooltip" {...props}>
            {label} Appointment
        </Tooltip>
    );

    // Generate initials for profile picture fallback
    const getInitials = (name) => {
        if (!name) return 'N/A';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        const statusConfig = {
            'Accept': { bg: '#10B981', text: 'Accepted', dot: '#10B981' },
            'Pending': { bg: '#F59E0B', text: 'Pending', dot: '#F59E0B' },
            'Cancel': { bg: '#EF4444', text: 'Cancelled', dot: '#EF4444' },
            'Discharged': { bg: '#10B981', text: 'Discharged', dot: '#10B981' },
            'Ext. hospitalization': { bg: '#F97316', text: 'Ext. hospitalization', dot: '#F97316' },
            'Unavailable': { bg: '#6B7280', text: 'Unavailable', dot: '#6B7280' },
            'Surgical intervention': { bg: '#8B5CF6', text: 'Surgical intervention', dot: '#8B5CF6' },
            'In surgery': { bg: '#EAB308', text: 'In surgery', dot: '#EAB308' },
            'Expected hospital stay': { bg: '#8B5CF6', text: 'Expected hospital stay', dot: '#8B5CF6' }
        };
        return statusConfig[status] || { bg: '#6B7280', text: status, dot: '#6B7280' };
    };

    // Custom table styles
    const customTableStyles = {
        table: {
            style: {
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            },
        },
        headCells: {
            style: {
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: '#F9FAFB',
                color: '#374151',
                borderBottom: '1px solid #E5E7EB',
                paddingTop: '16px',
                paddingBottom: '16px',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        rows: {
            style: {
                borderBottom: '1px solid #F3F4F6',
                '&:hover': {
                    backgroundColor: '#F9FAFB',
                    cursor: 'pointer'
                },
                '&:last-child': {
                    borderBottom: 'none'
                }
            },
        },
        cells: {
            style: {
                paddingTop: '16px',
                paddingBottom: '16px',
                paddingLeft: '16px',
                paddingRight: '16px',
                fontSize: '14px',
                color: '#374151'
            },
        },
        pagination: {
            style: {
                borderTop: '1px solid #E5E7EB',
                backgroundColor: '#F9FAFB'
            }
        }
    };

    // table data
    const columns = [{
        name: 'No',
        cell: (row, index) => index + 1,
        width: '50px'
    }, {
        name: 'Patient Name',
        selector: row => row.patientname,
        cell: row => (
            <div className="d-flex align-items-center gap-3">
                <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#6366F1',
                        fontSize: '14px'
                    }}
                >
                    {getInitials(row.patientname)}
                </div>
                <span className="fw-medium" style={{ color: '#111827' }}>{row.patientname}</span>
            </div>
        ),
        // sortable: true,
    },
    {
        name: 'Diseases',
        selector: row => row.surgerydetails?.name,
        cell: row => (
            <span style={{ color: '#6B7280', fontSize: '14px' }}>
                {row.surgerydetails?.name || 'General Consultation OR Not Specified'}
            </span>
        ),
        // sortable: true,
    },
    {
        name: 'Date & Time',
        selector: row => row.date,
        cell: row => (
            <span style={{ color: '#6B7280', fontSize: '14px' }}>
                {row.date} , {row.time}
            </span>
        ),
        // sortable: true,
    },
    {
        name: 'Status',
        cell: row => {
            const statusInfo = getStatusBadge(row.status);
            return (
                <div className="d-flex align-items-center gap-2">
                    <div
                        className="rounded-circle"
                        style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: statusInfo.dot
                        }}
                    ></div>
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>
                        {statusInfo.text}
                    </span>
                </div>
            );
        },
        // sortable: true,
        width: '120px',
    },
    // {
    //     name: 'Payment Status',
    //     selector: row => row.payment_status,
    //     cell: row => {
    //         const statusInfo = getStatusBadge(row.payment_status);
    //         return (
    //             <div className="d-flex align-items-center gap-2">
    //                 <div
    //                     className="rounded-circle"
    //                     style={{
    //                         width: '8px',
    //                         height: '8px',
    //                         backgroundColor: statusInfo.dot
    //                     }}
    //                 ></div>
    //                 <span style={{ color: '#6B7280', fontSize: '14px' }}>
    //                     {statusInfo.text}
    //                 </span>
    //             </div>
    //         );
    //     },
    //     // sortable: true,
    //     width: '150px'
    // },
    {
        name: 'View',
        cell: row => (
            <OverlayTrigger placement="top" overlay={renderTooltip('View Details')}>
                <button
                    className="btn btn-sm p-1"
                    style={{
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#6366F1',
                        borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    onClick={() => btnview(row._id)}
                >
                    <MdOutlineRemoveRedEye size={18} />
                </button>
            </OverlayTrigger>
        ),
        width: '80px'
    }, {
        name: 'Action',
        center: true,
        cell: row => (
            <div className="d-flex align-items-center gap-1">
                {row.status === "Pending" && (
                    <>
                        <OverlayTrigger placement="top" overlay={renderTooltip('Accept')}>
                            <button
                                className="btn btn-sm p-1"
                                style={{
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: '#10B981',
                                    borderRadius: '6px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#F0FDF4'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                onClick={() => appointmentbtn(row._id, 'Accept')}
                            >
                                <MdDone size={18} />
                            </button>
                        </OverlayTrigger>

                        <OverlayTrigger placement="top" overlay={renderTooltip('Cancel')}>
                            <button
                                className="btn btn-sm p-1"
                                style={{
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: '#EF4444',
                                    borderRadius: '6px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#FEF2F2'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                onClick={() => appointmentbtn(row._id, 'Cancel')}
                            >
                                <MdClose size={18} />
                            </button>
                        </OverlayTrigger>

                        <OverlayTrigger placement="top" overlay={renderTooltip('Reschedule')}>
                            <button
                                className="btn btn-sm p-1"
                                style={{
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    color: '#6B7280',
                                    borderRadius: '6px'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                onClick={() => reschedule_modal(row._id)}
                            >
                                <MdOutlineAutorenew size={18} />
                            </button>
                        </OverlayTrigger>
                    </>
                )}
                {row.status === "Accept" && (
                    <OverlayTrigger placement="top" overlay={renderTooltip('Start')}>
                        <button
                            className="btn btn-sm p-1"
                            style={{
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: '#2563EB',
                                borderRadius: '6px'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#EFF6FF'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            onClick={() => handleOpenStartAppointment(row)}
                        >
                            {/* <MdPlayArrow size={18} /> */}
                            Start Apt.
                        </button>
                    </OverlayTrigger>
                )}

            </div>
        ),
        width: '130px',
        center: true
    }]


    return (
        <>
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <DoctorSidebar />
                    <Col xs={12} md={9} lg={10} className='p-3'>
                        <DoctorNav doctorname={doctor && doctor.name} />
                        <div className='bg-white rounded p-2'>
                            <h5 className='mb-4'>All Appointment</h5>
                            <div className='p-3'>
                                <SmartDataTable columns={columns} data={appointment ? appointment : []} pagination customStyles={customTableStyles} />
                            </div>
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
                                    <Row className="g-3">
                                        <Col xs={12} md={6}>
                                            <Card className="mb-4 border-light">
                                                <Card.Body>
                                                    <Card.Title className="label_head">Patient Information</Card.Title>
                                                    <Row>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Patient Name:</span>
                                                                <p>{v?.patientname}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Patient Mobile:</span>
                                                                <p>{v?.mobile}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={6}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Blood Group:</span>
                                                                <p>{!v?.createdByuser?.blood_group ? 'Not Defined.' : v?.createdByuser?.blood_group}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={6}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Gender:</span>
                                                                <p>{!v?.createdByuser?.gender ? 'Not Defined.' : v?.createdByuser?.gender}</p>
                                                            </div>
                                                        </Col>
                                                        {!v?.alt_name ? '' : <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Alternative Name:</span>
                                                                <p>{v?.alt_name}</p>
                                                            </div>
                                                        </Col>}
                                                        {!v?.alt_mobile ? '' : <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Alternative Mobile:</span>
                                                                <p>{v?.alt_mobile}</p>
                                                            </div>
                                                        </Col>}
                                                    </Row>
                                                </Card.Body>
                                            </Card>

                                        </Col>
                                        <Col md={6}>
                                            <Card className="mb-4 border-light">
                                                <Card.Body>
                                                    <Card.Title className="label_head">Surgery Information</Card.Title>
                                                    <Row>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Surgery:</span>
                                                                <p>{v?.surgerydetails?.name}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Date & Time:</span>
                                                                <p>{v?.date} , {v?.time}</p>
                                                            </div>
                                                        </Col>
                                                        <Col xs={12}>
                                                            <div className='label_box'>
                                                                <span className="label_title">Reason:</span>
                                                                <p>{v?.appointment_reason}</p>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4}>
                                            <Card className='border-light text-center'>
                                                <Card.Body>
                                                    <Card.Title className="label_head">Payment Status</Card.Title>
                                                    <Badge className="rounded-pill px-4 py-2 fs-6" bg={v?.payment_status === "Pending" ? "warning" : "success"}>{v.payment_status}</Badge>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={4}>
                                            <Card className='border-light'>
                                                <Card.Body className="text-center">
                                                    <Card.Title className="label_head">Visit Type</Card.Title>
                                                    <div className='label_box'>
                                                        <Badge className="rounded-pill px-4 py-2 fs-6" bg={'secondary'}>{v?.visit_types}</Badge>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card className="border-light">
                                                <Card.Body>
                                                    <Card.Title className="label_head">Features Available</Card.Title>
                                                    <div className='d-flex flex-wrap gap-2'>
                                                        {
                                                            v?.surgerydetails?.additional_features?.split(',')?.map((feature, index) => {
                                                                const colors = [
                                                                    "primary", "secondary", "success", "warning", "info"
                                                                ];

                                                                // Pick a random color class
                                                                const randomColor = colors[Math.floor(Math.random() * colors.length)];

                                                                return (
                                                                    <Badge
                                                                        className={`me-1 bg-${randomColor}-subtle text-${randomColor} fs-6 fw-normal px-3 py-2 rounded-pill`}
                                                                        key={index}
                                                                    >
                                                                        {feature}
                                                                    </Badge>
                                                                );
                                                            })
                                                        }
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={6}>
                                            <Card className="border-light">
                                                <Card.Body>
                                                    <Card.Title className="label_head">Reports</Card.Title>
                                                    {
                                                        v?.report?.length === 0 ? <div className="label_box"><p>No Reports.</p></div> : v?.report?.map((v, i) => {
                                                            return (
                                                                <div key={i}>
                                                                    <iframe src={v?.name} className='img-thumbnail'></iframe>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
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
                                    <Modal.Title>Reschedule Surgery</Modal.Title>
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
                                                dateFormat="MMMM d, yyyy h:mm aa"
                                                minDate={new Date()}
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
                                    <span className='text-muted'>Patient</span>
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
                                <div>
                                    <span className='text-muted d-block'>Reason</span>
                                    <span>{currentAppointment.appointment_reason || 'Not provided'}</span>
                                </div>
                                <Form.Group className='mt-3'>
                                    <Form.Label>Notes</Form.Label>
                                    <Form.Control
                                        as='textarea'
                                        rows={3}
                                        placeholder='Add notes for this appointment'
                                        value={startNotes}
                                        onChange={(e) => setStartNotes(e.target.value)}
                                    />
                                </Form.Group>
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
                <Modal show={showPrescriptionModal} onHide={handleClosePrescriptionModal} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Write Prescription</Modal.Title>
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
                                    {startNotes && (
                                        <div className='mt-2'>
                                            <strong>Notes:</strong> {startNotes}
                                        </div>
                                    )}
                                </div>

                                {/* Prescription Form */}
                                <Form>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className='mb-3'>
                                                <Form.Label><strong>Diagnosis *</strong></Form.Label>
                                                <Form.Control
                                                    as='textarea'
                                                    rows={3}
                                                    placeholder='Enter diagnosis...'
                                                    value={prescriptionData.diagnosis}
                                                    onChange={(e) => handlePrescriptionChange('diagnosis', e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className='mb-3'>
                                                <Form.Label><strong>Medications *</strong></Form.Label>
                                                <Form.Control
                                                    as='textarea'
                                                    rows={3}
                                                    placeholder='Enter medications with dosage...'
                                                    value={prescriptionData.medications}
                                                    onChange={(e) => handlePrescriptionChange('medications', e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className='mb-3'>
                                        <Form.Label><strong>Instructions</strong></Form.Label>
                                        <Form.Control
                                            as='textarea'
                                            rows={3}
                                            placeholder='Enter special instructions for patient...'
                                            value={prescriptionData.instructions}
                                            onChange={(e) => handlePrescriptionChange('instructions', e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group className='mb-3'>
                                        <Form.Label><strong>Follow-up</strong></Form.Label>
                                        <Form.Control
                                            type='text'
                                            placeholder='Next appointment or follow-up instructions...'
                                            value={prescriptionData.followUp}
                                            onChange={(e) => handlePrescriptionChange('followUp', e.target.value)}
                                        />
                                    </Form.Group>
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
                            disabled={!prescriptionData.diagnosis.trim() || !prescriptionData.medications.trim()}
                        >
                            Save Prescription
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container >
            {loading ? <Loader /> : ''
            }
        </>
    )
}

export default D_Appointment