import React, { useState, useEffect, useMemo } from 'react';
import { Col, Container, Row, Badge, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaAmbulance, FaMapPin, FaCreditCard } from 'react-icons/fa';
import { MdOutlineRemoveRedEye } from 'react-icons/md';
import Amb_Nav from './Amb_Nav';
import Amb_Sidebar from './Amb_Sidebar';
import SmartDataTable from '../components/SmartDataTable';
import Loader from '../Loader';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';

const Amb_Request = () => {
  const navigate = useNavigate();
  const [ambulance, setambulance] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("notified");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Filter by status based on active tab
  const filteredData = useMemo(() => {
    if (!requests) return [];
    const map = {
      notified: ["notified"],
      accepted: ["accepted"],
      completed: ["completed"],
      cancelled: ["cancelled"],
    };
    const allowed = map[activeTab] || [];
    return requests.filter((r) => allowed.includes(r.status));
  }, [requests, activeTab]);

  const counts = useMemo(() => {
    const c = { notified: 0, accepted: 0, completed: 0, cancelled: 0 };
    (requests || []).forEach((r) => {
      if (r.status === "notified") c.notified++;
      else if (r.status === "accepted") c.accepted++;
      else if (r.status === "completed") c.completed++;
      else if (r.status === "cancelled") c.cancelled++;
    });
    return c;
  }, [requests]);

  // Razorpay payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Render status badge function
  const renderStatusBadge = (status) => {
    const statusMap = {
      notified: { text: "Pending", class: "badge bg-warning" },
      accepted: { text: "Accepted", class: "badge bg-success" },
      completed: { text: "Completed", class: "badge bg-info" },
      cancelled: { text: "Rejected", class: "badge bg-danger" },
    };
    const statusInfo = statusMap[status] || {
      text: status,
      class: "badge bg-secondary",
    };
    return <span className={statusInfo.class}>{statusInfo.text}</span>;
  };

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
    selector: row => row.doctorid?.name || row.patientid?.name,
    cell: row => (
      <div className="">
        <span className="fw-semibold">{row.doctorid?.name || row.patientid?.name || "N/A"}</span>
        <div className="small text-muted">
          {row.requestertype === 'doctor' ? 'Doctor' : 'Patient'}
        </div>
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
    name: 'Status',
    selector: row => row.status,
    cell: row => renderStatusBadge(row.status),
  }, {
    name: 'Price',
    selector: row => row.price,
    cell: row => (
      <span className="fw-bold text-success">₹{row.price || "80"}</span>
    ),
  }, {
    name: 'Actions',
    cell: row => (
      <div className="d-flex gap-2">
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
        {row.status === 'notified' && (
          <button
            className="btn btn-sm btn-success"
            onClick={() => handleAcceptRequest(row)}
            title="Accept Request"
          >
            <FaAmbulance size={14} />
          </button>
        )}
      </div>
    ),
    width: '120px',
    center: true
  }];

  // Fetch requests data
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const getlocaldata = localStorage.getItem(STORAGE_KEYS.AMBULANCE);
        if (!getlocaldata) {
          navigate("/ambulance");
          return;
        }

        const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        const data = JSON.parse(decrypted);
        setambulance(data.ambulanceData);
        const response = await axios.post(
          `${API_BASE_URL}/ambulance/ambulancerequest/list`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${data.accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(response.data.Data)
        setRequests(response.data.Data || []);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate]);



  // Handle accept request
  const handleAcceptRequest = (request) => {
    setSelectedRequest(request);
    setShowPaymentModal(true);
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async () => {
    if (!selectedRequest) return;

    setPaymentProcessing(true);

    try {
      // Get ambulance data from localStorage
      const getlocaldata = localStorage.getItem(STORAGE_KEYS.AMBULANCE);
      if (!getlocaldata) {
        navigate("/ambulance");
        return;
      }

      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      const data = JSON.parse(decrypted);

      // 1️⃣ Create order from backend
      const { data: orderData } = await axios.post(
        `${API_BASE_URL}/user/order/create`,
        { 
          amount: Math.round((selectedRequest.price || 80) * 0.10), // 10% of total amount
        },
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`, // REQUIRED
          },
        }
      );

      console.log(orderData, "orderData");
      if (orderData != "") {
        const options = {
          key: "rzp_live_S0smOweosyTmQ8",
          order_id: orderData.Data.id, // ✅ MUST
          amount: orderData.Data.amount, // from backend (paise)
          currency: "INR",
          name: "Health Emi",
          description: "Ambulance Service Fee",

          handler: async function (response) {
            try {
              console.log("Payment Success:", response);

              // Payment successful, now accept the ambulance request
              await acceptAmbulanceRequest(response);
            } catch (err) {
              console.error("Payment successful but request acceptance failed:", err);
              Swal.fire({
                title: "Payment Successful",
                text: "Payment was successful but there was an issue accepting the request. Please contact support.",
                icon: "warning",
                confirmButtonText: "Ok",
              });
            }
          },

          prefill: {
            name: ambulance?.fullname || "",
            email: ambulance?.email || "",
            contact: ambulance?.mobile || "",
          },

          theme: { color: "#4CAF50" },

          modal: {
            ondismiss() {
              console.log("Payment cancelled");
              setPaymentProcessing(false);
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error("Payment error:", error);
      Swal.fire({
        title: "Payment Error",
        text: "Unable to initiate payment. Please try again.",
        icon: "error",
        confirmButtonText: "Ok",
      });
      setPaymentProcessing(false);
    }
  };

  // Accept ambulance request after successful payment
  const acceptAmbulanceRequest = async (paymentResponse) => {
    try {
      // Get ambulance data from localStorage
      const getlocaldata = localStorage.getItem(STORAGE_KEYS.AMBULANCE);
      if (!getlocaldata) {
        navigate("/ambulance");
        return;
      }

      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      const data = JSON.parse(decrypted);

      // Call requestambulance API after successful payment
      const response = await axios.post(
        `${API_BASE_URL}/ambulance/requestambulance`,
        {
          ambulancerequestid: selectedRequest._id,
          paymentMethod: 'razorpay',
          paymentStatus: 'paid',
          paymentId: paymentResponse.razorpay_payment_id,
          amount: selectedRequest.price || 0,
        },
        {
          headers: {
            'Authorization': `Bearer ${data.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.IsSuccess) {
        // Close payment modal
        setShowPaymentModal(false);
        setSelectedRequest(null);

        // Refresh requests list
        const fetchRequests = async () => {
          try {
            const response = await axios.post(
              `${API_BASE_URL}/ambulance/ambulancerequest/list`,
              {},
              {
                headers: {
                  'Authorization': `Bearer ${data.accessToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            setRequests(response.data.Data || []);
          } catch (error) {
            console.error('Error fetching requests:', error);
          }
        };

        await fetchRequests();

        // Show success message
        Swal.fire({
          title: "Success!",
          text: "Request accepted successfully! Payment processed.",
          icon: "success",
          confirmButtonText: "Ok",
        });
      } else {
        throw new Error(response.data.Message || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      Swal.fire({
        title: "Error",
        text: "Failed to accept request. Please try again.",
        icon: "error",
        confirmButtonText: "Ok",
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Close payment modal
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedRequest(null);
  };

  // Close view modal
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedRequest(null);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {/* <Amb_Nav ambulancename={ambulance?.fullname} /> */}
      <Container fluid className="p-0">
        <Row className="g-0">
          <Amb_Sidebar ambulance={ambulance} />
          <Col xs={12} lg={9} className="p-3">
            <div className="bg-white rounded p-2">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom py-3">
                <h4 className="mb-0">
                  Ambulance Rides
                </h4>
                <span className="text-muted small">
                  {requests.length} {requests.length === 1 ? 'request' : 'requests'} found
                </span>
              </div>
            </div>
            <div className="px-2">
              <div className='appointments-card mb-3'>
                <div className="appt-tabs d-flex gap-2 mb-3 overflow-x-auto pb-2">
                  <button
                    type="button"
                    className={`appt-tab d-flex align-items-center ${activeTab === "notified" ? "active" : ""
                      }`}
                    onClick={() => setActiveTab("notified")}
                  >
                    <span>Notified</span>{" "}
                    <span className="count">{counts.notified}</span>
                  </button>
                  <button
                    type="button"
                    className={`appt-tab d-flex align-items-center ${activeTab === "accepted" ? "active" : ""
                      }`}
                    onClick={() => setActiveTab("accepted")}
                  >
                    <span>Accepted</span>{" "}
                    <span className="count">{counts.accepted}</span>
                  </button>
                  <button
                    type="button"
                    className={`appt-tab d-flex align-items-center ${activeTab === "completed" ? "active" : ""
                      }`}
                    onClick={() => setActiveTab("completed")}
                  >
                    <span>Completed</span>{" "}
                    <span className="count">{counts.completed}</span>
                  </button>
                  <button
                    type="button"
                    className={`appt-tab d-flex align-items-center ${activeTab === "cancelled" ? "active" : ""
                      }`}
                    onClick={() => setActiveTab("cancelled")}
                  >
                    <span>Cancelled</span>{" "}
                    <span className="count">{counts.cancelled}</span>
                  </button>
                </div>
                <SmartDataTable
                  className="appointments-table"
                  columns={columns}
                  data={filteredData}
                  pagination
                  customStyles={customTableStyles}
                />
              </div>
            </div>
          </Col>
        </Row>

        {/* View Details Modal */}
        <Modal show={isViewModalOpen} onHide={closeViewModal} size="lg">
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

                {/* Patient/Doctor Info */}
                <div className="d-flex align-items-center p-3 border-bottom">
                  <div className="flex-grow-1">
                    <div className="fw-semibold">
                      {selectedRequest.doctorid?.name || selectedRequest.patientid?.name || "N/A"}
                    </div>
                    <div className="text-muted small">
                      {selectedRequest.requestertype === 'doctor' ? 'Doctor' : 'Patient'}
                    </div>
                  </div>
                </div>

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
                        {selectedRequest.pickupaddress || "N/A"}
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
                        {selectedRequest.dropaddress || "N/A"}
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
          <Modal.Footer>
            <Button variant="secondary" onClick={closeViewModal}>
              Close
            </Button>
            {selectedRequest?.status === 'notified' && (
              <Button
                variant="success"
                onClick={() => {
                  closeViewModal();
                  handleAcceptRequest(selectedRequest);
                }}
              >
                <FaAmbulance className="me-2" />
                Accept Request
              </Button>
            )}
          </Modal.Footer>
        </Modal>

        {/* Razorpay Payment Modal */}
        <Modal show={showPaymentModal} onHide={closePaymentModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              <FaCreditCard className="me-2" />
              Process Payment
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedRequest && (
              <div>
                {/* Request Summary */}
                <div className="mb-4 p-3 border rounded">
                  <h6 className="mb-3">Request Details</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="mb-2"><strong>Patient:</strong> {selectedRequest.doctorid?.name || selectedRequest.patientid?.name}</p>
                      <p className="mb-2"><strong>Pickup:</strong> {selectedRequest.pickupaddress}</p>
                    </div>
                    <div className="col-md-6">
                      <p className="mb-2"><strong>Drop:</strong> {selectedRequest.dropaddress}</p>
                      <p className="mb-2"><strong>Total Amount:</strong> <span className="text-muted">₹{selectedRequest.price || 0}</span></p>
                      <p className="mb-2"><strong>Advance Payment (10%):</strong> <span className="text-success">₹{Math.round((selectedRequest.price || 0) * 0.10)}</span></p>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="mb-3">Click below to proceed with Razorpay payment</p>
                  <Button
                    variant="success"
                    size="lg"
                    onClick={handleRazorpayPayment}
                    disabled={paymentProcessing}
                    className="px-4"
                  >
                    {paymentProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCreditCard className="me-2" />
                        Pay with Razorpay ₹{Math.round((selectedRequest.price || 0) * 0.10)}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closePaymentModal} disabled={paymentProcessing}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
}

export default Amb_Request;

// Inline styles for ambulance details card
const styles = `
  .ambulance-details-card {
    background: white;
    border-radius: 8px;
    overflow: hidden;
  }

  .vertical-dashed-line {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 40px;
    background: linear-gradient(to bottom, #10b981 50%, transparent 50%);
    background-size: 2px 8px;
    border-left: 2px dashed #10b981;
  }
`;

// Inject styles into the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}