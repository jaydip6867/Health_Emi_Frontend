import React, { useEffect, useState } from "react";
import Loader from "../Loader";
import { Col, Container, Modal, Row, OverlayTrigger, Tooltip, Card } from "react-bootstrap";
import P_Sidebar from "./P_Sidebar";
import NavBar from "../Visitor/Component/NavBar";
import FooterBar from "../Visitor/Component/FooterBar";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SmartDataTable from "../components/SmartDataTable";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from "../config";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { FiClock } from "react-icons/fi";
import { PiHospital } from "react-icons/pi";
import { showReportOrPrication } from "../global";

const P_EmiApplications = () => {
  var navigate = useNavigate();
  const [loading, setloading] = useState(false);

  const [patient, setpatient] = useState(null);
  const [token, settoken] = useState(null);
  const [emiData, setEmiData] = useState([]);

  useEffect(() => {
    var getlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
    if (getlocaldata != null) {
      try {
        const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        var data = JSON.parse(decrypted);
        if (!data) {
          navigate("/patient");
        } else {
          setpatient(data.userData);
          settoken(`Bearer ${data.accessToken}`);
        }
      } catch (e) {
        navigate("/patient");
      }
    } else {
      navigate("/patient");
    }
  }, [navigate]);

  useEffect(() => {
    if (patient && token) {
      setloading(true);
      axios({
        method: "post",
        url: `${API_BASE_URL}/user/emidocuments/status`,
        headers: {
          Authorization: token,
        },
      })
        .then((res) => {
          setEmiData(res.data.Data || []);
        })
        .catch(function (error) {
          console.log("Error fetching EMI applications:", error);
        })
        .finally(() => {
          setloading(false);
        });
    }
  }, [patient, token]);

  const [show, setShow] = useState(false);
  const [singleView, setSingleView] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function btnview(id) {
    const dataSingle = emiData.find((v) => v._id === id);
    setSingleView(dataSingle);
    handleShow();
  }

  const renderTooltip = (label) => (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {label}
    </Tooltip>
  );

  const getStatusBadge = (status) => {
    const s = status || "Pending";
    if (s.toLowerCase() === "approved") {
      return <span className="badge" style={{ background: "#E8F7EE", color: "#1F9254" }}>Approved</span>;
    } else if (s.toLowerCase() === "rejected") {
      return <span className="badge" style={{ background: "#FEE2E2", color: "#EF4444" }}>Rejected</span>;
    }
    return <span className="badge" style={{ background: "#FEF3C7", color: "#D97706" }}>Pending</span>;
  };

  const columns = [
    {
      name: "No",
      selector: (row, index) => index + 1,
      width: "60px",
    },
    {
      name: "Patient Name",
      selector: (row) => row.patient_name || "N/A",
    },
    {
      name: "Hospital",
      selector: (row) => row.hospital_name || "N/A",
      cell: (row) => (
        <div className="d-flex align-items-center gap-2 text-muted">
          <PiHospital size={16} />
          <span className="text-truncate" style={{ maxWidth: 200 }}>
            {row.hospital_name || "N/A"}
          </span>
        </div>
      ),
    },
    {
      name: "Amount (₹)",
      selector: (row) => row.estimated_amount || "0",
      cell: (row) => (
        <div>
          <span className="fw-semibold text-primary">Applied: ₹{row.estimated_amount || "0"}</span>
          {row.status === "approved" && (
            <div className="text-success small fw-semibold">Approved: ₹{row.approved_amount || "0"}</div>
          )}
        </div>
      ),
    },
    {
      name: "Date",
      selector: (row) => row.createdAt,
      cell: (row) => {
        const d = new Date(row.createdAt);
        return (
          <div className="d-flex align-items-center gap-2 text-muted">
            <FiClock size={16} />
            <span>{d.toLocaleDateString()}</span>
          </div>
        );
      },
    },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => getStatusBadge(row.status),
      width: "120px",
    },
    {
      name: "View",
      cell: (row) => (
        <OverlayTrigger placement="top" overlay={renderTooltip("View Details")}>
          <button className="btn btn-sm p-1 text-primary" onClick={() => btnview(row._id)}>
            <MdOutlineRemoveRedEye size={18} />
          </button>
        </OverlayTrigger>
      ),
      width: "80px",
      center: true,
    },
  ];

  const customTableStyles = {
    table: {
      backgroundColor: "transparent",
      borderRadius: 0,
      boxShadow: "none",
    },
  };

  return (
    <>
      <NavBar logindata={patient} />
      <Container>
        <Row className="align-items-start">
          <P_Sidebar patient={patient} />
          <Col xs={12} lg={9} className="p-3">
            <div className="p-3 mb-3 position-sticky top-0 bg-white rounded shadow-sm border">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom py-3">
                <h4 className="mb-0">My EMI Applications</h4>
              </div>
              <SmartDataTable
                className="appointments-table"
                columns={columns}
                data={emiData}
                pagination
                customStyles={customTableStyles}
              />
            </div>
          </Col>
        </Row>

        {singleView && (
          <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Application Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="p-4 rounded-3 border bg-light">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h5 className="mb-1">{singleView.patient_name || "N/A"}</h5>
                    <div className="text-muted small">Applicant: {singleView.full_name || "N/A"}</div>
                  </div>
                  <div className="text-end">
                    <div className="mb-1">{getStatusBadge(singleView.status)}</div>
                    <div className="text-muted small">
                      {new Date(singleView.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <Row className="g-3 border-top pt-3">
                  <Col md={6}>
                    <div className="text-muted small mb-1">Hospital Name</div>
                    <div className="fw-semibold">{singleView.hospital_name || "N/A"}</div>
                  </Col>
                  <Col md={6}>
                    <div className="text-muted small mb-1">Treatment Type</div>
                    <div className="fw-semibold">{singleView.treatment_type || "N/A"}</div>
                  </Col>
                  <Col md={6}>
                    <div className="text-muted small mb-1">Applied Amount</div>
                    <div className="fw-semibold text-primary">₹{singleView.estimated_amount || "0"}</div>
                  </Col>
                  {singleView.status === "approved" && (
                    <Col md={6}>
                      <div className="text-muted small mb-1">Approved Amount</div>
                      <div className="fw-semibold text-success">₹{singleView.approved_amount || "0"}</div>
                    </Col>
                  )}
                  <Col md={6}>
                    <div className="text-muted small mb-1">Monthly Income</div>
                    <div className="fw-semibold">₹{singleView.monthly_income || "0"}</div>
                  </Col>
                  <Col md={6}>
                    <div className="text-muted small mb-1">Employment Type</div>
                    <div className="fw-semibold">{singleView.employment_type || "N/A"}</div>
                  </Col>
                  <Col md={6}>
                    <div className="text-muted small mb-1">Contact No</div>
                    <div className="fw-semibold">{singleView.alternate_no || "N/A"}</div>
                  </Col>
                </Row>

                {singleView.remark && (
                  <div className="mt-4 p-3 border rounded bg-white">
                    <div className="text-muted small mb-1 fw-semibold">Audit Remarks / Explanation</div>
                    <p className="mb-0 text-danger">{singleView.remark}</p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-top">
                  <h6 className="mb-3">Uploaded Documents</h6>
                  <Row className="g-3">
                    {Object.entries({
                      "Aadhaar Card": singleView.aadhaar_card,
                      "PAN Card": singleView.pan_card,
                      "Prescription": singleView.prescription,
                      "Insurance": singleView.insurance,
                      "Hospital Quotation": singleView.hospital_quotation,
                      "Medical Estimate": singleView.medical_estimate,
                      "Reports": singleView.reports,
                      "Relationship Proof": singleView.relationship_proof,
                      "ITR File": singleView.itr_file
                    }).map(([label, url]) => {
                      if (!url || url === "N/A") return null;
                      return (
                        <Col xs={6} md={4} key={label}>
                          <Card className="h-100 border-0 shadow-sm text-center p-2">
                            <a href={showReportOrPrication(url)} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                              <img 
                                src={showReportOrPrication(url)} 
                                alt={label} 
                                style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }}
                                onError={(e) => { e.target.src = "https://placehold.co/600x400/eeeeee/999999?text=PDF/Doc"; }}
                              />
                              <div className="small fw-semibold text-dark">{label}</div>
                            </a>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        )}
      </Container>
      {loading ? <Loader /> : ""}
      <FooterBar />
    </>
  );
};

export default P_EmiApplications;
