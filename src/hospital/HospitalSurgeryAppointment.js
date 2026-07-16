import React, { useEffect, useState } from 'react'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import HospitalSidebar from './HospitalSidebar';
import axios from "axios";
import SmartDataTable from "../components/SmartDataTable";
import { Form, Button } from "react-bootstrap";

const HospitalSurgeryAppointment = () => {

    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();

    const [hospital, sethospital] = useState(null)
    const [token, settoken] = useState(null)
    const [branches, setBranches] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    const [filters, setFilters] = useState({
        startDate: today,
        endDate: today,
        branchid: "",
    });

    useEffect(() => {
        var getlocaldata = localStorage.getItem(STORAGE_KEYS.HOSPITAL);
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }
        if (!data) {
            navigate('/hospital')
        }
        else {
            sethospital(data.hospitalData);
            settoken(`Bearer ${data.accessToken}`)
        }

    }, [navigate])

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
            getHospitalProfile(authToken);
        } else {
            navigate("/hospital");
        }
    }, []);

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
        } catch (err) {
            console.log(err);
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const getAppointments = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/hospital/surgeryappointments/list`,
                {
                    search: "",
                    startDate: formatDate(filters.startDate),
                    endDate: formatDate(filters.endDate),
                    branchid: filters.branchid,
                },
                {
                    headers: {
                        Authorization: token,
                    },
                }
            );
            setAppointments(
                response?.data?.Data ||
                response?.data?.data ||
                []
            );
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const columns = [
        {
            name: "Patient",
            selector: row => row.patient_name,
            sortable: true,
        },
        {
            name: "Doctor",
            selector: row => row.doctor_name,
            sortable: true,
        },
        {
            name: "Branch",
            selector: row => row.branch_name,
        },
        {
            name: "Date",
            selector: row => row.appointment_date,
        },
        {
            name: "Time",
            selector: row => row.appointment_time,
        },
        {
            name: "Status",
            cell: row => (
                <span className="badge bg-success">
                    {row.status}
                </span>
            )
        }
    ];

    return (
        <>
            <Container >
                <Row className='g-0'>
                    <HospitalSidebar hospital={hospital} />
                    <Col xs={12} sm={9} className='p-3 mt-3'>
                        <div className="appointments-card mb-3 ">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3">
                                <h4 className="mb-0">Surgery Appointments</h4>
                            </div>
                            <div className="row mb-4">
                                <div className="col-md-3">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="startDate"
                                        value={filters.startDate}
                                        onChange={handleChange}
                                    />

                                </div>
                                <div className="col-md-3">
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="endDate"
                                        value={filters.endDate}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <Form.Label>Branch</Form.Label>
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
                                <div className="col-md-3 d-flex align-items-end">
                                    <Button
                                        className="w-100"
                                        onClick={getAppointments}
                                        className="apt_accept_btn"
                                    >
                                        Search
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <SmartDataTable
                            columns={columns}
                            data={appointments}
                            pagination
                            striped
                            responsive
                            highlightOnHover
                            progressPending={loading}
                        />
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default HospitalSurgeryAppointment