import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Container, Modal, Row } from "react-bootstrap";
import DoctorSidebar from "./DoctorSidebar";
import CryptoJS from "crypto-js";
import { SECRET_KEY, STORAGE_KEYS } from "../config";
import Navbar from "../Visitor/Component/NavBar";
import FooterBar from "../Visitor/Component/FooterBar";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { format } from "date-fns";
import {
  FiBarChart,
  FiClipboard,
  FiClock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiScissors,
  FiVideo,
} from "react-icons/fi";
import SmartDataTable from "../components/SmartDataTable";
import Loader from "../Loader";
import { PiHospital } from "react-icons/pi";
import { HiOutlineHome } from "react-icons/hi";
import { BsCameraVideo } from "react-icons/bs";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { showReportOrPrication } from "../global";

const DoctorDashboard = () => {
  var navigate = useNavigate();

  const [doctor, setdoctor] = useState(null);
  const [token, settoken] = useState(null);
  const [loading, setloading] = useState(false);

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
  }, []);

  const [count, setcount] = useState(null);

  const getcount = async () => {
    await axios({
      method: "get",
      url: `${API_BASE_URL}/doctor/count`,
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {
        setcount(res.data.Data);
      })
      .catch(function (error) {});
  };

  const [appointment, setappointment] = useState([]);

  useEffect(() => {
    setloading(true);
    if (doctor) {
      getcount();
      appointmentlist();
      // surgappointmentlist()
    }
  }, [token]);

  const appointmentlist = async () => {
    // setloading(true)
    await axios({
      method: "post",
      url: `${API_BASE_URL}/doctor/appointments/list`,
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {
        const today = format(new Date(), "dd-MM-yyyy");
        const all = Array.isArray(res.data?.Data) ? res.data.Data : [];
        const onlyToday = all.filter((item) => item?.date === today);
        setappointment(onlyToday);
      })
      .catch(function (error) {})
      .finally(() => {
        setloading(false);
      });
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusConfig = {
      Accept: {
        bg: "var(--primary-color-500)",
        text: "Accepted",
        dot: "var(--primary-color-600)",
      },
      Pending: {
        bg: "var(--secondary-color-600)",
        text: "Pending",
        dot: "var(--secondary-color-600)",
      },
      Cancel: {
        bg: "#ff5d5d",
        text: "Cancelled",
        dot: "var(--grayscale-color-700)",
      },
      Completed: {
        bg: "#019454ff",
        text: "Completed",
        dot: "var(--tertary-color-600)",
      },
    };
    return (
      statusConfig[status] || {
        bg: "var(--grayscale-color-500)",
        text: status,
        dot: "var(--grayscale-color-500)",
      }
    );
  };

  // Appointment type pill
  const getTypePill = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("clinic"))
      return {
        label: "Clinic Visit",
        cls: "badge-type badge-type--clinic",
        icon: <PiHospital size={16} />,
      };
    if (t.includes("home"))
      return {
        label: "Home Visit",
        cls: "badge-type badge-type--home",
        icon: <HiOutlineHome size={16} />,
      };
    return {
      label: type || "EOPD",
      cls: "badge-type badge-type--eopd",
      icon: <BsCameraVideo size={16} />,
    };
  };
  // Minimal table inline styles; visuals handled in CSS
  const customTableStyles = {
    table: {
      backgroundColor: "transparent",
      borderRadius: 0,
      boxShadow: "none",
    },
  };

  // table data
  const columns = [
    {
      name: "No",
      cell: (row, index) => index + 1,
      width: "50px",
    },
    {
      name: "Patient Name",
      selector: (row) => row.patientname,
      cell: (row) => (
        <div className="d-flex align-items-center text-truncate gap-3">
          <img
            // src={row.doctorid?.profile_pic}
            src={
              row.createdByuser?.profile_pic ||
              require("../Visitor/assets/profile_icon_img.png")
            }
            alt={`${row?.patientname} profile`}
            className="rounded-circle appt-avatar"
          />
          <span className="fw-semibold appt-doctor-name">
            {row?.patientname}
          </span>
        </div>
      ),
    },
    {
      name: "Date & Time",
      selector: (row) => row.date,
      cell: (row) => (
        <div className="d-flex align-items-center gap-2 text-muted small">
          <FiClock size={16} className="text-muted" />
          <span>{`${row.date} , ${row.time}`}</span>
        </div>
      ),
    },
    {
      name: "Amount",
      selector: (row) => row.visit_types,
      cell: (row) => (
        <div className="d-flex align-items-center gap-2 text-muted small">
          <span className="text-muted appt-price">₹</span>
          <span className="text-truncate"> {row?.price || "0"}</span>
        </div>
      ),
    },
    {
      name: "Type",
      cell: (row) => {
        const t = getTypePill(row.visit_types);
        return (
          <span className={t.cls}>
            {t.icon}
            {t.label}
          </span>
        );
      },
    },
    {
      name: "Status",
      cell: (row) => {
        const statusConfig = getStatusBadge(row.status);
        return (
          <span
            className="badge text-center"
            style={{
              backgroundColor: statusConfig.bg,
              color: "white",
              fontSize: "12px",
              padding: "4px 8px",
            }}
          >
            {statusConfig.text}
          </span>
        );
      },
      width: "120px",
      center: true,
    },
    {
      name: "View",
      cell: (row) => (
        <button
          className="btn btn-sm p-1 appt-view-btn"
          onClick={() => btnview(row._id)}
        >
          <MdOutlineRemoveRedEye size={18} />
        </button>
      ),
      width: "80px",
      center: true,
    },
  ];

  // display Appointment Details in model
  const [show, setShow] = useState(false);
  const [v, setsingleview] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  function btnview(id) {
    var datasingle = appointment.filter((v, i) => {
      return v._id === id;
    });
    setsingleview(datasingle);
    handleShow();
  }

  return (
    <>
      <Navbar logindata={doctor} />

      <Container className="my-4">
        <Row className="align-items-start">
          <DoctorSidebar doctor={doctor} />
          <Col xs={12} lg={9}>
            <div className="bg-white rounded dashboard-card p-2 mt-2">
              <Col xs={12}>
                <Row className="g-4">
                  <Col xs={6} md={3}>
                    <div className="bg-light rounded h-100 p-3 d-flex align-items-center gap-3 shadow">
                      <FiClipboard />
                      <div className="d-flex flex-column">
                        <small>Today Consultation</small>
                        <span className="fw-bold text-dark">
                          {count?.todayConsultationsAppointment}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="bg-light rounded h-100 p-3 d-flex align-items-center gap-3 shadow">
                      <FiVideo />
                      <div className="d-flex flex-column">
                        <small>Today EOPD</small>
                        <span className="fw-bold text-dark">
                          {count?.todayEOPDAppointment}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="bg-light rounded h-100 p-3 d-flex align-items-center gap-3 shadow">
                      <FiScissors />
                      <div className="d-flex flex-column">
                        <small>Today Surgery</small>
                        <span className="fw-bold text-dark">
                          {count?.todaySurgeryAppointment}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} md={3}>
                    <div className="bg-light rounded h-100 p-3 d-flex align-items-center gap-3 shadow">
                      <FiBarChart />
                      <div className="d-flex flex-column">
                        <small>Today Earning</small>
                        <span className="fw-bold text-dark">
                          ₹ {count?.todayEarnings}
                        </span>
                      </div>
                    </div>
                  </Col>
                </Row>
                <Row className="pt-4 g-5 ">
                  <Col xs={12}>
                    <h4 className="mt-3">Today Appointments</h4>
                    <SmartDataTable
                      className="appointments-table"
                      columns={columns}
                      data={appointment}
                      pagination
                      perPage={5}
                      customStyles={customTableStyles}
                    />
                  </Col>
                </Row>
              </Col>
            </div>
          </Col>
        </Row>
        {/* view single surgery */}
        {v &&
          v.map((v, i) => {
            return (
              <Modal
                show={show}
                onHide={handleClose}
                centered
                size="lg"
                key={i}
              >
                <Modal.Header closeButton>
                  <Modal.Title>Appointment Detail</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div
                    className="p-2 rounded-3 border rounded"
                    style={{ background: "var(--white)" }}
                  >
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={
                            v?.createdByuser?.profile_pic ||
                            require("../Visitor/assets/profile_icon_img.png")
                          }
                          alt={`${v?.patientname} profile`}
                          className="rounded-3"
                          style={{ width: 72, height: 72, objectFit: "cover" }}
                        />
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <h5 className="mb-0">{v?.patientname}</h5>
                          </div>
                          <div className="text-muted small">
                            <FiMail className="me-1" />{" "}
                            {v?.createdByuser?.email}
                          </div>
                          <div className="text-muted small">
                            <FiPhone className="me-1" /> +91{" "}
                            {v?.createdByuser?.mobile}
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-4 flex-wrap appointment_model text-center">
                        <div>
                          <p className="mb-0">Consultation Type</p>
                          <span
                            className="badge d-inline-flex align-items-center gap-2"
                            style={{ background: "#F1F5F8", color: "#253948" }}
                          >
                            {v?.visit_types}
                          </span>
                        </div>
                        <div>
                          <p className="mb-0">Consultation Status</p>
                          <span
                            className="badge d-inline-flex align-items-center gap-2"
                            style={{ background: "#E8F7EE", color: "#1F9254" }}
                          >
                            {v?.status}
                          </span>
                        </div>
                        <div>
                          <p className="mb-0">Consultation Fee</p>
                          {/* <span className='badge' style={{ background: '#E04F16', color: '#fff' }}>₹ {v?.status === "Cancel" || v?.status === "Pending" || v?.status === "Accept" ? v?.price === "" ? "0" : v?.price : v?.totalamount}</span> */}
                          <span
                            className="badge"
                            style={{ background: "#E04F16", color: "#fff" }}
                          >
                            ₹ {v?.price}
                          </span>
                        </div>
                      </div>
                    </div>
                    <hr />
                    <Row className="g-3">
                      <Col md={6} xs={12}>
                        <div className="text-muted small mb-1">
                          Appointment Date & Time
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <FiClock />
                          <span>
                            {v?.date}, {v?.time}
                          </span>
                        </div>
                      </Col>
                      {v?.visit_types === "clinic_visit" ? (
                        <>
                          <Col md={6} xs={12}>
                            <div className="text-muted small mb-1">
                              Clinic Name
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <PiHospital size={18} />
                              <span>{v?.hospital_name?.name || ""}</span>
                            </div>
                          </Col>
                          <Col xs={12}>
                            <div className="text-muted small mb-1">
                              Clinic Location
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <FiMapPin />
                              <span className="text-truncate">
                                {v?.hospital_name?.address || "-"}
                              </span>
                            </div>
                          </Col>{" "}
                        </>
                      ) : null}
                      <Col xs={12}>
                        <div className="text-muted small mb-1">Reason</div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="text-truncate">
                            {v?.appointment_reason || "-"}
                          </span>
                        </div>
                      </Col>
                    </Row>
                    {(v?.report || []).length > 0 && (
                      <div>
                        <hr />
                        <div className="fw-semibold mb-3">Reports</div>
                        <Row className="g-3">
                          {v.report.map((item, idx) => (
                            <Col md={4} sm={6} xs={12} key={idx}>
                              <Card className="h-100">
                                <div className="ratio ratio-16x9 bg-light">
                                  <iframe
                                    src={showReportOrPrication(item?.path)}
                                    title={`report_${idx}`}
                                    className="w-100 h-100 border-0"
                                  ></iframe>
                                </div>
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                  <div className="small text-muted">
                                    Report {idx + 1}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() =>
                                      window.open(
                                        showReportOrPrication(item?.path),
                                        "_blank"
                                      )
                                    }
                                  >
                                    View
                                  </Button>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    )}
                    <div>
                      {v.status === "Completed" && v?.doctor_remark != "" || v?.doctor_remark != undefined && (
                        <div>
                          <hr />
                          <div className="fw-semibold mb-3">Prescription</div>
                          <Row className="g-3">
                            <Col md={4} sm={6}>
                              <Card className="h-100">
                                <div className="ratio ratio-16x9 bg-light">
                                  <iframe
                                    src={showReportOrPrication(
                                      v?.doctor_remark
                                    )}
                                    title={`prescription consultant`}
                                    className="border-0"
                                  ></iframe>
                                </div>
                                <Card.Body className="d-flex justify-content-between align-items-center">
                                  <div className="small text-muted">
                                    Prescription
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    onClick={() =>
                                      window.open(
                                        showReportOrPrication(v?.doctor_remark),
                                        "_blank"
                                      )
                                    }
                                  >
                                    View
                                  </Button>
                                </Card.Body>
                              </Card>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </div>
                  </div>
                </Modal.Body>
              </Modal>
            );
          })}
      </Container>
      {loading && <Loader />}
      <FooterBar />
    </>
  );
};

export default DoctorDashboard;
