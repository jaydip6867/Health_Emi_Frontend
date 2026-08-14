import React, { useEffect, useState } from 'react'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { Col, Container, Row, Modal, Button, Form, Accordion } from 'react-bootstrap';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import HospitalSidebar from './HospitalSidebar';
import SmartDataTable from "../components/SmartDataTable";
import axios from 'axios';
import Select from "react-select";
import Swal from 'sweetalert2';
import { MdAssignmentAdd, MdOutlineRemoveRedEye } from 'react-icons/md';
import { BsGeoAlt } from 'react-icons/bs';

const HospitalDoctor = () => {

    var navigate = useNavigate();

    const [hospital, sethospital] = useState(null)
    const [token, settoken] = useState(null)
    const [doctorlist, setdoctorlist] = useState(null)
    const [loading, setloading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedBranchAssignments, setSelectedBranchAssignments] = useState([]);
    const [assignLoading, setAssignLoading] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

    const [allDoctors, setAllDoctors] = useState([]);
    const [doctorSearch, setDoctorSearch] = useState("");
    const [addDoctorList, setAddDoctorList] = useState([]);
    const [selectedAddDoctor, setSelectedAddDoctor] = useState(null);
    const [selectedAddBranches, setSelectedAddBranches] = useState([]);
    const [selectedAddBranchAssignments, setSelectedAddBranchAssignments] = useState([]);
    const [addDoctorLoading, setAddDoctorLoading] = useState(false);

    const [showDoctorResults, setShowDoctorResults] = useState(false);
    const [doctorType, setDoctorType] = useState("existing");

    const DAYS_OF_WEEK = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];

    const TIME_OPTIONS = [];
    for (let hour = 1; hour <= 12; hour += 1) {
        ["00", "30"].forEach((minute) => {
            TIME_OPTIONS.push({
                value: `${String(hour).padStart(2, "0")}:${minute}`,
                label: `${String(hour).padStart(2, "0")}:${minute}`,
            });
        });
    }

    const parseTimeValue = (timeText = "") => {
        const rawValue = String(timeText || "").trim();

        if (!rawValue) {
            return { time: "09:00", meridiem: "AM" };
        }

        const explicitMatch = rawValue.match(/^(\d{1,2}:\d{2})\s*(AM|PM)$/i);
        if (explicitMatch) {
            const [hourString, minuteString] = explicitMatch[1].split(":");
            const hour = Number(hourString);
            const minutes = String(minuteString).padStart(2, "0");
            const normalizedHour = ((hour + 11) % 12) + 1;

            return {
                time: `${String(normalizedHour).padStart(2, "0")}:${minutes}`,
                meridiem: explicitMatch[2].toUpperCase(),
            };
        }

        const fallbackMatch = rawValue.match(/^(\d{1,2}:\d{2})$/);
        if (fallbackMatch) {
            const [hourString, minuteString] = fallbackMatch[1].split(":");
            const hour = Number(hourString);
            const minutes = String(minuteString).padStart(2, "0");
            const normalizedHour = ((hour + 11) % 12) + 1;

            return {
                time: `${String(normalizedHour).padStart(2, "0")}:${minutes}`,
                meridiem: hour >= 12 ? "PM" : "AM",
            };
        }

        return { time: "09:00", meridiem: "AM" };
    };

    const combineTimeValue = (timeValue, meridiem) => {
        if (!timeValue) return "";
        return `${timeValue} ${meridiem}`.trim();
    };

    const createDefaultTiming = (existingTiming = {}) => {
        return DAYS_OF_WEEK.reduce((acc, day) => {
            const dayTiming = existingTiming?.[day] || {};
            acc[day] = {
                available: Boolean(dayTiming.available ?? false),
                slots: Array.isArray(dayTiming.slots)
                    ? dayTiming.slots.map((slot) => ({
                        start_time: slot?.start_time || "",
                        end_time: slot?.end_time || "",
                    }))
                    : [],
            };
            return acc;
        }, {});
    };

    const createBranchAssignmentPayload = (branchId, existingBranch = {}) => ({
        branchid: branchId,
        eopd_price: Number(existingBranch?.eopd_price ?? ''),
        home_visit_price: Number(existingBranch?.home_visit_price ?? ''),
        clinic_visit_price: Number(existingBranch?.clinic_visit_price ?? ''),
        timings: createDefaultTiming(existingBranch?.timings),
    });

    const buildBranchAssignments = (branchIds = [], existingBranchMap = {}) => {
        return branchIds.map((branchId) => {
            const mappedBranch = existingBranchMap[String(branchId)] || {};
            return createBranchAssignmentPayload(branchId, mappedBranch);
        });
    };

    const sanitizeBranchAssignments = (assignments = []) => {
        return assignments.map((assignment) => ({
            branchid: assignment?.branchid || "",
            eopd_price: Number(assignment?.eopd_price || 0),
            home_visit_price: Number(assignment?.home_visit_price || 0),
            clinic_visit_price: Number(assignment?.clinic_visit_price || 0),
            timings: DAYS_OF_WEEK.reduce((acc, day) => {
                const dayTiming = assignment?.timings?.[day] || { available: false, slots: [] };
                const slots = Array.isArray(dayTiming.slots)
                    ? dayTiming.slots
                        .filter((slot) => slot && (slot.start_time || slot.end_time))
                        .map((slot) => ({
                            start_time: String(slot.start_time || "").trim() || "09:00 AM",
                            end_time: String(slot.end_time || "").trim() || "05:00 PM",
                        }))
                    : [];

                acc[day] = {
                    available: Boolean(dayTiming.available),
                    slots,
                };

                return acc;
            }, {}),
        }));
    };

    const updateBranchAssignment = (branchId, updater) => {
        return (prevAssignments = []) =>
            prevAssignments.map((assignment) => {
                if (String(assignment.branchid) !== String(branchId)) {
                    return assignment;
                }

                return updater(assignment);
            });
    };

    const toggleDayAvailability = (branchId, day, setter) => {
        setter((prevAssignments = []) =>
            prevAssignments.map((assignment) => {
                if (String(assignment.branchid) !== String(branchId)) {
                    return assignment;
                }

                const currentDay = assignment.timings?.[day] || { available: false, slots: [] };

                return {
                    ...assignment,
                    timings: {
                        ...assignment.timings,
                        [day]: {
                            ...currentDay,
                            available: !currentDay.available,
                        },
                    },
                };
            })
        );
    };

    const addSlot = (branchId, day, setter) => {
        setter((prevAssignments = []) =>
            prevAssignments.map((assignment) => {
                if (String(assignment.branchid) !== String(branchId)) {
                    return assignment;
                }

                const currentSlots = assignment.timings?.[day]?.slots || [];

                return {
                    ...assignment,
                    timings: {
                        ...assignment.timings,
                        [day]: {
                            ...assignment.timings?.[day],
                            available: true,
                            slots: [
                                ...currentSlots,
                                { start_time: "09:00 AM", end_time: "05:00 PM" },
                            ],
                        },
                    },
                };
            })
        );
    };

    const removeSlot = (branchId, day, slotIndex, setter) => {
        setter((prevAssignments = []) =>
            prevAssignments.map((assignment) => {
                if (String(assignment.branchid) !== String(branchId)) {
                    return assignment;
                }

                const currentSlots = assignment.timings?.[day]?.slots || [];

                return {
                    ...assignment,
                    timings: {
                        ...assignment.timings,
                        [day]: {
                            ...assignment.timings?.[day],
                            slots: currentSlots.filter((_, index) => index !== slotIndex),
                        },
                    },
                };
            })
        );
    };

    const updateSlotTime = (branchId, day, slotIndex, field, value, setter) => {
        setter((prevAssignments = []) =>
            prevAssignments.map((assignment) => {
                if (String(assignment.branchid) !== String(branchId)) {
                    return assignment;
                }

                const currentSlots = assignment.timings?.[day]?.slots || [];

                return {
                    ...assignment,
                    timings: {
                        ...assignment.timings,
                        [day]: {
                            ...assignment.timings?.[day],
                            slots: currentSlots.map((slot, index) => {
                                if (index !== slotIndex) return slot;
                                return {
                                    ...slot,
                                    [field]: value,
                                };
                            }),
                        },
                    },
                };
            })
        );
    };

    const updateSlotTimeParts = (branchId, day, slotIndex, field, timeValue, meridiem, setter) => {
        const combinedValue = combineTimeValue(timeValue, meridiem);
        updateSlotTime(branchId, day, slotIndex, field, combinedValue, setter);
    };

    useEffect(() => {
        const getLocalData = localStorage.getItem(STORAGE_KEYS.HOSPITAL);

        if (getLocalData) {
            const bytes = CryptoJS.AES.decrypt(getLocalData, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            const data = JSON.parse(decrypted);

            if (!data) {
                navigate("/hospital");
                return;
            }

            sethospital(data.hospitalData);

            const authToken = `Bearer ${data.accessToken}`;
            settoken(authToken);

            initializeData(authToken);
        } else {
            navigate("/hospital");
        }
    }, [navigate]);

    const initializeData = async (authToken) => {
        const hospitalBranches = await getHospitalProfile(authToken);
        await getdoctors(authToken, hospitalBranches);
    };

    const getdoctors = async (authToken, hospitalBranches = []) => {
        setloading(true);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/hospital/doctors/list`,
                {
                    search: "",
                },
                {
                    headers: {
                        Authorization: authToken,
                    },
                }
            );

            const allDoctorsData =
                response?.data?.Data ||
                response?.data?.data ||
                [];

            // All doctors store for Add Doctor search
            setAllDoctors(allDoctorsData);

            // Hospital na branch IDs
            const hospitalBranchIds = hospitalBranches.map(
                (branch) => String(branch._id)
            );

            // Only doctors assigned to this hospital's branches
            const filteredDoctors = allDoctorsData.filter((doctor) => {

                const assignedBranches =
                    doctor?.assignedBranches || [];

                return assignedBranches.some((branch) => {

                    const doctorBranchId =
                        branch?.branchid || branch?._id;

                    return hospitalBranchIds.includes(
                        String(doctorBranchId)
                    );
                });
            });

            setdoctorlist(filteredDoctors);

        } catch (error) {
            console.error("Error fetching doctors:", error);
            setdoctorlist([]);
            setAllDoctors([]);
        } finally {
            setloading(false);
        }
    };

    const getHospitalProfile = async (authToken) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/hospital/profile`,
                {
                    headers: {
                        Authorization: authToken,
                    },
                }
            );

            const branchDetails =
                response?.data?.Data?.branchdetails || [];

            setBranches(branchDetails);

            return branchDetails;
        } catch (err) {
            console.log(err);
            setBranches([]);
            return [];
        }
    };

    const openProfileModal = (doctor) => {
        setDoctorProfile(doctor);
        setShowProfileModal(true);
        console.log("Doctor Profile:", doctor);
    };

    const openAssignModal = (doctor) => {
        setSelectedDoctor(doctor);

        const existingBranchMap = {};
        (doctor.assignedBranches || []).forEach((branch) => {
            existingBranchMap[String(branch.branchid || branch._id)] = branch;
        });

        const assignedIds = Object.keys(existingBranchMap);
        setSelectedBranches(assignedIds);
        setSelectedBranchAssignments(buildBranchAssignments(assignedIds, existingBranchMap));
        console.log("Selected Branch Assignments:", buildBranchAssignments(assignedIds, existingBranchMap));
        setShowAssignModal(true);
    };

    const handleBranchChange = (selectedOptions) => {
        const selectedIds = selectedOptions ? selectedOptions.map((item) => item.value) : [];
        const existingAssignments = {};
        selectedBranchAssignments.forEach((assignment) => {
            existingAssignments[String(assignment.branchid)] = assignment;
        });

        setSelectedBranches(selectedIds);
        setSelectedBranchAssignments(buildBranchAssignments(selectedIds, existingAssignments));
    };

    const assignBranches = async () => {
        if (!selectedDoctor) return;

        setAssignLoading(true);
        try {
            const payload = {
                doctorid: selectedDoctor._id,
                branchids: sanitizeBranchAssignments(selectedBranchAssignments),
            };

            const response = await axios.post(
                `${API_BASE_URL}/hospital/doctors/assign-branches`,
                payload,
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );

            await Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Branches assigned successfully.",
                confirmButtonText: "OK",
                confirmButtonColor: "#198754",
            });

            setShowAssignModal(false);
            setSelectedBranches([]);
            setSelectedBranchAssignments([]);
            setSelectedDoctor(null);

            getdoctors(token, branches);

        } catch (err) {
            console.log(err);

            Swal.fire({
                icon: "error",
                title: "Error!",
                text: err?.response?.data?.message || "Something went wrong.",
                confirmButtonColor: "#dc3545",
            });

        } finally {
            setAssignLoading(false);
        }
    };

    // search doctor for add doctor modal
    const handleDoctorSearch = (value) => {
        setDoctorSearch(value);

        if (!value.trim()) {
            setAddDoctorList(allDoctors);
            setShowDoctorResults(true);
            return;
        }

        const searchValue = value.toLowerCase().trim();

        const filtered = allDoctors.filter((doctor) =>
            doctor?.name?.toLowerCase().includes(searchValue) ||
            doctor?.email?.toLowerCase().includes(searchValue) ||
            doctor?.mobile?.toLowerCase().includes(searchValue)
        );

        setAddDoctorList(filtered);
        setShowDoctorResults(true);
    };

    const handleSelectAddDoctor = (doctor) => {
        setSelectedAddDoctor(doctor);

        const existingBranchMap = {};
        (doctor?.assignedBranches || []).forEach((branch) => {
            existingBranchMap[String(branch.branchid || branch._id)] = branch;
        });

        const assignedIds = Object.keys(existingBranchMap);
        setSelectedAddBranches(assignedIds);
        setSelectedAddBranchAssignments(buildBranchAssignments(assignedIds, existingBranchMap));
    };

    const assignDoctorBranches = async () => {
        if (!selectedAddDoctor) {
            Swal.fire({
                icon: "warning",
                title: "Select Doctor",
                text: "Please select a doctor first.",
            });
            return;
        }

        if (selectedAddBranches.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Select Branch",
                text: "Please select at least one branch.",
            });
            return;
        }

        setAddDoctorLoading(true);

        try {
            const payload = {
                doctorid: selectedAddDoctor._id,
                branchids: sanitizeBranchAssignments(selectedAddBranchAssignments),
            };

            const response = await axios.post(
                `${API_BASE_URL}/hospital/doctors/assign-branches`,
                payload,
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );

            await Swal.fire({
                icon: "success",
                title: "Success!",
                text:
                    response?.data?.message ||
                    "Doctor branches assigned successfully.",
                confirmButtonColor: "#198754",
            });

            setShowAddDoctorModal(false);

            setDoctorSearch("");
            setAddDoctorList([]);
            setSelectedAddDoctor(null);
            setSelectedAddBranches([]);
            setSelectedAddBranchAssignments([]);

            // Refresh filtered doctor list
            getdoctors(token, branches);

        } catch (error) {
            console.error(error);

            Swal.fire({
                icon: "error",
                title: "Error!",
                text:
                    error?.response?.data?.message ||
                    "Something went wrong.",
                confirmButtonColor: "#dc3545",
            });
        } finally {
            setAddDoctorLoading(false);
        }
    };

    const customTableStyles = {
        table: {
            backgroundColor: "transparent",
            borderRadius: 0,
            boxShadow: "none",
        },
    };

    const columns = [
        {
            name: "Profile",
            width: "90px",
            cell: (row) => (
                <img
                    src={row.profile_pic}
                    alt={row.name}
                    style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
            ),
        },
        {
            name: "Doctor Name",
            selector: (row) => row.name,
            sortable: true,
        },
        // {
        //     name: "Mobile",
        //     selector: (row) => row.mobile,
        //     sortable: true,
        // },
        // {
        //     name: "Email",
        //     selector: (row) => row.email,
        //     sortable: true,
        // },
        {
            name: "Qualification",
            selector: (row) => row.qualification,
            sortable: true,
        },
        // {
        //     name: "Specialty",
        //     selector: (row) => row.sub_specialty,
        //     sortable: true,
        // },
        {
            name: "Experience",
            selector: (row) => row.experience,
            sortable: true,
        },
        {
            name: "City",
            selector: (row) => row.city,
            sortable: true,
        },
        {
            name: "Status",
            cell: (row) => (
                <span
                    className={`badge ${row.is_available ? "bg-success" : "bg-danger"
                        }`}
                >
                    {row.is_available ? "Available" : "Unavailable"}
                </span>
            ),
            sortable: true,
        },
        {
            name: "Action",
            cell: (row) => (
                <div className="d-flex gap-2">
                    <Button
                        size="sm"
                        variant="info"
                        onClick={() => openProfileModal(row)}
                        className='btn btn-sm p-1 appt-view-btn'
                    >
                        <MdOutlineRemoveRedEye size={18} />
                    </Button>

                    <Button
                        size="sm"
                        variant="primary"
                        onClick={() => openAssignModal(row)}
                        className="btn btn-sm p-1 appt-view-btn"
                    >
                        <MdAssignmentAdd size={18} />
                    </Button>
                </div>
            )
        },
    ];

    return (
        <>
            <Container>
                <Row className='g-0'>
                    <HospitalSidebar hospital={hospital} />
                    <Col xs={12} lg={9} className='p-3 mt-3'>
                        <div className="appointments-card mb-3 ">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3">
                                <h4 className="mb-0">Doctors List</h4>
                                <Button
                                    className="apt_accept_btn"
                                    onClick={() => {
                                        setShowAddDoctorModal(true);
                                        setDoctorType("existing");
                                        setDoctorSearch("");
                                        setAddDoctorList([]);
                                        setSelectedAddDoctor(null);
                                        setSelectedAddBranches([]);
                                        setShowDoctorResults(false);
                                    }}
                                >
                                    Add Doctor
                                </Button>
                            </div>
                        </div>
                        <SmartDataTable
                            className="appointments-table"
                            columns={columns}
                            data={doctorlist}
                            pagination
                            highlightOnHover
                            responsive
                            striped
                            progressPending={loading}
                            customStyles={customTableStyles}
                        />
                    </Col>
                </Row>
                {/* assign branch model */}
                <Modal
                    show={showAssignModal}
                    onHide={() => setShowAssignModal(false)}
                    centered
                    size="lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Assign Branch
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">Select Branches</Form.Label>
                            <Select
                                isMulti
                                options={branches.map((b) => ({
                                    value: b._id,
                                    label: b.branchname,
                                }))}
                                value={branches
                                    .filter((branch) => selectedBranches.includes(String(branch._id)))
                                    .map((branch) => ({
                                        value: branch._id,
                                        label: branch.branchname,
                                    }))
                                }
                                onChange={handleBranchChange}
                                placeholder="Choose branches..."
                            />
                        </Form.Group>

                        {selectedBranchAssignments.length > 0 && (
                            <Accordion defaultActiveKey={selectedBranchAssignments[0]?.branchid} className="branch-accordion">
                                {selectedBranchAssignments.map((assignment) => {
                                    const branch = branches.find(
                                        (item) => String(item._id) === String(assignment.branchid)
                                    );

                                    return (
                                        <Accordion.Item key={assignment.branchid} eventKey={String(assignment.branchid)} className="mb-3 border rounded-4 overflow-hidden">
                                            <Accordion.Header>
                                                <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                                                    <span className="fw-bold text-primary">{branch?.branchname || "Branch"}</span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline-danger"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const nextIds = selectedBranches.filter(
                                                                (branchId) => String(branchId) !== String(assignment.branchid)
                                                            );
                                                            setSelectedBranches(nextIds);
                                                            setSelectedBranchAssignments((prev) =>
                                                                prev.filter(
                                                                    (item) => String(item.branchid) !== String(assignment.branchid)
                                                                )
                                                            );
                                                        }}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            </Accordion.Header>
                                            <Accordion.Body>
                                                <Row className="g-3 mb-3">
                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label>E-OPD Price</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                min="0"
                                                                value={assignment.eopd_price}
                                                                placeholder="0"
                                                                onChange={(e) =>
                                                                    setSelectedBranchAssignments((prev) =>
                                                                        prev.map((item) =>
                                                                            String(item.branchid) === String(assignment.branchid)
                                                                                ? { ...item, eopd_price: Number(e.target.value || 0) }
                                                                                : item
                                                                        )
                                                                    )
                                                                }
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label>Home Visit Price</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                min="0"
                                                                value={assignment.home_visit_price}
                                                                placeholder="0"
                                                                onChange={(e) =>
                                                                    setSelectedBranchAssignments((prev) =>
                                                                        prev.map((item) =>
                                                                            String(item.branchid) === String(assignment.branchid)
                                                                                ? { ...item, home_visit_price: Number(e.target.value || 0) }
                                                                                : item
                                                                        )
                                                                    )
                                                                }
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group>
                                                            <Form.Label>Clinic Visit Price</Form.Label>
                                                            <Form.Control
                                                                type="number"
                                                                min="0"
                                                                value={assignment.clinic_visit_price}
                                                                placeholder="0"
                                                                onChange={(e) =>
                                                                    setSelectedBranchAssignments((prev) =>
                                                                        prev.map((item) =>
                                                                            String(item.branchid) === String(assignment.branchid)
                                                                                ? { ...item, clinic_visit_price: Number(e.target.value || 0) }
                                                                                : item
                                                                        )
                                                                    )
                                                                }
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                </Row>

                                                <div>
                                                    <h6 className="fw-bold mb-3">Timings</h6>
                                                    {DAYS_OF_WEEK.map((day) => {
                                                        const dayTiming = assignment.timings?.[day] || {
                                                            available: false,
                                                            slots: [],
                                                        };

                                                        return (
                                                            <div key={`${assignment.branchid}-${day}`} className="border rounded p-2 mb-2">
                                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                                    <span className="fw-semibold text-capitalize">{day}</span>
                                                                    <Form.Check
                                                                        type="switch"
                                                                        id={`${assignment.branchid}-${day}-available`}
                                                                        label={dayTiming.available ? "Available" : "Unavailable"}
                                                                        checked={Boolean(dayTiming.available)}
                                                                        onChange={() =>
                                                                            toggleDayAvailability(
                                                                                assignment.branchid,
                                                                                day,
                                                                                setSelectedBranchAssignments
                                                                            )
                                                                        }
                                                                    />
                                                                </div>

                                                                {dayTiming.slots?.length > 0 ? (
                                                                    dayTiming.slots.map((slot, slotIndex) => (
                                                                        <div key={`${assignment.branchid}-${day}-${slotIndex}`} className="row g-2 mb-2 align-items-end">
                                                                            <div className="col-md-5">
                                                                                <Form.Group>
                                                                                    <Form.Label className="small text-muted">Start Time</Form.Label>
                                                                                    <div className="d-flex gap-2 align-items-center">
                                                                                        <Form.Select
                                                                                            value={parseTimeValue(slot.start_time).time}
                                                                                            size="8"
                                                                                            onChange={(e) =>
                                                                                                updateSlotTimeParts(
                                                                                                    assignment.branchid,
                                                                                                    day,
                                                                                                    slotIndex,
                                                                                                    "start_time",
                                                                                                    e.target.value,
                                                                                                    parseTimeValue(slot.start_time).meridiem,
                                                                                                    setSelectedBranchAssignments
                                                                                                )
                                                                                            }
                                                                                            style={{ minWidth: "110px", borderRadius: "10px" }}
                                                                                        >
                                                                                            {TIME_OPTIONS.map((option) => (
                                                                                                <option key={`start-${option.value}`} value={option.value}>
                                                                                                    {option.label}
                                                                                                </option>
                                                                                            ))}
                                                                                        </Form.Select>
                                                                                        <Form.Select
                                                                                            value={parseTimeValue(slot.start_time).meridiem}
                                                                                            onChange={(e) =>
                                                                                                updateSlotTimeParts(
                                                                                                    assignment.branchid,
                                                                                                    day,
                                                                                                    slotIndex,
                                                                                                    "start_time",
                                                                                                    parseTimeValue(slot.start_time).time,
                                                                                                    e.target.value,
                                                                                                    setSelectedBranchAssignments
                                                                                                )
                                                                                            }
                                                                                            style={{ width: "90px", borderRadius: "10px" }}
                                                                                        >
                                                                                            <option value="AM">AM</option>
                                                                                            <option value="PM">PM</option>
                                                                                        </Form.Select>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </div>
                                                                            <div className="col-md-5">
                                                                                <Form.Group>
                                                                                    <Form.Label className="small text-muted">End Time</Form.Label>
                                                                                    <div className="d-flex gap-2 align-items-center">
                                                                                        <Form.Select
                                                                                            value={parseTimeValue(slot.end_time).time}
                                                                                            onChange={(e) =>
                                                                                                updateSlotTimeParts(
                                                                                                    assignment.branchid,
                                                                                                    day,
                                                                                                    slotIndex,
                                                                                                    "end_time",
                                                                                                    e.target.value,
                                                                                                    parseTimeValue(slot.end_time).meridiem,
                                                                                                    setSelectedBranchAssignments
                                                                                                )
                                                                                            }
                                                                                            style={{ minWidth: "110px", borderRadius: "10px" }}
                                                                                        >
                                                                                            {TIME_OPTIONS.map((option) => (
                                                                                                <option key={`end-${option.value}`} value={option.value}>
                                                                                                    {option.label}
                                                                                                </option>
                                                                                            ))}
                                                                                        </Form.Select>
                                                                                        <Form.Select
                                                                                            value={parseTimeValue(slot.end_time).meridiem}
                                                                                            onChange={(e) =>
                                                                                                updateSlotTimeParts(
                                                                                                    assignment.branchid,
                                                                                                    day,
                                                                                                    slotIndex,
                                                                                                    "end_time",
                                                                                                    parseTimeValue(slot.end_time).time,
                                                                                                    e.target.value,
                                                                                                    setSelectedBranchAssignments
                                                                                                )
                                                                                            }
                                                                                            style={{ width: "90px", borderRadius: "10px" }}
                                                                                        >
                                                                                            <option value="AM">AM</option>
                                                                                            <option value="PM">PM</option>
                                                                                        </Form.Select>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </div>
                                                                            <div className="col-md-2">
                                                                                <Button
                                                                                    variant="outline-danger"
                                                                                    size="sm"
                                                                                    className="w-100"
                                                                                    onClick={() =>
                                                                                        removeSlot(
                                                                                            assignment.branchid,
                                                                                            day,
                                                                                            slotIndex,
                                                                                            setSelectedBranchAssignments
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    Remove
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-muted small mb-2">No slots added</div>
                                                                )}

                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        addSlot(
                                                                            assignment.branchid,
                                                                            day,
                                                                            setSelectedBranchAssignments
                                                                        )
                                                                    }
                                                                >
                                                                    Add Slot
                                                                </Button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    );
                                })}
                            </Accordion>
                        )}
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setShowAssignModal(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="success"
                            disabled={assignLoading}
                            onClick={assignBranches}
                        >
                            {assignLoading ? "Assigning..." : "Assign"}
                        </Button>
                    </Modal.Footer>
                </Modal>
                {/* doctor view model */}
                <Modal
                    show={showProfileModal}
                    onHide={() => setShowProfileModal(false)}
                    size="xl"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Doctor Profile</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {doctorProfile && (
                            <div className="container-fluid">
                                <div className="row">
                                    {/* Left Side */}
                                    <div className="col-lg-4">
                                        <div
                                            className="bg-white rounded-4 shadow-sm p-4 text-center h-100"
                                            style={{ border: "1px solid #e9ecef" }}
                                        >
                                            <img
                                                src={doctorProfile.profile_pic}
                                                alt={doctorProfile.name}
                                                className="rounded-circle shadow"
                                                style={{
                                                    width: 150,
                                                    height: 150,
                                                    objectFit: "cover",
                                                    border: "4px solid #fff",
                                                    margin: 'auto'
                                                }}
                                            />
                                            <h3 className="fw-bold mt-3 mb-1">
                                                {doctorProfile.name}
                                            </h3>
                                            <div className="mb-4">
                                                <span
                                                    className={`badge text-white px-3 py-2 me-2 ${doctorProfile.approval_status === "Approved"
                                                        ? "bg-success"
                                                        : "bg-warning text-dark"
                                                        }`}
                                                >
                                                    {doctorProfile.approval_status}
                                                </span>
                                                <span
                                                    className={`badge text-white px-3 py-2 ${doctorProfile.is_available
                                                        ? "bg-primary"
                                                        : "bg-danger"
                                                        }`}
                                                >
                                                    {doctorProfile.is_available
                                                        ? "Available"
                                                        : "Unavailable"}
                                                </span>
                                            </div>
                                            <hr />
                                            <div className="text-start mt-4">
                                                <div className="d-flex justify-content-between py-2 border-bottom">
                                                    <span className="fw-semibold text-muted">
                                                        Email
                                                    </span>
                                                    <span className="text-dark text-end">
                                                        {doctorProfile.email}
                                                    </span>
                                                </div>
                                                <div className="d-flex justify-content-between py-2 border-bottom">
                                                    <span className="fw-semibold text-muted">
                                                        Mobile
                                                    </span>
                                                    <span>
                                                        {doctorProfile.mobile}
                                                    </span>
                                                </div>
                                                <div className="d-flex justify-content-between py-2 border-bottom">
                                                    <span className="fw-semibold text-muted">
                                                        Gender
                                                    </span>
                                                    <span>
                                                        {doctorProfile.gender}
                                                    </span>
                                                </div>
                                                <div className="d-flex justify-content-between py-2 border-bottom">
                                                    <span className="fw-semibold text-muted">
                                                        Experience
                                                    </span>
                                                    <span>
                                                        {doctorProfile.experience}
                                                    </span>
                                                </div>
                                                <div className="d-flex justify-content-between py-2">
                                                    <span className="fw-semibold text-muted">
                                                        Rating
                                                    </span>
                                                    <span className="text-warning fw-bold">
                                                        ⭐ {doctorProfile.averageRating || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Right Side */}
                                    <div className="col-md-8">
                                        <div className="card mb-3">
                                            <div className="card-header fw-bold">
                                                About Doctor
                                            </div>
                                            <div className="card-body">
                                                {doctorProfile.aboutme}
                                            </div>
                                        </div>
                                        <div className="card mb-3">
                                            <div className="card-header fw-bold">
                                                Professional Details
                                            </div>
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-md-6 mb-3">
                                                        <strong>Qualification</strong>
                                                        <br />
                                                        {doctorProfile.qualification}
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <strong>Registration No</strong>
                                                        <br />
                                                        {doctorProfile.degree_registration_no}
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <strong>Specialty</strong>
                                                        <br />
                                                        {doctorProfile.specialty}
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <strong>Sub Specialty</strong>
                                                        <br />
                                                        {doctorProfile.sub_specialty}
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <strong>City</strong>
                                                        <br />
                                                        {doctorProfile.city}
                                                    </div>
                                                    <div className="col-md-6 mb-3">
                                                        <strong>State</strong>
                                                        <br />
                                                        {doctorProfile.state}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card mb-3">
                                            <div className="card-header fw-bold">
                                                Hospital Details
                                            </div>
                                            <div className="card-body">
                                                {
                                                    doctorProfile.hospitals?.map((hospital, index) => (
                                                        <div
                                                            key={index}
                                                            className="border rounded p-3 mb-2"
                                                        >
                                                            <h6 className="fw-bold">
                                                                {hospital?.hospitalname || hospital?.name}
                                                            </h6>
                                                            {hospital.branches && hospital?.branches?.map((branch, index) => (
                                                                <div key={branch.branchid} className="mb-2">
                                                                    <p className="text-muted fw-bold mb-1 small">
                                                                        {branch.branchname}
                                                                    </p>
                                                                    <a
                                                                        href={branch.locationurl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-decoration-none small"
                                                                    >
                                                                        <BsGeoAlt className="me-1" />
                                                                        {branch.landmark}, {branch.city}, {branch.state} - {branch.pincode}
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                        <div className="card mb-3">
                                            <div className="card-header fw-bold">
                                                Assigned Branches
                                            </div>
                                            <div className="card-body">
                                                {
                                                    doctorProfile.assignedBranches?.length > 0
                                                        ?
                                                        doctorProfile.assignedBranches.map((branch) => (
                                                            <span
                                                                key={branch.branchid}
                                                                className="badge bg-primary me-2 mb-2 p-2 text-white"
                                                            >
                                                                {branch.branchname}
                                                            </span>
                                                        ))
                                                        :
                                                        <span className="text-muted">
                                                            No Branch Assigned
                                                        </span>
                                                }
                                            </div>
                                        </div>
                                        {/* <div className="row">
                                            <div className="col-md-6">
                                                <div className="card">
                                                    <div className="card-header fw-bold">
                                                        Identity Proof
                                                    </div>
                                                    <div className="card-body">
                                                        {
                                                            doctorProfile.identityproof?.map((doc, i) => (
                                                                <a
                                                                    key={i}
                                                                    href={doc}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="btn btn-outline-primary btn-sm mb-2 d-block"
                                                                >
                                                                    View Identity Proof {i + 1}
                                                                </a>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="card">
                                                    <div className="card-header fw-bold">
                                                        Certificate
                                                    </div>
                                                    <div className="card-body">
                                                        {
                                                            doctorProfile.certificateproof?.map((doc, i) => (
                                                                <a
                                                                    key={i}
                                                                    href={doc}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="btn btn-outline-success btn-sm mb-2 d-block"
                                                                >
                                                                    View Certificate {i + 1}
                                                                </a>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            onClick={() => setShowProfileModal(false)}
                        >
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
                {/* Add Doctor Modal */}
                <Modal
                    show={showAddDoctorModal}
                    onHide={() => {
                        setShowAddDoctorModal(false);
                        setDoctorSearch("");
                        setAddDoctorList([]);
                        setSelectedAddDoctor(null);
                        setSelectedAddBranches([]);
                        setSelectedAddBranchAssignments([]);
                        setShowDoctorResults(false);
                    }}
                    centered
                    size="lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Add Doctor
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>

                        {/* Doctor Type */}
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-bold">
                                Doctor Type
                            </Form.Label>

                            <div className="d-flex gap-4">

                                <Form.Check
                                    type="radio"
                                    id="existingDoctor"
                                    name="doctorType"
                                    label="Existing Doctor"
                                    value="existing"
                                    checked={doctorType === "existing"}
                                    onChange={(e) => {
                                        setDoctorType(e.target.value);

                                        // Reset new doctor related state
                                        setDoctorSearch("");
                                        setAddDoctorList([]);
                                        setSelectedAddDoctor(null);
                                        setSelectedAddBranches([]);
                                        setSelectedAddBranchAssignments([]);
                                        setShowDoctorResults(false);
                                    }}
                                />

                                <Form.Check
                                    type="radio"
                                    id="newDoctor"
                                    name="doctorType"
                                    label="New Doctor"
                                    value="new"
                                    checked={doctorType === "new"}
                                    onChange={(e) => {
                                        setDoctorType(e.target.value);

                                        // Reset existing doctor related state
                                        setDoctorSearch("");
                                        setAddDoctorList([]);
                                        setSelectedAddDoctor(null);
                                        setSelectedAddBranches([]);
                                        setSelectedAddBranchAssignments([]);
                                        setShowDoctorResults(false);
                                    }}
                                />

                            </div>
                        </Form.Group>


                        {/* Existing Doctor */}
                        {doctorType === "existing" && (
                            <>
                                {/* Search Doctor */}
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Search Doctor
                                    </Form.Label>

                                    <Form.Control
                                        type="text"
                                        placeholder="Search by doctor name, email or mobile..."
                                        value={doctorSearch}
                                        onFocus={() => {
                                            setShowDoctorResults(true);

                                            if (!doctorSearch.trim()) {
                                                setAddDoctorList(allDoctors);
                                            }
                                        }}
                                        onChange={(e) =>
                                            handleDoctorSearch(e.target.value)
                                        }
                                    />
                                </Form.Group>


                                {/* Search Result */}
                                {showDoctorResults && (
                                    <div
                                        className="border rounded mb-4"
                                        style={{
                                            maxHeight: "250px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        {addDoctorList.length > 0 ? (
                                            addDoctorList.map((doctor) => (
                                                <div
                                                    key={doctor._id}
                                                    onClick={() => {
                                                        handleSelectAddDoctor(doctor);
                                                        setShowDoctorResults(false);
                                                    }}
                                                    className={`d-flex align-items-center p-3 border-bottom ${selectedAddDoctor?._id === doctor._id
                                                        ? "bg-light"
                                                        : ""
                                                        }`}
                                                    style={{
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <img
                                                        src={doctor.profile_pic}
                                                        alt={doctor.name}
                                                        style={{
                                                            width: "45px",
                                                            height: "45px",
                                                            borderRadius: "50%",
                                                            objectFit: "cover",
                                                            marginRight: "12px",
                                                        }}
                                                    />

                                                    <div>
                                                        <div className="fw-bold">
                                                            {doctor.name}
                                                        </div>

                                                        <small className="text-muted">
                                                            {doctor.specialty}
                                                        </small>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-3 text-center text-muted">
                                                No doctors found
                                            </div>
                                        )}
                                    </div>
                                )}


                                {/* Selected Doctor */}
                                {selectedAddDoctor && (
                                    <div className="card">
                                        <div className="card-body">

                                            <div className="d-flex align-items-center mb-3">

                                                <img
                                                    src={selectedAddDoctor.profile_pic}
                                                    alt={selectedAddDoctor.name}
                                                    style={{
                                                        width: "60px",
                                                        height: "60px",
                                                        borderRadius: "50%",
                                                        objectFit: "cover",
                                                        marginRight: "15px",
                                                    }}
                                                />

                                                <div>
                                                    <h5 className="mb-1">
                                                        {selectedAddDoctor.name}
                                                    </h5>

                                                    <div className="text-muted">
                                                        {selectedAddDoctor.specialty}
                                                    </div>
                                                </div>

                                            </div>

                                            <hr />

                                            {/* Branch Select */}
                                            <Form.Group className="mb-4">
                                                <Form.Label className="fw-bold">
                                                    Assign Branch
                                                    <span className="text-danger">
                                                        {" "}*
                                                    </span>
                                                </Form.Label>

                                                <Select
                                                    isMulti
                                                    options={branches.map((branch) => ({
                                                        value: branch._id,
                                                        label: branch.branchname,
                                                    }))}
                                                    value={branches
                                                        .filter((branch) =>
                                                            selectedAddBranches.includes(
                                                                String(branch._id)
                                                            )
                                                        )
                                                        .map((branch) => ({
                                                            value: branch._id,
                                                            label: branch.branchname,
                                                        }))
                                                    }
                                                    onChange={(selected) => {
                                                        const nextIds = selected ? selected.map((item) => item.value) : [];
                                                        const existingAssignments = {};
                                                        selectedAddBranchAssignments.forEach((assignment) => {
                                                            existingAssignments[String(assignment.branchid)] = assignment;
                                                        });
                                                        setSelectedAddBranches(nextIds);
                                                        setSelectedAddBranchAssignments(
                                                            buildBranchAssignments(nextIds, existingAssignments)
                                                        );
                                                    }}
                                                    placeholder="Select branches..."
                                                />
                                            </Form.Group>

                                            {selectedAddBranchAssignments.length > 0 && (
                                                <Accordion defaultActiveKey={selectedAddBranchAssignments[0]?.branchid} className="branch-accordion">
                                                    {selectedAddBranchAssignments.map((assignment) => {
                                                        const branch = branches.find(
                                                            (item) => String(item._id) === String(assignment.branchid)
                                                        );

                                                        return (
                                                            <Accordion.Item key={assignment.branchid} eventKey={String(assignment.branchid)} className="mb-3 border rounded-4 overflow-hidden">
                                                                <Accordion.Header>
                                                                    <div className="d-flex justify-content-between align-items-center w-100 pe-3">
                                                                        <span className="fw-bold text-primary">{branch?.branchname || "Branch"}</span>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline-danger"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const nextIds = selectedAddBranches.filter(
                                                                                    (branchId) => String(branchId) !== String(assignment.branchid)
                                                                                );
                                                                                setSelectedAddBranches(nextIds);
                                                                                setSelectedAddBranchAssignments((prev) =>
                                                                                    prev.filter(
                                                                                        (item) =>
                                                                                            String(item.branchid) !== String(assignment.branchid)
                                                                                    )
                                                                                );
                                                                            }}
                                                                        >
                                                                            Remove
                                                                        </Button>
                                                                    </div>
                                                                </Accordion.Header>
                                                                <Accordion.Body>
                                                                    <Row className="g-3 mb-3">
                                                                        <Col md={4}>
                                                                            <Form.Group>
                                                                                <Form.Label>E-OPD Price</Form.Label>
                                                                                <Form.Control
                                                                                    type="number"
                                                                                    min="0"
                                                                                    value={assignment.eopd_price}
                                                                                    onChange={(e) =>
                                                                                        setSelectedAddBranchAssignments((prev) =>
                                                                                            prev.map((item) =>
                                                                                                String(item.branchid) === String(assignment.branchid)
                                                                                                    ? { ...item, eopd_price: Number(e.target.value || 0) }
                                                                                                    : item
                                                                                            )
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                        <Col md={4}>
                                                                            <Form.Group>
                                                                                <Form.Label>Home Visit Price</Form.Label>
                                                                                <Form.Control
                                                                                    type="number"
                                                                                    min="0"
                                                                                    value={assignment.home_visit_price}
                                                                                    onChange={(e) =>
                                                                                        setSelectedAddBranchAssignments((prev) =>
                                                                                            prev.map((item) =>
                                                                                                String(item.branchid) === String(assignment.branchid)
                                                                                                    ? { ...item, home_visit_price: Number(e.target.value || 0) }
                                                                                                    : item
                                                                                            )
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                        <Col md={4}>
                                                                            <Form.Group>
                                                                                <Form.Label>Clinic Visit Price</Form.Label>
                                                                                <Form.Control
                                                                                    type="number"
                                                                                    min="0"
                                                                                    value={assignment.clinic_visit_price}
                                                                                    onChange={(e) =>
                                                                                        setSelectedAddBranchAssignments((prev) =>
                                                                                            prev.map((item) =>
                                                                                                String(item.branchid) === String(assignment.branchid)
                                                                                                    ? { ...item, clinic_visit_price: Number(e.target.value || 0) }
                                                                                                    : item
                                                                                            )
                                                                                        )
                                                                                    }
                                                                                />
                                                                            </Form.Group>
                                                                        </Col>
                                                                    </Row>

                                                                    <div>
                                                                        <h6 className="fw-bold mb-3">Timings</h6>
                                                                        {DAYS_OF_WEEK.map((day) => {
                                                                            const dayTiming = assignment.timings?.[day] || {
                                                                                available: false,
                                                                                slots: [],
                                                                            };

                                                                            return (
                                                                                <div key={`${assignment.branchid}-${day}`} className="border rounded p-2 mb-2">
                                                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                                                        <span className="fw-semibold text-capitalize">{day}</span>
                                                                                        <Form.Check
                                                                                            type="switch"
                                                                                            id={`${assignment.branchid}-${day}-available-add`}
                                                                                            label={dayTiming.available ? "Available" : "Unavailable"}
                                                                                            checked={Boolean(dayTiming.available)}
                                                                                            onChange={() =>
                                                                                                toggleDayAvailability(
                                                                                                    assignment.branchid,
                                                                                                    day,
                                                                                                    setSelectedAddBranchAssignments
                                                                                                )
                                                                                            }
                                                                                        />
                                                                                    </div>

                                                                                    {dayTiming.slots?.length > 0 ? (
                                                                                        dayTiming.slots.map((slot, slotIndex) => (
                                                                                            <div key={`${assignment.branchid}-${day}-${slotIndex}`} className="row g-2 mb-2 align-items-end">
                                                                                                <div className="col-md-5">
                                                                                                    <Form.Group>
                                                                                                        <Form.Label className="small text-muted">Start Time</Form.Label>
                                                                                                        <div className="d-flex gap-2 align-items-center">
                                                                                                            <Form.Select
                                                                                                                value={parseTimeValue(slot.start_time).time}
                                                                                                                size="8"
                                                                                                                onChange={(e) =>
                                                                                                                    updateSlotTimeParts(
                                                                                                                        assignment.branchid,
                                                                                                                        day,
                                                                                                                        slotIndex,
                                                                                                                        "start_time",
                                                                                                                        e.target.value,
                                                                                                                        parseTimeValue(slot.start_time).meridiem,
                                                                                                                        setSelectedAddBranchAssignments
                                                                                                                    )
                                                                                                                }
                                                                                                                style={{ minWidth: "110px", borderRadius: "10px" }}
                                                                                                            >
                                                                                                                {TIME_OPTIONS.map((option) => (
                                                                                                                    <option key={`add-start-${option.value}`} value={option.value}>
                                                                                                                        {option.label}
                                                                                                                    </option>
                                                                                                                ))}
                                                                                                            </Form.Select>
                                                                                                            <Form.Select
                                                                                                                value={parseTimeValue(slot.start_time).meridiem}
                                                                                                                onChange={(e) =>
                                                                                                                    updateSlotTimeParts(
                                                                                                                        assignment.branchid,
                                                                                                                        day,
                                                                                                                        slotIndex,
                                                                                                                        "start_time",
                                                                                                                        parseTimeValue(slot.start_time).time,
                                                                                                                        e.target.value,
                                                                                                                        setSelectedAddBranchAssignments
                                                                                                                    )
                                                                                                                }
                                                                                                                style={{ width: "90px", borderRadius: "10px" }}
                                                                                                            >
                                                                                                                <option value="AM">AM</option>
                                                                                                                <option value="PM">PM</option>
                                                                                                            </Form.Select>
                                                                                                        </div>
                                                                                                    </Form.Group>
                                                                                                </div>
                                                                                                <div className="col-md-5">
                                                                                                    <Form.Group>
                                                                                                        <Form.Label className="small text-muted">End Time</Form.Label>
                                                                                                        <div className="d-flex gap-2 align-items-center">
                                                                                                            <Form.Select
                                                                                                                value={parseTimeValue(slot.end_time).time}
                                                                                                                onChange={(e) =>
                                                                                                                    updateSlotTimeParts(
                                                                                                                        assignment.branchid,
                                                                                                                        day,
                                                                                                                        slotIndex,
                                                                                                                        "end_time",
                                                                                                                        e.target.value,
                                                                                                                        parseTimeValue(slot.end_time).meridiem,
                                                                                                                        setSelectedAddBranchAssignments
                                                                                                                    )
                                                                                                                }
                                                                                                                style={{ minWidth: "110px", borderRadius: "10px" }}
                                                                                                            >
                                                                                                                {TIME_OPTIONS.map((option) => (
                                                                                                                    <option key={`add-end-${option.value}`} value={option.value}>
                                                                                                                        {option.label}
                                                                                                                    </option>
                                                                                                                ))}
                                                                                                            </Form.Select>
                                                                                                            <Form.Select
                                                                                                                value={parseTimeValue(slot.end_time).meridiem}
                                                                                                                onChange={(e) =>
                                                                                                                    updateSlotTimeParts(
                                                                                                                        assignment.branchid,
                                                                                                                        day,
                                                                                                                        slotIndex,
                                                                                                                        "end_time",
                                                                                                                        parseTimeValue(slot.end_time).time,
                                                                                                                        e.target.value,
                                                                                                                        setSelectedAddBranchAssignments
                                                                                                                    )
                                                                                                                }
                                                                                                                style={{ width: "90px", borderRadius: "10px" }}
                                                                                                            >
                                                                                                                <option value="AM">AM</option>
                                                                                                                <option value="PM">PM</option>
                                                                                                            </Form.Select>
                                                                                                        </div>
                                                                                                    </Form.Group>
                                                                                                </div>
                                                                                                <div className="col-md-2">
                                                                                                    <Button
                                                                                                        variant="outline-danger"
                                                                                                        size="sm"
                                                                                                        className="w-100"
                                                                                                        onClick={() =>
                                                                                                            removeSlot(
                                                                                                                assignment.branchid,
                                                                                                                day,
                                                                                                                slotIndex,
                                                                                                                setSelectedAddBranchAssignments
                                                                                                            )
                                                                                                        }
                                                                                                    >
                                                                                                        Remove
                                                                                                    </Button>
                                                                                                </div>
                                                                                            </div>
                                                                                        ))
                                                                                    ) : (
                                                                                        <div className="text-muted small mb-2">No slots added</div>
                                                                                    )}

                                                                                    <Button
                                                                                        variant="outline-primary"
                                                                                        size="sm"
                                                                                        onClick={() =>
                                                                                            addSlot(
                                                                                                assignment.branchid,
                                                                                                day,
                                                                                                setSelectedAddBranchAssignments
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        Add Slot
                                                                                    </Button>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </Accordion.Body>
                                                            </Accordion.Item>
                                                        );
                                                    })}
                                                </Accordion>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* New Doctor */}
                        {doctorType === "new" && (
                            <div className="text-center py-4">

                                <p className="text-muted mb-3">
                                    Create a new doctor profile.
                                </p>

                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        navigate("/doctor/doctorregister");
                                    }}
                                >
                                    Create New Doctor
                                </Button>
                            </div>
                        )}

                    </Modal.Body>

                    <Modal.Footer>

                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowAddDoctorModal(false);
                                setDoctorType("existing");
                                setDoctorSearch("");
                                setAddDoctorList([]);
                                setSelectedAddDoctor(null);
                                setSelectedAddBranches([]);
                                setSelectedAddBranchAssignments([]);
                                setShowDoctorResults(false);
                            }}
                        >
                            Cancel
                        </Button>

                        {doctorType === "existing" && (
                            <Button
                                variant="success"
                                disabled={
                                    addDoctorLoading ||
                                    !selectedAddDoctor ||
                                    selectedAddBranches.length === 0
                                }
                                onClick={assignDoctorBranches}
                            >
                                {addDoctorLoading
                                    ? "Assigning..."
                                    : "Assign Branch"}
                            </Button>
                        )}

                    </Modal.Footer>
                </Modal>
            </Container>
        </>
    )
}

export default HospitalDoctor