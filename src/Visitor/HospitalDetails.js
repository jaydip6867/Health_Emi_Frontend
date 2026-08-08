import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    API_BASE_URL,
    SECRET_KEY,
    STORAGE_KEYS,
} from "../config";
import axios from "axios";
import CryptoJS from "crypto-js";
import NavBar from "./Component/NavBar";
import FooterBar from "./Component/FooterBar";
import Loader from "../Loader";

import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Badge,
    Image,
    Nav,
} from "react-bootstrap";

import {
    FaStar,
    FaMapMarkerAlt,
    FaPhoneAlt,
    FaEnvelope,
    FaCheckCircle,
    FaUserMd,
    FaHospital,
} from "react-icons/fa";

const HospitalDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [patient, setPatient] = useState(null);
    const [token, setToken] = useState(null);
    const [logdata, setLogdata] = useState(null);

    const [loading, setLoading] = useState(false);
    const [hospitalprofile, setHospitalProfile] = useState(null);

    const [activeTab, setActiveTab] = useState("doctors");

    /*
    =====================================================
    GET HOSPITAL ID FROM URL
    =====================================================
    */

    let h_id = null;

    try {
        if (id) {
            h_id = atob(decodeURIComponent(id));
        }
    } catch (error) {
        console.error("Invalid hospital ID:", error);
    }

    /*
    =====================================================
    LOGIN DATA
    =====================================================
    */

    useEffect(() => {
        const pgetlocaldata = localStorage.getItem(
            STORAGE_KEYS.PATIENT
        );

        const dgetlocaldata = localStorage.getItem(
            STORAGE_KEYS.DOCTOR
        );

        let data = null;

        try {
            if (pgetlocaldata) {
                const bytes = CryptoJS.AES.decrypt(
                    pgetlocaldata,
                    SECRET_KEY
                );

                const decrypted = bytes.toString(
                    CryptoJS.enc.Utf8
                );

                data = JSON.parse(decrypted);

                setPatient(data.userData);
                setLogdata(data.userData);
            } else if (dgetlocaldata) {
                const bytes = CryptoJS.AES.decrypt(
                    dgetlocaldata,
                    SECRET_KEY
                );

                const decrypted = bytes.toString(
                    CryptoJS.enc.Utf8
                );

                data = JSON.parse(decrypted);

                setLogdata(data.doctorData);
            }

            if (data?.accessToken) {
                setToken(`Bearer ${data.accessToken}`);
            }
        } catch (error) {
            console.error(
                "Error decrypting login data:",
                error
            );
        }
    }, []);

    /*
    =====================================================
    GET HOSPITAL DETAILS
    =====================================================
    */

    useEffect(() => {
        if (h_id) {
            gethospitalById(h_id);
        }
    }, [h_id]);

    const gethospitalById = async (id) => {
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/user/hospital/getone`,
                {
                    hospitalid: id,
                }
            );

            setHospitalProfile(
                response?.data?.Data || null
            );
        } catch (error) {
            console.error(
                "Hospital details error:",
                error
            );
            setHospitalProfile(null);
        } finally {
            setLoading(false);
        }
    };

    /*
    =====================================================
    VIEW DOCTOR
    =====================================================
    */

    const handleViewDoctor = (doctor) => {
        navigate(`/doctorprofile/${encodeURIComponent(btoa(doctor._id))}`);
    };

    /*
    =====================================================
    HOSPITAL BRANCHES
    =====================================================
    */

    const branches =
        hospitalprofile?.branchdetails || [];

    /*
    =====================================================
    UNIQUE DOCTORS
    =====================================================

    Same doctor multiple branches ma hoy shake.

    Etle duplicate doctor avoid karva Map use kariye chhiye.
    */

    const uniqueDoctors = Array.from(
        new Map(
            branches
                .flatMap((branch) =>
                    (branch?.doctors || []).map(
                        (doctor) => ({
                            ...doctor,
                            branchName:
                                branch?.branchname,
                            branchId:
                                branch?._id,
                        })
                    )
                )
                .map((doctor) => [
                    doctor._id,
                    doctor,
                ])
        ).values()
    );

    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (loading) {
        return (
            <>
                <NavBar logindata={logdata} />
                <Loader />
                <FooterBar />
            </>
        );
    }

    /*
    =====================================================
    NO HOSPITAL
    =====================================================
    */

    if (!hospitalprofile) {
        return (
            <>
                <NavBar logindata={logdata} />

                <Container className="py-5">
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="text-center py-5">
                            <FaHospital
                                size={50}
                                className="text-muted mb-3"
                            />

                            <h4>
                                Hospital details not found
                            </h4>

                            <p className="text-muted">
                                We could not find the requested
                                hospital.
                            </p>

                            <Button
                                variant="primary"
                                onClick={() => navigate(-1)}
                            >
                                Go Back
                            </Button>
                        </Card.Body>
                    </Card>
                </Container>

                <FooterBar />
            </>
        );
    }

    return (
        <>
            <NavBar logindata={logdata} />

            <div
                style={{
                    backgroundColor: "#f5f7fb",
                    minHeight: "100vh",
                }}
            >
                {/* =================================================
                    HOSPITAL HEADER
                ================================================= */}

                <Container className="py-4">
                    <Card
                        className="border-0 shadow-sm"
                        style={{
                            borderRadius: "12px",
                        }}
                    >
                        <Card.Body className="p-4">
                            <Row className="align-items-center">
                                {/* Hospital Logo */}

                                <Col
                                    xs={12}
                                    md={2}
                                    className="text-center mb-3 mb-md-0"
                                >
                                    <Image
                                        src={
                                            hospitalprofile.logo
                                        }
                                        alt={
                                            hospitalprofile.hospitalname
                                        }
                                        rounded
                                        style={{
                                            width: "120px",
                                            height: "120px",
                                            objectFit: "contain",
                                            border:
                                                "1px solid #e5e7eb",
                                            padding: "10px",
                                            background:
                                                "#ffffff",
                                        }}
                                    />
                                </Col>

                                {/* Hospital Information */}

                                <Col md={7}>
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <h2 className="mb-1 fw-bold">
                                            {
                                                hospitalprofile.hospitalname
                                            }
                                        </h2>

                                        {/* {hospitalprofile.status ===
                                            "Approved" && (
                                                <FaCheckCircle
                                                    className="text-success"
                                                    title="Verified Hospital"
                                                />
                                            )} */}
                                    </div>

                                    <div className="text-muted mb-2">
                                        {
                                            hospitalprofile.hospitaltype
                                        }
                                    </div>

                                    <div className="d-flex align-items-center mb-2">
                                        <FaMapMarkerAlt
                                            className="text-danger me-2"
                                        />

                                        <span>
                                            {
                                                hospitalprofile.registeredaddress
                                            }
                                        </span>
                                    </div>

                                    <div className="mb-2">
                                        <Badge
                                            bg="success"
                                            text="light"
                                            className="me-2"
                                        >
                                            {
                                                hospitalprofile.status
                                            }
                                        </Badge>

                                        {hospitalprofile.nabhaccreditation ===
                                            "Yes" && (
                                                <Badge bg="primary" text="light">
                                                    NABH Accredited
                                                </Badge>
                                            )}
                                    </div>

                                    {hospitalprofile.summary && (
                                        <p
                                            className="text-muted mb-0"
                                            style={{
                                                lineHeight: "1.6",
                                            }}
                                        >
                                            {
                                                hospitalprofile.summary
                                            }
                                        </p>
                                    )}
                                </Col>

                            </Row>
                        </Card.Body>
                    </Card>
                </Container>

                {/* =================================================
                    NAVIGATION TABS
                ================================================= */}

                <Container>
                    <div className="appt-tabs d-flex gap-2 mb-3 overflow-x-auto pb-2">
                        <button
                            type="button"
                            className={`appt-tab d-flex align-items-center ${activeTab === "doctors" ? "active" : ""
                                }`}
                            onClick={() => setActiveTab("doctors")}
                        >
                            <span>Doctors</span>
                            <span className="count">{uniqueDoctors.length}</span>
                        </button>

                        <button
                            type="button"
                            className={`appt-tab d-flex align-items-center ${activeTab === "branches" ? "active" : ""
                                }`}
                            onClick={() => setActiveTab("branches")}
                        >
                            <span>Branches</span>
                            <span className="count">{branches.length}</span>
                        </button>

                        <button
                            type="button"
                            className={`appt-tab d-flex align-items-center ${activeTab === "about" ? "active" : ""
                                }`}
                            onClick={() => setActiveTab("about")}
                        >
                            <span>About Hospital</span>
                        </button>
                    </div>
                </Container>

                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <Container className="pb-5">
                    <Row className="g-4">
                        {/* =================================================
                            LEFT CONTENT
                        ================================================= */}

                        <Col xs={12}>
                            {/* =================================================
                                DOCTORS
                            ================================================= */}

                            {activeTab === "doctors" && (
                                <div className="mt-4">
                                    <div className="mb-3">
                                        <h4 className="fw-bold mb-1">
                                            Doctors at{" "}
                                            {
                                                hospitalprofile.hospitalname
                                            }
                                        </h4>
                                    </div>

                                    {uniqueDoctors.length >
                                        0 ? (
                                        uniqueDoctors.map(
                                            (doctor) => (
                                                <Card
                                                    key={
                                                        doctor._id
                                                    }
                                                    className="border-0 shadow-sm mb-3"
                                                    style={{
                                                        borderRadius:
                                                            "12px",
                                                    }}
                                                >
                                                    <Card.Body className="p-4">
                                                        <Row>
                                                            {/* Doctor Image */}

                                                            <Col
                                                                xs={
                                                                    12
                                                                }
                                                                sm={
                                                                    3
                                                                }
                                                                md={
                                                                    2
                                                                }
                                                                className="text-center mb-3 mb-sm-0"
                                                            >
                                                                <Image
                                                                    src={
                                                                        doctor.profile_pic ||
                                                                        "https://via.placeholder.com/100x100?text=Doctor"
                                                                    }
                                                                    alt={
                                                                        doctor.name
                                                                    }
                                                                    roundedCircle
                                                                    style={{
                                                                        width: "90px",
                                                                        height: "90px",
                                                                        objectFit:
                                                                            "cover",
                                                                        border:
                                                                            "1px solid #e5e7eb",
                                                                    }}
                                                                    className="mx-auto mb-2"
                                                                />
                                                                <Badge
                                                                    bg={
                                                                        doctor.is_available
                                                                            ? "success"
                                                                            : "secondary"
                                                                    }
                                                                    text="light"
                                                                >
                                                                    {doctor.is_available
                                                                        ? "Available"
                                                                        : "Unavailable"}
                                                                </Badge>
                                                            </Col>

                                                            {/* Doctor Details */}

                                                            <Col
                                                                xs={
                                                                    12
                                                                }
                                                                sm={
                                                                    9
                                                                }
                                                                md={
                                                                    7
                                                                }
                                                            >
                                                                <div className="d-flex align-items-center flex-wrap gap-2">
                                                                    <h5 className="fw-bold mb-0">
                                                                        {
                                                                            doctor.name
                                                                        }
                                                                    </h5>

                                                                    {doctor.approval_status ===
                                                                        "Approved" && (
                                                                            <FaCheckCircle className="text-success" />
                                                                        )}
                                                                </div>

                                                                <div className="text-primary fw-semibold mt-1">
                                                                    {
                                                                        doctor.specialty
                                                                    }
                                                                </div>

                                                                <div className="text-muted small mt-1">
                                                                    {
                                                                        doctor.qualification
                                                                    }
                                                                </div>

                                                                <div className="text-muted small mt-1">
                                                                    {
                                                                        doctor.experience
                                                                    }{" "}
                                                                    experience
                                                                </div>

                                                                {/* {doctor.sub_specialty && (
                                                                    <div className="text-muted small mt-1">
                                                                        {
                                                                            doctor.sub_specialty
                                                                        }
                                                                    </div>
                                                                )} */}

                                                                <div className="d-flex flex-wrap gap-2 mt-2">
                                                                    <Badge
                                                                        bg="warning"
                                                                        text="dark"
                                                                        className="mb-0"
                                                                        >
                                                                        <FaStar className="me-1" />
                                                                        {
                                                                            doctor.averageRating
                                                                        }
                                                                    </Badge>

                                                                    {doctor.branchName && (
                                                                        <Badge bg="light" text="dark" className="mb-0">
                                                                            <FaHospital className="me-1" />
                                                                            {
                                                                                doctor.branchName
                                                                            }
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </Col>

                                                            {/* Doctor Action */}

                                                            <Col
                                                                md={
                                                                    3
                                                                }
                                                                className="d-flex flex-column justify-content-start mt-3 mt-md-0"
                                                            >

                                                                <Button
                                                                    variant="outline-primary"
                                                                    onClick={() =>
                                                                        handleViewDoctor(
                                                                            doctor
                                                                        )
                                                                    }
                                                                >
                                                                    View Profile
                                                                </Button>
                                                            </Col>
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            )
                                        )
                                    ) : (
                                        <Card className="border-0 shadow-sm">
                                            <Card.Body className="text-center py-5">
                                                <FaUserMd
                                                    size={45}
                                                    className="text-muted mb-3"
                                                />

                                                <h5>
                                                    No doctors
                                                    available
                                                </h5>

                                                <p className="text-muted mb-0">
                                                    No doctors are
                                                    currently
                                                    associated
                                                    with this
                                                    hospital.
                                                </p>
                                            </Card.Body>
                                        </Card>
                                    )}
                                </div>
                            )}

                            {/* =================================================
                                BRANCHES
                            ================================================= */}

                            {activeTab === "branches" && (
                                <div className="mt-4">
                                    <h4 className="fw-bold mb-3">
                                        Hospital Branches
                                    </h4>

                                    {branches.map(
                                        (branch) => (
                                            <Card
                                                key={
                                                    branch._id
                                                }
                                                className="border-0 shadow-sm mb-3"
                                            >
                                                <Card.Body>
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <h5 className="fw-bold mb-1">
                                                                {
                                                                    branch.branchname
                                                                }
                                                            </h5>

                                                            <div className="text-muted small">
                                                                <FaMapMarkerAlt className="text-danger me-2" />

                                                                {
                                                                    branch.landmark
                                                                }
                                                                ,{" "}
                                                                {
                                                                    branch.city
                                                                }
                                                                ,{" "}
                                                                {
                                                                    branch.state
                                                                }{" "}
                                                                -{" "}
                                                                {
                                                                    branch.pincode
                                                                }
                                                            </div>
                                                        </div>

                                                        {branch.locationurl && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline-primary"
                                                                href={
                                                                    branch.locationurl
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                View Map
                                                            </Button>
                                                        )}
                                                    </div>

                                                    {/* {branch.summary && (
                                                        <p className="text-muted mt-3 mb-2">
                                                            {
                                                                branch.summary
                                                            }
                                                        </p>
                                                    )} */}

                                                    <div className="mt-3">
                                                        <strong>
                                                            Doctors:{" "}
                                                        </strong>

                                                        {
                                                            branch
                                                                .doctors
                                                                ?.length ||
                                                            0
                                                        }
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        )
                                    )}
                                </div>
                            )}

                            {/* =================================================
                                ABOUT
                            ================================================= */}

                            {activeTab === "about" && (
                                <Card className="border-0 shadow-sm mt-4">
                                    <Card.Body className="p-4">
                                        <h4 className="fw-bold mb-3">
                                            About{" "}
                                            {
                                                hospitalprofile.hospitalname
                                            }
                                        </h4>

                                        <p
                                            className="text-muted"
                                            style={{
                                                lineHeight:
                                                    "1.8",
                                            }}
                                        >
                                            {
                                                hospitalprofile.summary
                                            }
                                        </p>

                                        <hr />

                                        <Row>
                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <small className="text-muted">
                                                        Hospital
                                                        Type
                                                    </small>

                                                    <div className="fw-semibold">
                                                        {
                                                            hospitalprofile.hospitaltype
                                                        }
                                                    </div>
                                                </div>
                                            </Col>

                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <small className="text-muted">
                                                        Established
                                                    </small>

                                                    <div className="fw-semibold">
                                                        {
                                                            hospitalprofile.establishmentyear
                                                        }
                                                    </div>
                                                </div>
                                            </Col>

                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <small className="text-muted">
                                                        Registration
                                                        Number
                                                    </small>

                                                    <div className="fw-semibold">
                                                        {
                                                            hospitalprofile.registrationnumber
                                                        }
                                                    </div>
                                                </div>
                                            </Col>

                                            <Col md={6}>
                                                <div className="mb-3">
                                                    <small className="text-muted">
                                                        NABH
                                                    </small>

                                                    <div className="fw-semibold">
                                                        {
                                                            hospitalprofile.nabhaccreditation
                                                        }
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>

            <FooterBar />
        </>
    );
};

export default HospitalDetails;
