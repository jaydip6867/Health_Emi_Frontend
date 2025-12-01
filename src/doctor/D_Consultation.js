import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Col, Container, Form, Modal, Row } from "react-bootstrap";
import DoctorSidebar from "./DoctorSidebar";
import CryptoJS from "crypto-js";
import Loader from "../Loader";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import NavBar from "../Visitor/Component/NavBar";

const D_Consultation = () => {

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
      getconsultant();
    }
  }, [token]);

  const [consultdata, setconsultdata] = useState(null);

  function getconsultant() {
    setloading(true);
    axios({
      method: "post",
      url: `${API_BASE_URL}/user/doctors/getone`,
      data: {
        doctorid: doctor._id,
      },
    })
      .then((res) => {
        // console.log(res.data.Data)
        setconsultdata(res.data.Data.consultationsDetails);
        if (res.data.Data.consultationsDetails) {
          const c_data = {
            home_visit_price:
              res.data.Data.consultationsDetails.home_visit_price,
            clinic_visit_price:
              res.data.Data.consultationsDetails.clinic_visit_price,
            eopd_price: res.data.Data.consultationsDetails.eopd_price,
          };
          setconsult(c_data);
        }
      })
      .catch(function (error) {
        // console.log(error);
        toast(error.response.data.Message, { className: "custom-toast-error" });
      })
      .finally(() => {
        setloading(false);
      });
  }

  const obj = { home_visit_price: "", clinic_visit_price: "", eopd_price: "" };
  const [consult, setconsult] = useState(obj);

  // display surgery in model
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const selconsult = (e) => {
    const { name, value } = e.target;
    setconsult((consult) => ({
      ...consult,
      [name]: value,
    }));
  };

  const addconsultant = async () => {
    setloading(true);
    axios({
      method: "post",
      url: `${API_BASE_URL}/doctor/consultations/save`,
      headers: {
        Authorization: token,
      },
      // data: surgery
      data: consult,
    })
      .then((res) => {
        // toast('Surgery added...', { className: 'custom-toast-success' })
        Swal.fire({
          title: "Consultant Added...",
          icon: "success",
        });
        // getsurgery()
        setconsult(obj);
        getconsultant();
        handleClose();
      })
      .catch(function (error) {
        // console.log(error);
        toast(error.response.data.Message, { className: "custom-toast-error" });
      })
      .finally(() => {
        setloading(false);
      });
  };

  return (
    <>
    <NavBar logindata={doctor}/>
      <Container className="my-4">
        <Row className="align-items-start">
          <DoctorSidebar doctor={doctor}/>
          <Col xs={12} md={9}>
            <div className="bg-white">
              <div className='appointments-card mb-3'>
                <div className='d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom pb-3'>
                  <h4>My Consultation Charges</h4>
                  <Button variant="primary" onClick={handleShow} className="apt_accept_btn">
                    {consultdata !== null ? "Edit" : "Add"} Consultation
                  </Button>
                </div>
              </div>
              <div className="d-flex gap-3 register_doctor">
                <p>
                  <Form.Label>Home Visit</Form.Label>
                  <Form.Control type="text" value={consultdata?.home_visit_price} readOnly/>
                </p>
                <p>
                  <Form.Label>Clinic Visit</Form.Label>
                  <Form.Control type="text" value={consultdata?.clinic_visit_price} readOnly/>
                </p>
                <p>
                  <Form.Label>EOPD</Form.Label>
                  <Form.Control type="text" value={consultdata?.eopd_price} readOnly/>
                </p>
              </div>
            </div>
          </Col>
        </Row>
        {/* add surgery */}
        <Modal show={show} onHide={handleClose} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Add Surgery Detail</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row className="g-4">
              <Col xs={12} md={12}>
                <div className="bg-white rounded p-3 shadow">
                  <Form className="row register_doctor justfify-content-center">
                    <Form.Group controlId="hv" className="mb-3 col-md-4">
                      <div className="position-relative">
                        <Form.Label>Home Visit Price</Form.Label>
                        <Form.Control
                          placeholder="Ex:- 500"
                          name="home_visit_price"
                          value={consult.home_visit_price}
                          onChange={selconsult}
                        />
                      </div>
                    </Form.Group>

                    <Form.Group controlId="cv" className="mb-3 col-md-4">
                      <div className="position-relative">
                        <Form.Label>Clinic Visit Price</Form.Label>
                        <Form.Control
                          placeholder="Ex:- 500"
                          name="clinic_visit_price"
                          value={consult.clinic_visit_price}
                          onChange={selconsult}
                        />
                      </div>
                    </Form.Group>

                    <Form.Group controlId="eopd" className="mb-3 col-md-4">
                      <div className="position-relative">
                        <Form.Label>EOPD Price</Form.Label>
                        <Form.Control
                          placeholder="Ex:- 1000"
                          name="eopd_price"
                          value={consult.eopd_price}
                          onChange={selconsult}
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="col-auto mx-auto">
                      <Form.Control
                        type="button"
                        value={
                          consult?.home_visit_price === "" &&
                          consult?.clinic_visit_price === "" &&
                          consult?.eopd_price === ""
                            ? "Add Consultation"
                            : "Update Consultation"
                        }
                        onClick={addconsultant}
                        className="theme_btn"
                      />
                    </Form.Group>
                  </Form>
                </div>
              </Col>
            </Row>
          </Modal.Body>
        </Modal>
      </Container>
      <ToastContainer />
      {loading ? <Loader /> : ""}
    </>
  );
};

export default D_Consultation;
