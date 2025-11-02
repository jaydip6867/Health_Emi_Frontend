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
        setShowStartAppointment(true);
        console.log(appointmentRow)
    };

    const handleCloseStartAppointment = () => {
        setShowStartAppointment(false);
        setCurrentAppointment(null);
    };

    const confirmStartAppointment = () => {
        setShowStartAppointment(false);
        setShowPrescriptionModal(true);
    };

    const [showStartAppointment, setShowStartAppointment] = useState(false);
    const [currentAppointment, setCurrentAppointment] = useState(null);

    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [prescriptionData, setPrescriptionData] = useState({
        diagnosis: '',
        instructions: '',
        bp: '',
        complain: '',
        pasHistory: '',
        prescriptionItems: []
    });

    const handleClosePrescriptionModal = () => {
        setShowPrescriptionModal(false);
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

            // Calculate quantity when relevant fields change
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

        // Reset the form
        setNewPrescriptionItem({
            medicine: '',
            type: 'tablet',
            mo: false,
            an: false,
            ev: false,
            nt: false,
            moDose: 1,
            anDose: 1,
            evDose: 1,
            ntDose: 1,
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
        // Validate: require diagnosis AND (at least one item OR medications text)
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

            // Build medications text from items
            const itemsText = (prescriptionData.prescriptionItems || []).map(item => {
                const times = [];
                if (item.mo) times.push(`MO(${item.moDose})`);
                if (item.an) times.push(`AN(${item.anDose})`);
                if (item.ev) times.push(`EV(${item.evDose})`);
                if (item.nt) times.push(`NT(${item.ntDose})`);
                const instr = item.instruction && item.instruction !== '-SELECT-' ? ` - Instr: ${item.instruction}` : '';
                return `${item.medicine} (${item.type}) - ${times.join(', ')} - ${item.days} days - Qty: ${item.quantity}${instr}`;
            }).join('\n');

            const medicationsText = itemsText;

            // Generate PDF with medicationsText and return blob for upload
            const { pdfBlob, fileName } = generatePrescriptionPDF(medicationsText);

            // Create a proper File object with correct MIME type
            const pdfFile = new File([pdfBlob], fileName, {
                type: 'application/pdf',
                lastModified: Date.now()
            });

            // Create FormData and append the PDF file
            const formData = new FormData();
            formData.append('file', pdfFile);

            // Upload PDF to API
            const uploadResponse = await axios({
                method: 'post',
                url: 'https://healtheasy-o25g.onrender.com/user/upload/multiple',
                headers: { 'Content-Type': 'multipart/form-data' },
                data: formData,
            });

            const uploadedFileUrl = Array.isArray(uploadResponse.data?.Data)
                ? uploadResponse.data?.Data?.[0]?.path || uploadResponse.data?.Data?.[0]?.url
                : uploadResponse.data?.Data?.url || uploadResponse.data?.Data;

            if (!uploadedFileUrl) throw new Error('Failed to get uploaded file URL');

            // Mark appointment complete with prescription URL
            await axios({
                method: 'post',
                url: 'https://healtheasy-o25g.onrender.com/doctor/appointments/complete',
                headers: { Authorization: token },
                data: {
                    appointmentid: currentAppointment?._id,
                    payment_mode: 'Cash',
                    totalamount: 1000,
                    doctor_remark: uploadedFileUrl
                }
            });

            Swal.fire('Success', 'Prescription saved and appointment completed!', 'success');
            appointmentlist();
            handleClosePrescriptionModal();

            // Reset form
            setPrescriptionData({ diagnosis: '', instructions: '', bp: '', complain: '', pasHistory: '', prescriptionItems: [] });
        } catch (error) {
            console.error('Error completing appointment:', error);
            Swal.fire('Failed', error.response?.data?.Message || error.message || 'Failed to complete appointment.', 'error');
        } finally {
            setloading(false);
        }
    };

    // PDF generator redesigned to match sample layout
    const generatePrescriptionPDF = (medicationsText) => {
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 16;
        let y = 0;

        // Palette matching the sample
        const teal = { r: 22, g: 164, b: 152 };
        const navy = { r: 19, g: 30, b: 49 };
        const gray600 = { r: 75, g: 85, b: 99 };
        const gray800 = { r: 31, g: 41, b: 55 };
        const border = { r: 229, g: 231, b: 235 };

        const ensureY = (delta) => {
            if (y + delta > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        // Header teal band
        doc.setFillColor(teal.r, teal.g, teal.b);
        doc.rect(0, 0, pageWidth, 46, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(26);
        const doctorName = `Dr. ${doctor?.name || ''}`.trim() || 'Dr. -';
        doc.text(doctorName, pageWidth / 2, 22, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        const degreeLine = doctor?.degree ? `(${doctor.degree})` : '';
        if (degreeLine) doc.text(degreeLine, pageWidth / 2, 32, { align: 'center' });
        const contact = [doctor?.email, doctor?.mobile || doctor?.phone].filter(Boolean).join('   •   ');
        if (contact) {
            doc.setFontSize(10);
            doc.text(contact, pageWidth / 2, 40, { align: 'center' });
        }

        y = 58;

        // Patient info rounded dark panel
        const pillH = 22;
        const pillW = pageWidth - margin * 2;
        doc.setFillColor(navy.r, navy.g, navy.b);
        doc.roundedRect(margin, y, pillW, pillH, 5, 5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        const patient = currentAppointment?.patientname || 'N/A';
        const dt = `${currentAppointment?.date || ''}${currentAppointment?.time ? `, ${currentAppointment.time}` : ''}`.trim();
        doc.text(`Patient Name :`, margin + 8, y + 7);
        doc.text(patient, margin + 45, y + 7);
        doc.text(`Date :`, pageWidth - margin - 90, y + 7);
        doc.setFont('helvetica', 'normal');
        doc.text(dt || '-', pageWidth - margin - 20, y + 7, { align: 'right' });
        y += pillH + 10;

        const boxW = pageWidth - margin * 2;

        // Helper to draw light section box with label and content
        const section = (label, content) => {
            if (!content) return;
            ensureY(34);
            const lines = doc.splitTextToSize(content, boxW - 12);
            const h = 16 + lines.length * 6;
            doc.setFillColor(246, 249, 255);
            doc.roundedRect(margin, y, boxW, h, 4, 4, 'F');
            doc.setTextColor(gray600.r, gray600.g, gray600.b);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text(`${label} :`, margin + 8, y + 9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(gray800.r, gray800.g, gray800.b);
            doc.text(lines, margin + 8, y + 16);
            y += h + 8;
        };

        const complainVal = (prescriptionData.complain || '').trim();
        const pastHistoryVal = (prescriptionData.pasHistory || '').trim();
        const diagnosisVal = (prescriptionData.diagnosis || '').trim();
        section('Complains', complainVal);
        section('Past History', pastHistoryVal);
        section('Dignosis', diagnosisVal);

        // Medicines table styled
        const rows = (prescriptionData.prescriptionItems || []).map((item, idx) => {
            const scheduleParts = [];
            if (item.mo) scheduleParts.push(`MO(${item.moDose})`);
            if (item.an) scheduleParts.push(`AN(${item.anDose})`);
            if (item.ev) scheduleParts.push(`EV(${item.evDose})`);
            if (item.nt) scheduleParts.push(`NT(${item.ntDose})`);
            return {
                no: idx + 1,
                type: (item.type || '').toString().trim() || '-',
                med: `${item.medicine || ''}`.trim(),
                sched: scheduleParts.join(', '),
                instr: item.instruction && item.instruction !== '-SELECT-' ? item.instruction : '-',
                days: `${item.days || '-'}`,
                qty: `${item.quantity || '-'}`,
            };
        });

        if (rows.length > 0) {
            ensureY(60);
            let tableY = y;
            // header bar
            doc.setFillColor(navy.r, navy.g, navy.b);
            doc.roundedRect(margin, tableY, boxW, 12, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('No.', margin + 6, tableY + 10);
            doc.text('Type', margin + 18, tableY + 8);
            doc.text('Medicine', margin + 42, tableY + 8);
            doc.text('Schedule', margin + boxW * 0.52, tableY + 8);
            doc.text('Instruction', margin + boxW * 0.72, tableY + 8);
            doc.text('Days', margin + boxW * 0.89, tableY + 8);
            doc.text('Qty', margin + boxW * 0.95, tableY + 8);
            tableY += 14;

            // rows
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            const rowH = 8;
            rows.forEach((r, i) => {
                ensureY(rowH + 6);
                if (i % 2 === 0) {
                    doc.setFillColor(252, 253, 255);
                    doc.rect(margin, tableY - 6, boxW, rowH + 4, 'F');
                }
                doc.text(`${r.no}`, margin + 6, tableY);
                doc.text(r.type, margin + 18, tableY);
                const medLines = doc.splitTextToSize(r.med, boxW * 0.45 - 6);
                doc.text(medLines, margin + 42, tableY);
                doc.text(r.sched || '-', margin + boxW * 0.52, tableY);
                const instrLines = doc.splitTextToSize(r.instr || '-', boxW * 0.15);
                doc.text(instrLines, margin + boxW * 0.72, tableY);
                doc.text(`${r.days}`, margin + boxW * 0.89, tableY);
                doc.text(`${r.qty}`, margin + boxW * 0.95, tableY);
                tableY += Math.max(rowH, (medLines.length - 1) * 6 + rowH);
            });
            y = tableY + 6;
        }

        // Instructions card (bulleted look)
        if ((prescriptionData.instructions || '').trim()) {
            ensureY(36);
            const txt = (prescriptionData.instructions || '').trim();
            const bulletLines = doc.splitTextToSize(txt, boxW - 20);
            const h = 16 + bulletLines.length * 6 + 6;
            doc.setFillColor(239, 246, 255);
            doc.roundedRect(margin, y, boxW, h, 4, 4, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(gray600.r, gray600.g, gray600.b);
            doc.text('Instructions :', margin + 8, y + 9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(gray800.r, gray800.g, gray800.b);
            // render with simple bullets
            let by = y + 16;
            bulletLines.forEach((ln) => {
                doc.circle(margin + 10, by - 2.5, 0.7, 'F');
                doc.text(ln, margin + 14, by);
                by += 6;
            });
            y += h + 6;
        }

        // Watermark
        doc.setTextColor(225, 231, 239);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(34);
        doc.text('HEALTH EASY EMI', margin, pageHeight - 22);

        // Signature area
        doc.setDrawColor(border.r, border.g, border.b);
        doc.line(pageWidth - margin - 70, pageHeight - 30, pageWidth - margin, pageHeight - 30);
        doc.setTextColor(gray800.r, gray800.g, gray800.b);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('Signature', pageWidth - margin - 70, pageHeight - 26);
        doc.setFont('helvetica', 'bold');
        doc.text(doctorName, pageWidth - margin - 35, pageHeight - 18, { align: 'center' });

        const fileName = `prescription_${currentAppointment?.patientname?.replace(/\s+/g, '_') || 'patient'}_${Date.now()}.pdf`;
        const pdfBlob = doc.output('blob');
        return { pdfBlob, fileName };
    };

    // Reschedule helpers (restored)
    const formattedDateTime = selectedDate
        ? format(selectedDate, 'dd-MM-yyyy hh:mm a')
        : '';

    const reschedule_appointment = () => {
        const [datePart, timePart, meridiem] = formattedDateTime.split(' ');
        const timeWithMeridiem = `${timePart} ${meridiem}`;

        setloading(true);
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
            Swal.fire({
                title: 'Appointment Rescheduled Successfully!',
                text: `New appointment time: ${datePart} at ${timeWithMeridiem}`,
                icon: 'success',
            });
            appointmentlist();
            handlerescheduleClose();
        }).catch(function (error) {
            console.log(error);
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
                        <div className='bg-white rounded p-3'>
                            <h5 className='mb-4'>All Appointment</h5>
                            <div>
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
                                                        !v?.report || v?.report?.length === 0 ? (
                                                            <div className="label_box"><p>No Reports.</p></div>
                                                        ) : (
                                                            <div className='d-flex flex-column gap-2'>
                                                                {v?.report?.map((report, idx) => {
                                                                    const isPDF = report?.type?.toUpperCase() === 'PDF' || report?.type?.toUpperCase() === 'DOC' || report?.type?.toUpperCase() === 'DOCX';
                                                                    const viewerUrl = `https://drive.google.com/viewerng/viewer?url=${encodeURIComponent(report?.path)}`;
                                                                    return (
                                                                        <div key={idx} className='border rounded p-2'>
                                                                            <div className='d-flex justify-content-between align-items-center mb-2'>
                                                                                <Badge bg="info" className='text-uppercase'>{report?.type || 'Document'}</Badge>
                                                                                {isPDF && (
                                                                                    <a
                                                                                        href={viewerUrl}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className='btn btn-sm btn-primary'
                                                                                    >
                                                                                        <MdOutlineRemoveRedEye className='me-1' />
                                                                                        View Report
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                            {isPDF ? (
                                                                                // <iframe 
                                                                                //     src={viewerUrl}
                                                                                //     className='w-100 border-0 rounded'
                                                                                //     style={{ height: '300px' }}
                                                                                //     title={`Report ${idx + 1}`}
                                                                                // ></iframe>
                                                                                <></>
                                                                            ) : (
                                                                                <img
                                                                                    src={report?.path}
                                                                                    alt={`Report ${idx + 1}`}
                                                                                    className='w-100 rounded img-thumbnail'
                                                                                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )
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
                                <div>
                                    <span className='text-muted d-block'>Reason</span>
                                    <span>{currentAppointment.appointment_reason || 'Not provided'}</span>
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
                                                <Col md={3}>
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
                                                <Col md={4}>
                                                    <Form.Group>
                                                        <Form.Label>Dosage (Check when to take)</Form.Label>
                                                        <div className='d-flex flex-wrap gap-3'>
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
                                                                        style={{ width: '50px' }}
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
            </Container >
            {loading ? <Loader /> : ''
            }
        </>
    )
}

export default D_Appointment