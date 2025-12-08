import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Col, Container, Row, Modal, Button, Image } from "react-bootstrap";
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
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

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

    const handleReviewModalShow = (review) => {
        setSelectedReview(review);
        setShowReviewModal(true);
    };

    const handleReviewModalClose = () => {
        setShowReviewModal(false);
        setSelectedReview(null);
    };

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
                            <Row className="g-3">
                                {
                                    reviewdata?.map((item, index) => (
                                        <Col xs={12} md={4} key={index}>
                                            <Card className="h-100 cursor-pointer" onClick={() => handleReviewModalShow(item)}>
                                                <Card.Body>
                                                    <div className="d-flex align-items-center flex-wrap gap-2 review_profile">
                                                        <img src={item?.createdBy?.profile_pic} alt="" />
                                                        <div className="ps-2">
                                                            <h5>{item?.createdBy?.name}</h5>
                                                            <small className="text-muted ms-auto badge bg-secondary-subtle"><FormattedDate isoString={item?.createdAt} /></small>
                                                        </div>
                                                    </div>
                                                    <hr />
                                                    <p className="m-0 truncaate_description_3">{item?.description}</p>
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

            {/* Review Details Modal */}
            <Modal show={showReviewModal} onHide={handleReviewModalClose} centered size='lg'>
                <Modal.Header closeButton>
                    <Modal.Title>Review Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReview && (
                        <div className="text-center">
                            <div className="mb-4 d-flex justify-content-center align-items-center gap-3">
                                <Image
                                    src={selectedReview?.createdBy?.profile_pic || require("../assets/image/doctor_img.jpg")}
                                    roundedCircle
                                    style={{width:'60px' , height:'60px' , objectFit:'cover'}}
                                    className="mb-3"
                                />
                                <div>
                                    <h5 className="fw-bold mb-2">{selectedReview?.createdBy?.name}</h5>
                                    <div className="d-flex justify-content-center align-items-center mb-3">
                                        {[...Array(5)].map((_, idx) => {
                                            const num = Number(selectedReview?.rating);
                                            const clamped = Number.isFinite(num) ? Math.max(0, Math.min(5, num)) : 0;
                                            const filled = Math.round(clamped);
                                            return (
                                                <FaStar
                                                    key={idx}
                                                    className={(idx < filled ? 'text-warning' : 'text-secondary') + ' me-1'}
                                                    fill={idx < filled ? "#F6B900" : "#6c757d"}
                                                    size={18}
                                                />
                                            );
                                        })}
                                        <span className="ms-2 fw-bold">
                                            {Number.isFinite(Number(selectedReview?.rating)) ? selectedReview?.rating.toFixed(1) : '0.0'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-start">
                                <h6 className="fw-bold mb-3">Review Description:</h6>
                                <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
                                    {selectedReview?.description}
                                </p>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            <ToastContainer />
            {loading ? <Loader /> : ""}
        </>
    );
};

export default D_Review;
