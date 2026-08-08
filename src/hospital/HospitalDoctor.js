import React, { useEffect, useState } from 'react'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { Col, Container, Row, Modal, Button, Form } from 'react-bootstrap';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import HospitalSidebar from './HospitalSidebar';
import SmartDataTable from "../components/SmartDataTable";
import axios from 'axios';
import Select from "react-select";
import Swal from 'sweetalert2';
import { MdAssignmentAdd, MdOutlineRemoveRedEye } from 'react-icons/md';
import { BsGeoAlt } from 'react-icons/bs';

const HospitalDoctor = () => {

    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();

    const [hospital, sethospital] = useState(null)
    const [token, settoken] = useState(null)
    const [doctorlist, setdoctorlist] = useState(null)
    const [loading, setloading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [assignLoading, setAssignLoading] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);

    const [allDoctors, setAllDoctors] = useState([]);
    const [doctorSearch, setDoctorSearch] = useState("");
    const [addDoctorList, setAddDoctorList] = useState([]);
    const [selectedAddDoctor, setSelectedAddDoctor] = useState(null);
    const [selectedAddBranches, setSelectedAddBranches] = useState([]);
    const [addDoctorLoading, setAddDoctorLoading] = useState(false);

    const [showDoctorResults, setShowDoctorResults] = useState(false);
    const [doctorType, setDoctorType] = useState("existing");

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
        const assignedIds = doctor.assignedBranches?.map((item) => item.branchid) || [];
        setSelectedBranches(assignedIds);
        setShowAssignModal(true);
    };
    const handleBranchChange = (e) => {
        const values = Array.from(
            e.target.selectedOptions,
            (option) => option.value
        );

        setSelectedBranches(values);
    };

    const assignBranches = async () => {
        if (!selectedDoctor) return;

        setAssignLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/hospital/doctors/assign-branches`,
                {
                    doctorid: selectedDoctor._id,
                    branchids: selectedBranches,
                },
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

        const assignedIds =
            doctor?.assignedBranches?.map(
                (branch) => branch.branchid || branch._id
            ) || [];

        setSelectedAddBranches(assignedIds);
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
            const response = await axios.post(
                `${API_BASE_URL}/hospital/doctors/assign-branches`,
                {
                    doctorid: selectedAddDoctor._id,
                    branchids: selectedAddBranches,
                },
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
                    <Col xs={12} sm={9} className='p-3 mt-3'>
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
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Assign Branch
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form.Group>
                            <Form.Label>Select Branches</Form.Label>
                            <Select
                                isMulti
                                options={branches.map((b) => ({
                                    value: b._id,
                                    label: b.branchname,
                                }))}
                                value={branches
                                    .filter((branch) => selectedBranches.includes(branch._id))
                                    .map((branch) => ({
                                        value: branch._id,
                                        label: branch.branchname,
                                    }))
                                }
                                onChange={(selected) =>
                                    setSelectedBranches(selected.map((item) => item.value))
                                }
                            />
                        </Form.Group>
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
                                            <Form.Group>
                                                <Form.Label>
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
                                                                branch._id
                                                            )
                                                        )
                                                        .map((branch) => ({
                                                            value: branch._id,
                                                            label: branch.branchname,
                                                        }))
                                                    }
                                                    onChange={(selected) =>
                                                        setSelectedAddBranches(
                                                            selected
                                                                ? selected.map(
                                                                    (item) => item.value
                                                                )
                                                                : []
                                                        )
                                                    }
                                                    placeholder="Select branches..."
                                                />
                                            </Form.Group>
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