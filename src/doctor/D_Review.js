import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Col, Container, Row } from "react-bootstrap";
import DoctorSidebar from "./DoctorSidebar";
import CryptoJS from "crypto-js";
import Loader from "../Loader";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import NavBar from "../Visitor/Component/NavBar";
import { FaRegStar, FaStar } from "react-icons/fa";

const D_Review = () => {

    var navigate = useNavigate();
    const [loading, setloading] = useState(false);

    const [doctor, setdoctor] = useState(null);
    const [token, settoken] = useState(null);

    useEffect(() => {
        var getlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }
        if (!data) {
            navigate("/doctor");
        } else {
            setdoctor(data.doctorData);
            settoken(`Bearer ${data.accessToken}`);
        }
    }, [navigate]);

    useEffect(() => {
        if (token) {
            getreview();
        }
    }, [token]);

    const [reviewdata, setreviewdata] = useState(null);

    function getreview() {
        setloading(true);
        axios({
            method: "post",
            url: `${API_BASE_URL}/doctor/review/list`,
            headers: {
                Authorization: token,
            },
            data: {
                search: ""
            },
        })
            .then((res) => {
                console.log(res.data.Data)
                setreviewdata(res.data.Data);
            })
            .catch(function (error) {
                console.log(error);
                // toast(error.response.data.Message, { className: "custom-toast-error" });
            })
            .finally(() => {
                setloading(false);
            });
    }

    function FormattedDate({ isoString }) {
        const formatted = new Date(isoString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "numeric",
            day: "numeric"
        });

        return <div>{formatted}</div>;
    }

    return (
        <>
            <NavBar logindata={doctor} />
            <Container className="my-4">
                <Row className="align-items-start">
                    <DoctorSidebar doctor={doctor} />
                    <Col xs={12} md={9}>
                        <div className="bg-white">
                            <div className='appointments-card mb-3'>
                                <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3'>
                                    <h4>My Reviews</h4>
                                </div>
                            </div>
                            <Row>
                                {
                                    reviewdata?.map((item, index) => (
                                        <Col xs={12} md={4} key={index}>
                                            <Card>
                                                <Card.Body>
                                                    <div className="d-flex align-items-center flex-wrap gap-2 mb-2 review_profile">
                                                        <img src={item?.createdBy?.profile_pic} alt="" />
                                                        <h5>{item?.createdBy?.name}</h5>
                                                        <small className="text-muted ms-auto badge bg-secondary-subtle position-absolute top-0 end-0"><FormattedDate isoString={item?.createdAt} /></small>
                                                    </div>
                                                    <hr />
                                                    <p className="">{item?.description}</p>
                                                    <div>
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i}>{i < item?.rating ? <FaStar fill="#F6B900" /> : <FaRegStar fill="#F6B900" />}</span>
                                                        ))}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))
                                }
                            </Row>
                        </div>
                    </Col>
                </Row>

            </Container>
            <ToastContainer />
            {loading ? <Loader /> : ""}
        </>
    );
};

export default D_Review;
