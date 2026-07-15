import React, { useEffect, useState } from 'react'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import HospitalSidebar from './HospitalSidebar';
import SmartDataTable from "../components/SmartDataTable";
import axios from 'axios';

const HospitalDoctor = () => {

    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();

    const [hospital, sethospital] = useState(null)
    const [token, settoken] = useState(null)
    const [doctorlist, setdoctorlist] = useState(null)
    const [loading, setloading] = useState(false);

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
            // Call API after token is available
            getdoctors(authToken);
        } else {
            navigate("/hospital");
        }
    }, [navigate]);

    const getdoctors = async (authToken) => {
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
            console.log(response.data);
            setdoctorlist(response?.data?.Data || response?.data?.data || []);
        } catch (error) {
            console.error("Error fetching doctors:", error);
        } finally {
            setloading(false);
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
        {
            name: "Specialty",
            selector: (row) => row.sub_specialty,
            sortable: true,
        },
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
    ];

    return (
        <>
            <Container fluid className='p-0'>
                <Row className='g-0'>
                    <HospitalSidebar hospital={hospital} />
                    <Col xs={12} sm={9} className='p-3 mt-3'>
                        <div className="appointments-card mb-3 ">
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3">
                                <h4 className="mb-0">Doctors List</h4>
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
            </Container>
        </>
    )
}

export default HospitalDoctor