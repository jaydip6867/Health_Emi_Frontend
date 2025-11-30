import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Container,
  Row,
  Col,
  Spinner,
  Badge,
} from "react-bootstrap";
import {
  FaAmbulance,
  FaMapMarkerAlt,
  FaPhone,
  FaTimes,
  FaUser,
  FaCar,
} from "react-icons/fa";
import axios from "axios";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
import { API_BASE_URL, SECRET_KEY } from "../config";

const D_StatusAmbulance = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const mapElRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const pickupMarkerRef = React.useRef(null);
  const dropMarkerRef = React.useRef(null);
  const ambulanceMarkerRef = React.useRef(null);
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);

  let gmapsPromise = null;
  const GOOGLE_MAPS_API_KEY = "AIzaSyBoGhF4LGSyzplqWd4qJXmELcDrbZIIQDA"; // or from your config
  const fifteenSecRef = React.useRef(null);
  const twoMinRef = React.useRef(null);
  const loadGoogleMaps = () => {
    if (window.google && window.google.maps)
      return Promise.resolve(window.google);
    if (gmapsPromise) return gmapsPromise;
    gmapsPromise = new Promise((resolve, reject) => {
      const id = "gmaps-loader";
      const existing = document.getElementById(id);
      if (existing) {
        existing.addEventListener("load", () => resolve(window.google));
        existing.addEventListener("error", reject);
        return;
      }
      const s = document.createElement("script");
      s.id = id;
      s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
        GOOGLE_MAPS_API_KEY || ""
      )}&libraries=places,marker,geometry`;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve(window.google);
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return gmapsPromise;
  };

  const initMapIfNeeded = async (pickup, drop) => {
    if (!pickup || !drop) return;
    await loadGoogleMaps();
    const gmaps = window.google.maps;
    if (!mapRef.current) {
      mapRef.current = new gmaps.Map(mapElRef.current, {
        center: pickup,
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
    }
    // Create or update pickup marker
    if (!pickupMarkerRef.current) {
      pickupMarkerRef.current = new gmaps.Marker({
        position: pickup,
        map: mapRef.current,
        label: { text: "Pickup", color: "#fff" },
      });
    } else {
      pickupMarkerRef.current.setPosition(pickup);
    }

    // Create or update drop marker
    if (!dropMarkerRef.current) {
      dropMarkerRef.current = new gmaps.Marker({
        position: drop,
        map: mapRef.current,
        label: { text: "Drop", color: "#fff" },
      });
    } else {
      dropMarkerRef.current.setPosition(drop);
    }

    // Fit bounds to pickup + drop
    const bounds = new gmaps.LatLngBounds();
    bounds.extend(pickup);
    bounds.extend(drop);
    mapRef.current.fitBounds(bounds);
  };

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const getlocaldata = localStorage.getItem("healthdoctor");
      if (!getlocaldata) {
        navigate("/doctor");
        return;
      }

      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      const response = await axios.post(
        `${API_BASE_URL}/doctor/ambulancerequests/getone`,
        { ambulancerequestid: id },
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.Data) {
        setRequest(response.data.Data);
      } else {
        throw new Error("No data received");
      }
    } catch (error) {
      console.error("Error fetching request details:", error);
      setError(
        error.response?.data?.message || "Failed to load request details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You want to cancel this ambulance request?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, cancel it!",
      });

      if (result.isConfirmed) {
        const getlocaldata = localStorage.getItem("healthdoctor");
        const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
        const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        await axios.post(
          `${API_BASE_URL}/doctor/ambulancerequests/cancel`,
          { ambulancerequestid: id },
          {
            headers: {
              Authorization: `Bearer ${data.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        Swal.fire(
          "Cancelled!",
          "Your ambulance request has been cancelled.",
          "success"
        );
        navigate("/doctor/ambulance-request");
      }
    } catch (error) {
      console.error("Error cancelling request:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to cancel request",
        "error"
      );
    }
  };

  const fetchRequestStatusLight = async () => {
    try {
      const getlocaldata = localStorage.getItem("healthdoctor");
      if (!getlocaldata) {
        navigate("/doctor");
        return null;
      }
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      const res = await axios.post(
        `${API_BASE_URL}/doctor/ambulancerequests/getone`,
        { ambulancerequestid: id },
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const reqData = res?.data?.Data || null;
      if (reqData) setRequest(reqData); // keep UI in sync
      return reqData;
    } catch (e) {
      console.error("Polling error:", e);
      return null;
    }
  };

 useEffect(() => {
  // Initial full load
  fetchRequestDetails();

  // Start 15s polling
  const poll15s = async () => {
    const data = await fetchRequestStatusLight();
    if (data?.status === "accepted") {
      // Switch to phase 2
      if (fifteenSecRef.current) clearInterval(fifteenSecRef.current);

      // Start 2-minute polling immediately and then on interval
      const startTwoMinPhase = async () => {
        const d = await fetchRequestStatusLight();
        if (d?.status === "completed") {
          try {
            localStorage.removeItem("amb_req_id");
          } catch (_) {}
          // back to page (or navigate to listing)
          navigate(-1); // or navigate("/doctor/ambulance-request");
          return;
        }
      };

      // Run once immediately
      startTwoMinPhase();
      // And then every 2 minutes
      twoMinRef.current = setInterval(startTwoMinPhase, 120000);
    }
  };

  // Fire immediately once, then every 15s
  poll15s();
  fifteenSecRef.current = setInterval(poll15s, 15000);

  return () => {
    if (fifteenSecRef.current) clearInterval(fifteenSecRef.current);
    if (twoMinRef.current) clearInterval(twoMinRef.current);
  };
}, [id, navigate]);

  useEffect(() => {
    if (!request) return;
    const pc = request?.pickuplocation?.coordinates;
    const dc = request?.droplocation?.coordinates;
    if (!pc || !dc) return;

    const pickup = { lat: pc[1], lng: pc[0] };
    const drop = { lat: dc[1], lng: dc[0] };

    // If you want to delay until accepted + 20s, gate with status and setTimeout
    if (
      request.status === "accepted" ||
      request.status === "in_progress" ||
      request.status === "completed"
    ) {
      initMapIfNeeded(pickup, drop);
    }
  }, [request]);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-3">{error}</div>;
  }

  if (!request) {
    return (
      <div className="alert alert-info m-3">
        No request found with the provided ID.
      </div>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Ambulance Request Status</h2>

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Request Ambulance</h5>
          <Badge
            bg={
              request.status === "completed"
                ? "success"
                : request.status === "cancelled"
                ? "danger"
                : request.status === "accepted"
                ? "primary"
                : "warning"
            }
            className="text-capitalize"
          >
            {request.status}
          </Badge>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} className="mb-4">
              <div className="d-flex align-items-start mb-3">
                <FaMapMarkerAlt className="text-danger mt-1 me-2" size={20} />
                <div>
                  <h6>Pickup Location</h6>
                  <p className="mb-1">{request.pickupaddress}</p>
                  <small className="text-muted">
                    {request.pickuplocation?.coordinates?.reverse().join(", ")}
                  </small>
                </div>
              </div>
            </Col>

            <Col md={6} className="mb-4">
              <div className="d-flex align-items-start">
                <FaMapMarkerAlt className="text-success mt-1 me-2" size={20} />
                <div>
                  <h6>Drop Location</h6>
                  <p className="mb-1">{request.dropaddress}</p>
                  <small className="text-muted">
                    {request.droplocation?.coordinates?.reverse().join(", ")}
                  </small>
                </div>
              </div>
            </Col>
          </Row>
          <div
            className="mt-3"
            style={{
              width: "100%",
              height: 400,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <div ref={mapElRef} style={{ width: "100%", height: "100%" }} />
          </div>
          <div className="mb-3">
            <h6>Near by ambulance</h6>
            <div className="d-flex align-items-center">
              <FaAmbulance className="me-2" />
              <span className="me-3">
                {request.status === "notified" &&
                  `Notified ${
                    request.notifiedAmbulances?.length || 0
                  } ambulances`}
                {request.status === "accepted" && `Ambulance is on the way`}
                {request.status === "completed" && `Ride completed`}
                {request.status === "cancelled" && `Request cancelled`}
              </span>
            </div>
          </div>

          {request.status === "accepted" && request.acceptedAmbulance && (
            <Card className="mb-4">
              <Card.Header>
                <h6>Assigned Ambulance Details</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4} className="mb-3">
                    <div className="d-flex align-items-center">
                      <FaUser className="me-2" />
                      <div>
                        <div className="text-muted small">Driver Name</div>
                        <div>{request.acceptedAmbulance.fullname}</div>
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="d-flex align-items-center">
                      <FaAmbulance className="me-2" />
                      <div>
                        <div className="text-muted small">Ambulance Type</div>
                        <div>{request.acceptedAmbulance.ambulance_type}</div>
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="d-flex align-items-center">
                      <FaPhone className="me-2" />
                      <div>
                        <div className="text-muted small">Contact Number</div>
                        <a
                          href={`tel:${request.acceptedAmbulance.mobile}`}
                          className="text-decoration-none"
                        >
                          {request.acceptedAmbulance.mobile}
                        </a>
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="d-flex align-items-center">
                      <FaCar className="me-2" />
                      <div>
                        <div className="text-muted small">Vehicle Number</div>
                        <div>{request.acceptedAmbulance.vehicle_no}</div>
                      </div>
                    </div>
                  </Col>
                  <Col md={8} className="mb-3">
                    <div className="d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2" />
                      <div>
                        <div className="text-muted small">Current Location</div>
                        <div>
                          {request.acceptedAmbulance.address},{" "}
                          {request.acceptedAmbulance.city},{" "}
                          {request.acceptedAmbulance.state}
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          <div className="mt-4">
            <Button
              variant="outline-danger"
              onClick={handleCancelRequest}
              disabled={["completed", "cancelled"].includes(request.status)}
            >
              <FaTimes className="me-2" />
              Cancel Request
            </Button>
          </div>
        </Card.Body>
        <Card.Footer className="text-muted">
          <small>
            Requested on: {new Date(request.createdAt).toLocaleString()}
            {request.updatedAt !== request.createdAt &&
              ` • Last updated: ${new Date(
                request.updatedAt
              ).toLocaleString()}`}
          </small>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default D_StatusAmbulance;
