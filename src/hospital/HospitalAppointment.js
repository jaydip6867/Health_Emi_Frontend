import React, { useEffect, useMemo, useState } from "react";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import { Col, Container, Row, Form } from "react-bootstrap";
import { API_BASE_URL, STORAGE_KEYS } from "../config";
import HospitalSidebar from "./HospitalSidebar";
import axios from "axios";
import SmartDataTable from "../components/SmartDataTable";

const HospitalAppointment = () => {
    const SECRET_KEY = "health-emi";
    const navigate = useNavigate();

    const [hospital, setHospital] = useState(null);
    const [token, setToken] = useState(null);
    const [branches, setBranches] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    const [filters, setFilters] = useState({
        startDate: today,
        endDate: today,
        branchid: "",
    });

    // --------------------------------------------------
    // Get Hospital Data
    // --------------------------------------------------
    useEffect(() => {
        const getLocalData = localStorage.getItem(
            STORAGE_KEYS.HOSPITAL
        );

        if (!getLocalData) {
            navigate("/hospital");
            return;
        }

        try {
            const bytes = CryptoJS.AES.decrypt(
                getLocalData,
                SECRET_KEY
            );

            const decrypted = bytes.toString(CryptoJS.enc.Utf8);

            if (!decrypted) {
                navigate("/hospital");
                return;
            }

            const data = JSON.parse(decrypted);

            if (!data) {
                navigate("/hospital");
                return;
            }

            setHospital(data.hospitalData);

            const authToken = `Bearer ${data.accessToken}`;

            setToken(authToken);

            getHospitalProfile(authToken);
        } catch (error) {
            console.log("Hospital data error:", error);
            navigate("/hospital");
        }
    }, [navigate]);

    // --------------------------------------------------
    // Get Hospital Profile / Branches
    // --------------------------------------------------
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

            const branchList =
                response?.data?.Data?.branchdetails ||
                response?.data?.data?.branchdetails ||
                [];

            setBranches(branchList);
        } catch (error) {
            console.log("Branch API error:", error);
            setBranches([]);
        }
    };

    // --------------------------------------------------
    // Format Date
    // --------------------------------------------------
    const formatDate = (date) => {
        if (!date) return "";

        const d = new Date(date);

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;
    };

    // --------------------------------------------------
    // Get Appointments
    // IMPORTANT:
    // Only Date is sent to API.
    // Branch filtering is handled on frontend.
    // --------------------------------------------------
    const getAppointments = async () => {
        if (!token) return;

        setLoading(true);

        try {
            const response = await axios.post(
                `${API_BASE_URL}/hospital/appointments/list`,
                {
                    search: "",
                    startDate: formatDate(filters.startDate),
                    endDate: formatDate(filters.endDate),
                    // Do NOT send branchid for frontend filtering
                    branchid: "",
                },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );

            const appointmentData =
                response?.data?.Data ||
                response?.data?.data ||
                [];

            setAppointments(
                Array.isArray(appointmentData)
                    ? appointmentData
                    : []
            );
        } catch (error) {
            console.log("Appointment API error:", error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // API call only when DATE changes
    // Branch change does NOT call API
    // --------------------------------------------------
    useEffect(() => {
        if (!token) return;

        getAppointments();
    }, [token, filters.startDate, filters.endDate]);

    // --------------------------------------------------
    // Handle Filter Change
    // --------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // --------------------------------------------------
    // Filter appointments by SELECTED BRANCH NAME
    // --------------------------------------------------
    const filteredAppointments = useMemo(() => {
        // All Branches selected
        if (!filters.branchid) {
            return appointments;
        }

        // Find selected branch from branches array
        const selectedBranch = branches.find(
            (branch) =>
                String(branch._id) === String(filters.branchid)
        );

        if (!selectedBranch) {
            return appointments;
        }

        const selectedBranchName =
            selectedBranch.branchname?.trim().toLowerCase();

        // Filter API records using branch NAME
        return appointments.filter((appointment) => {
            const appointmentBranchName =
                appointment?.branchdetails?.branchname
                    ?.trim()
                    .toLowerCase();

            return (
                appointmentBranchName === selectedBranchName
            );
        });
    }, [
        appointments,
        branches,
        filters.branchid,
    ]);

    // --------------------------------------------------
    // Table Columns
    // --------------------------------------------------
    const columns = [
        {
            name: "Patient",
            selector: (row) =>
                row?.patientname || "-",
            sortable: true,
        },
        {
            name: "Doctor",
            selector: (row) =>
                row?.doctorid?.name || "-",
            sortable: true,
        },
        {
            name: "Branch",
            selector: (row) =>
                row?.branchdetails?.branchname || "-",
            sortable: true,
        },
        {
            name: "Date",
            selector: (row) =>
                row?.date || "-",
            sortable: true,
        },
        {
            name: "Time",
            selector: (row) =>
                row?.time || "-",
        },
        {
            name: "Status",
            cell: (row) => (
                <span className="badge bg-success">
                    {row?.status || "-"}
                </span>
            ),
        },
    ];

    return (
        <Container>
            <Row className="g-0">

                <HospitalSidebar
                    hospital={hospital}
                />

                <Col
                    xs={12}
                    sm={9}
                    className="p-3 mt-3"
                >
                    <div className="appointments-card mb-3">

                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3">
                            <h4 className="mb-0">
                                Appointments
                            </h4>
                        </div>

                        <div className="row mb-4">

                            {/* Start Date */}
                            <div className="col-md-3">
                                <Form.Label>
                                    Start Date
                                </Form.Label>

                                <Form.Control
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* End Date */}
                            <div className="col-md-3">
                                <Form.Label>
                                    End Date
                                </Form.Label>

                                <Form.Control
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Branch */}
                            <div className="col-md-3">
                                <Form.Label>
                                    Branch
                                </Form.Label>

                                <Form.Select
                                    name="branchid"
                                    value={filters.branchid}
                                    onChange={handleChange}
                                >
                                    <option value="">
                                        All Branches
                                    </option>

                                    {branches.map((branch) => (
                                        <option
                                            key={branch._id}
                                            value={branch._id}
                                        >
                                            {branch.branchname}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>

                        </div>
                    </div>

                    {/* Appointment Table */}
                    <SmartDataTable
                        columns={columns}
                        data={filteredAppointments}
                        pagination
                        striped
                        responsive
                        highlightOnHover
                        progressPending={loading}
                    />

                </Col>
            </Row>
        </Container>
    );
};

export default HospitalAppointment;