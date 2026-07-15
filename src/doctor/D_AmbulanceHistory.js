import React, { useEffect, useState } from "react";
import {  Col, Container, Row, Badge, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";
import axios from "axios";
import CryptoJS from "crypto-js";
import Loader from "../Loader";
import SmartDataTable from '../components/SmartDataTable';
import {
    API_BASE_URL,
    SECRET_KEY,
    STORAGE_KEYS,
} from "../config";
import {
    FaAmbulance,
    FaMapPin,
} from "react-icons/fa";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import NavBar from "../Visitor/Component/NavBar";


const D_AmbulanceRequest = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [doctor, setDoctor] = useState(null);
    const [token, setToken] = useState(null);

    const [ambulanceHistory, setAmbulanceHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const itemsPerPage = 5;

    // Add this function to fetch ambulance history for the doctor
    const fetchAmbulanceHistory = async (page = 1) => {
        if (!token || !doctor?._id) return;

        setHistoryLoading(true);
        try {
            const response = await axios({
                method: "post",
                url: `${API_BASE_URL}/doctor/ambulancerequests/list`,
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
                data: {
                    search: "",
                },
            });

            if (response.data && response.data.Data) {
                let doctorData = response.data.Data.filter((item) => {
                    return item.doctorid == doctor._id;
                });
                // console.log(doctorData, "doctorData");
                setAmbulanceHistory(doctorData);
                const totalItems = doctorData.length;
                setTotalPages(Math.ceil(totalItems / itemsPerPage));
            }
        } catch (error) {
            console.error("Error fetching ambulance history:", error);
            setAmbulanceHistory([]);
        } finally {
            setHistoryLoading(false);
        }
    };
    const getPaginatedData = () => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return ambulanceHistory.slice(startIndex, endIndex);
    };

    {
        getPaginatedData().map((request, index) => (
            <tr key={request._id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                {/* rest of your row content */}
            </tr>
        ));
    }

    // Add this effect to fetch history when component mounts or page changes
    useEffect(() => {
        if (doctor?._id && token) {
            fetchAmbulanceHistory();
        }
    }, [doctor, token]);

    // Add this render function for status badges
    const renderStatusBadge = (status) => {
        const statusMap = {
            completed: { text: "Completed", class: "badge bg-success" },
            cancelled: { text: "Cancelled", class: "badge bg-danger" },
            pending: { text: "Pending", class: "badge bg-warning" },
            accepted: { text: "Accepted", class: "badge bg-info" },
        };
        const statusInfo = statusMap[status] || {
            text: status,
            class: "badge bg-secondary",
        };
        return <span className={statusInfo.class}>{statusInfo.text}</span>;
    };


    useEffect(() => {
        let data;
        const getlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            data = JSON.parse(decrypted);
        }
        if (!data) {
            navigate("/doctor");
        } else {
            setDoctor(data.doctorData);

            setToken(`Bearer ${data.accessToken}`);
        }
    }, [navigate]);
    


    // Table columns configuration for SmartDataTable
    const customTableStyles = {
        table: { backgroundColor: 'transparent', borderRadius: 0, boxShadow: 'none' }
    };

    const columns = [{
        name: 'No',
        cell: (row, index) => index + 1,
        width: '50px'
    }, {
        name: 'Name',
        selector: row => row.name,
        cell: row => (
            <div className="">
                <span className="fw-semibold">{row?.name || "N/A"}</span>
            </div>
        ),
    }, {
        name: 'Pickup',
        selector: row => row.pickupaddress,
        cell: row => (
            <div className="text-truncate" style={{ maxWidth: "150px" }} title={row.pickupaddress}>
                <span>{row.pickupaddress || "N/A"}</span>
            </div>
        ),
    }, {
        name: 'Drop',
        selector: row => row.dropaddress,
        cell: row => (
            <div className="text-truncate" style={{ maxWidth: "150px" }} title={row.dropaddress}>
                <span>{row.dropaddress || "N/A"}</span>
            </div>
        ),
    }, {
        name: 'Type',
        selector: row => row.ambulance_type,
        cell: row => (
            <span className="badge bg-primary">
                {row.ambulance_type || "N/A"}
            </span>
        ),
    }, {
        name: 'Status',
        selector: row => row.status,
        cell: row => renderStatusBadge(row.status),
    },
    {
        name: 'View',
        cell: row => (
            <button
                className="btn btn-sm p-1 appt-view-btn"
                onClick={() => {
                    setSelectedRequest(row);
                    setIsViewModalOpen(true);
                }}
                title="View Details"
            >
                <MdOutlineRemoveRedEye size={18} />
            </button>
        ),
        width: '100px',
        center: true
    }
    ];

    return (
        <>
            <NavBar logindata={doctor} />
            <Container className="my-4">
                <Row className="g-0">
                    <DoctorSidebar doctor={doctor} />
                    <Col xs={12} lg={9} className="p-3">
                        <div className="bg-white rounded p-2">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom py-3">
                                <h4 className="mb-0">Ambulance History</h4>
                            </div>
                        </div>
                        <div className="px-2">
                            <div className='appointments-card mb-3'>
                            <SmartDataTable
                                className="appointments-table"
                                columns={columns}
                                data={ambulanceHistory || []}
                                pagination
                                customStyles={customTableStyles}
                            />
                        </div>
                        </div>
                    </Col>
                </Row>
                <Modal show={isViewModalOpen} onHide={() => setIsViewModalOpen(false)} size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Ambulance Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-0">
                        {selectedRequest && (
                            <div className="ambulance-details-card">
                                {/* Header */}
                                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                                    <div className="text-muted">
                                        {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        }) : "Today, 4:42PM"}
                                    </div>
                                    <Badge bg={selectedRequest?.status === "completed" ? "success" : selectedRequest?.status === "cancelled" ? "danger" : "warning"}>{selectedRequest?.status}</Badge>
                                    <div className="fw-bold text-success">
                                        ₹ {selectedRequest.price || "80"}
                                    </div>
                                </div>

                                {/* Ambulance Driver/Vehicle Info */}
                                {selectedRequest.acceptedAmbulance && (
                                    <div className="d-flex align-items-center p-3 border-bottom">
                                        <FaAmbulance className="text-primary me-3" size={24} />
                                        <div className="flex-grow-1">
                                            <div className="fw-semibold">
                                                {selectedRequest.acceptedAmbulance.fullname || "NandKumar Yadav"}
                                            </div>
                                            <div className="text-muted small">
                                                Ambulance | {selectedRequest.acceptedAmbulance.vehicle_no || "GJ-05-TR-2859"}
                                            </div>
                                        </div>
                                        {/* <FaArrowRight className="text-muted" /> */}
                                    </div>
                                )}

                                {/* Pickup Location */}
                                <div className="p-3 border-bottom">
                                    <div className="d-flex">
                                        <div className="me-3">
                                            <div className="position-relative">
                                                <FaMapPin className="text-success" size={20} />
                                                <div className="vertical-dashed-line"></div>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="text-muted small mb-1">Pickup Location</div>
                                            <div className="fw-medium">
                                                {selectedRequest.pickupaddress || "Sahajanand Business Hub, Yogi Cho..."}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Drop Location */}
                                <div className="p-3 border-bottom">
                                    <div className="d-flex">
                                        <div className="me-3">
                                            <FaMapPin className="text-danger" size={20} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="text-muted small mb-1">Drop Location</div>
                                            <div className="fw-medium">
                                                {selectedRequest.dropaddress || "Savan Plaza, Savaliya Circle"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="d-flex justify-content-between align-items-center p-3 bg-light">
                                    <div className="text-muted small">
                                        Total Distance {selectedRequest.distance || "5.2"} Km
                                    </div>
                                    <div className="text-muted small">
                                        Total Duration {Math.round((selectedRequest.distance || 5.2) * 5)} Min
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal.Body>
                </Modal>
            </Container>
            {loading ? <Loader /> : ""}
        </>
    );
};

export default D_AmbulanceRequest;
