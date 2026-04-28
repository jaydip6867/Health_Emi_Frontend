import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Form, InputGroup, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaAmbulance, FaMapMarkerAlt, FaUserMd, FaInfoCircle, FaSearch, FaCreditCard } from 'react-icons/fa';
import { 
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import moment from 'moment';
import Amb_Nav from './Amb_Nav';
import Amb_Sidebar from './Amb_Sidebar';
import '../../src/amb_request.css';
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';


const Amb_Request = () => {
  const [ambulance, setambulance] = useState(null)
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  // Razorpay payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        header: '#',
        accessorKey: '_id',
        cell: ({ row }) => row.index + 1,
        size: 50,
      },
      {
        header: 'Request Details',
        accessorFn: (row) => ({
          name: row.doctorid?.name ||row.patientid?.name ,
          type: row.requestertype,
        }),
        cell: ({ getValue }) => {
          const { name, type } = getValue();
          return (
            <div className="d-flex align-items-center">
             
              <div>
                <div className="fw-medium">{name}</div>
                <div className="small text-muted">
                  <FaUserMd className="me-1" style={{ minWidth: '16px', minHeight: '16px' }} />
                  {type === 'doctor' ? 'Doctor' : 'Patient'}
                </div>
              </div>
            </div>
          );
        },
      },
     {
        header: 'Pickup',
        accessorKey: 'pickupaddress',
        cell: ({ getValue }) => (
          <div className="d-flex align-items-start">
            <FaMapMarkerAlt className="text-danger mt-1 me-2" />
            <div>
              <div className="fw-medium">Pickup</div>
              <small className="text-muted" style={{ maxWidth: '200px', display: 'inline-block' }}>
                {getValue().split(',').slice(0, 2).join(',')}
              </small>
            </div>
          </div>
        ),
      },
      {
        header: 'Drop',
        accessorKey: 'dropaddress',
        cell: ({ getValue }) => (
          <div className="d-flex align-items-start">
            <FaMapMarkerAlt className="text-success mt-1 me-2" />
            <div>
              <div className="fw-medium">Drop</div>
              <small className="text-muted" style={{ maxWidth: '200px', display: 'inline-block' }}>
                {getValue().split(',').slice(0, 2).join(',')}
              </small>
            </div>
          </div>
        ),
      } ,
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => {
          const status = getValue();
          switch (status) {
            case 'notified': return <Badge bg="warning" className="text-dark">Pending</Badge>;
            case 'accepted': return <Badge bg="success">Accepted</Badge>;
            case 'completed': return <Badge bg="info">Completed</Badge>;
            case 'cancelled': return <Badge bg="danger">Rejected</Badge>;
            default: return <Badge bg="secondary">{status}</Badge>;
          }
        },
      },
      {
        header: 'Requested',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => (
          <span className="small text-muted">
            {moment(getValue()).format('DD MMM YYYY, hh:mm A')}
          </span>
        ),
      },
      {
        header: 'Actions',
        accessorKey: '_id',
        cell: ({ row, getValue }) => {
          const request = row.original;
          return (
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                className="d-flex align-items-center"
                onClick={() => navigate(`/ambulance/rides/${getValue()}`)}
              >
                <FaInfoCircle className="me-1" /> Ride Details
              </Button>
              {request.status === 'notified' && (
                <Button
                  variant="success"
                  size="sm"
                  className="d-flex align-items-center"
                  onClick={() => handleAcceptRequest(request)}
                >
                  <FaAmbulance className="me-1" /> Accept
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  // React Table instance
  const table = useReactTable({
    columns,
    data: requests,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: searchText,
    },
    onGlobalFilterChange: setSearchText,
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

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
        
        setRequests(response.data.Data || []);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [navigate]);



  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value || '';
    setSearchText(value);
  };

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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="p-0 panel">
      <Row className="g-0">
        <Amb_Sidebar ambulance={ambulance} />
        <Col xs={12} sm={9} lg={10} className="p-3">
          <Amb_Nav ambulancename={ambulance?.fullname} />
          <Card className="shadow-sm">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaAmbulance className="me-2 text-primary" />
                Ambulance Requests
              </h5>
              <span className="text-muted small">
                {requests.length} {requests.length === 1 ? 'request' : 'requests'} found
              </span>
            </Card.Header>
            <Card.Body>
              {/* Search Box */}
              <div className="mb-3">
                <InputGroup style={{ maxWidth: '300px' }}>
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search requests..."
                    value={searchText}
                    onChange={handleSearch}
                  />
                </InputGroup>
              </div>

              {/* Table */}
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    {table.getHeaderGroups().map((headerGroup ,index)  => (
                      
                      <tr key={index}>
                        {headerGroup.headers.map((header,index) => (
                          <th 
                            key={index} 
                            onClick={header.column.getToggleSortingHandler()}
                            style={{ 
                              cursor: header.column.getCanSort() ? 'pointer' : 'default',
                              width: header.column.getSize()
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽',
                            }[header.column.getIsSorted()] ?? null}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row,index) => (
                      <tr key={index} className="align-middle">
                        {row.getVisibleCells().map((cell,index) => (
                          <td key={index}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {table.getRowModel().rows.length === 0 && (
                      <tr>
                        <td colSpan={columns.length} className="text-center py-5">
                          <div className="text-muted">
                            <FaAmbulance size={32} className="mb-3" />
                            <h5>No ambulance requests found</h5>
                            <p className="mb-0">Try adjusting your search or check back later</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {requests.length > 0 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div className="d-flex align-items-center">
                    <span className="me-2">Show:</span>
                    <Form.Select
                      value={table.getState().pagination.pageSize}
                      onChange={e => table.setPageSize(Number(e.target.value))}
                      style={{ width: 'auto' }}
                      size="sm"
                    >
                      {[5, 10, 20, 30, 40, 50].map(size => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </Form.Select>
                    <span className="ms-2">entries</span>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => table.setPageIndex(0)}
                      disabled={!table.getCanPreviousPage()}
                      className="me-2"
                    >
                      {'<<'}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="me-2"
                    >
                      Previous
                    </Button>
                    <span className="mx-2">
                      Page{' '}
                      <strong>
                        {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                      </strong>
                    </span>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="me-2"
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                      disabled={!table.getCanNextPage()}
                    >
                      {'>>'}
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
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
  );
};

export default Amb_Request;