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
import { API_BASE_URL, GOOGLE_MAPS_API_KEY, SECRET_KEY, STORAGE_KEYS } from "../config";

const P_RideSatus = () => {
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
  const routePolylineRef = React.useRef(null);


  let gmapsPromise = null;
  

  // Add these state variables at the top with other state declarations
  const [pollingDelay, setPollingDelay] = useState(2000); // Initial delay for first poll
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const coordsToLatLng = (coordinates) => {
    if (!coordinates || coordinates.length < 2) return null;
    return { lat: coordinates[1], lng: coordinates[0] }; // [lng, lat] -> {lat,lng}
  };

  const updateAmbulanceOnMap = async (req) => {
    if (!req) return;
    const gmaps = window.google?.maps;
    if (!gmaps) return;

    const pc = req?.pickuplocation?.coordinates;
    const dc = req?.droplocation?.coordinates;
    const ac = req?.acceptedAmbulance?.location?.coordinates;

    const pickup = pc ? coordsToLatLng(pc) : null;
    const drop = dc ? coordsToLatLng(dc) : null;
    const amb = ac ? coordsToLatLng(ac) : null;

    if (!mapRef.current || !pickup || !drop) return;

    // Update ambulance marker
    if (amb) {
      const icon = {
        url: "https://cdn-icons-png.flaticon.com/512/12349/12349613.png",
        scaledSize: new gmaps.Size(36, 36),
        anchor: new gmaps.Point(18, 18),
      };

      if (!ambulanceMarkerRef.current) {
        ambulanceMarkerRef.current = new gmaps.Marker({
          position: amb,
          map: mapRef.current,
          icon,
          title: "Ambulance",
          zIndex: 999,
        });
      } else {
        ambulanceMarkerRef.current.setPosition(amb);
        ambulanceMarkerRef.current.setIcon(icon);
      }
    }

    // Fetch and draw route using OSRM
    if (amb && pickup && drop) {
      try {
        // Get route from OSRM
        const start = { lat: amb.lat, lng: amb.lng };
        const waypoint = { lat: pickup.lat, lng: pickup.lng };
        const end = { lat: drop.lat, lng: drop.lng };

        // Get first leg: Ambulance -> Pickup
        const toPickup = await fetchOsrmRoute(
          new gmaps.LatLng(start.lat, start.lng),
          new gmaps.LatLng(waypoint.lat, waypoint.lng)
        );

        // Get second leg: Pickup -> Drop
        const toDrop = await fetchOsrmRoute(
          new gmaps.LatLng(waypoint.lat, waypoint.lng),
          new gmaps.LatLng(end.lat, end.lng)
        );

        // Combine both legs
        const path = [...toPickup, ...toDrop];

        // Update or create polyline
        if (!routePolylineRef.current) {
          routePolylineRef.current = new gmaps.Polyline({
            path,
            geodesic: true,
            strokeColor: "#1E88E5",
            strokeOpacity: 0.9,
            strokeWeight: 4,
            map: mapRef.current,
          });
        } else {
          routePolylineRef.current.setPath(path);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
        // Fallback to straight line
        const path = [amb, pickup, drop].filter(Boolean);
        if (routePolylineRef.current) {
          routePolylineRef.current.setPath(path);
        }
      }
    }

    // Fit map to show all points
    const bounds = new gmaps.LatLngBounds();
    [amb, pickup, drop].forEach((p) => p && bounds.extend(p));
    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds);
    }
  };

  const fetchOsrmRoute = async (startLatLng, endLatLng) => {
    const start = `${startLatLng.lng()},${startLatLng.lat()}`;
    const end = `${endLatLng.lng()},${endLatLng.lat()}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${encodeURIComponent(
      start
    )};${encodeURIComponent(end)}?overview=full&geometries=geojson`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`OSRM request failed: ${res.status}`);
      const data = await res.json();
      const coords = data?.routes?.[0]?.geometry?.coordinates || [];
      return coords.map(
        ([lng, lat]) => new window.google.maps.LatLng(lat, lng)
      );
    } catch (error) {
      console.error("OSRM Error:", error);
      throw error; // Re-throw to be caught by the caller
    }
  };

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
        const getlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
        const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
        const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

        await axios.post(
          `${API_BASE_URL}/user/ambulancerequests/cancel`,
          { ambulancerequestid: id },
          {
            headers: {
              Authorization: `Bearer ${data.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        localStorage.removeItem("p_amb_req_id");
        Swal.fire(
          "Cancelled!",
          "Your ambulance request has been cancelled.",
          "success"
        );
        navigate("/patient/ambulancerequest");
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
      const getlocaldata =localStorage.getItem(STORAGE_KEYS.PATIENT);
      if (!getlocaldata) {
        navigate("/patient");
        return null;
      }
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

      const res = await axios.post(
        `${API_BASE_URL}/user/ambulancerequests/getone`,
        { ambulancerequestid: id },
        {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const reqData = res?.data?.Data || null;
      if (reqData) {
        // Update polling delay based on status
        if (reqData.status === "notified") {
          setPollingDelay(60000); // 60 seconds for notified status
        } else if (
          reqData.status === "accepted" ||
          reqData.status === "in_progress"
        ) {
          setPollingDelay(20000); // 20 seconds for accepted/in_progress
        } else if (
          reqData.status === "completed" ||
          reqData.status === "cancelled"
        ) {
          localStorage.removeItem("p_amb_req_id");

          setPollingDelay(0); // Stop polling
          setRequest(reqData);
          setIsFirstLoad(false);
          navigate(-1);
        }

        setRequest(reqData);
        setIsFirstLoad(false);
      }
      return reqData;
    } catch (e) {
      console.error("Polling error:", e);
      // On error, retry after 30 seconds
      setPollingDelay(30000);
      return null;
    }
  };

  // Update the polling effect
  useEffect(() => {
    let isMounted = true;
    let pollTimeout;

    const pollStatus = async () => {
      if (!isMounted) return;

      try {
        const data = await fetchRequestStatusLight();
        if (!isMounted) return;

        // Always update the map with new data if available
        if (data) {
          await updateAmbulanceOnMap(data);
        }

        // Handle status changes
        if (data?.status === "completed" || data?.status === "cancelled") {
          localStorage.removeItem("p_amb_req_id");
          // Don't navigate away, just stop polling
          return;
        }

        // Continue polling if needed
        if (isMounted && pollingDelay > 0) {
          pollTimeout = setTimeout(pollStatus, pollingDelay);
        }
      } catch (error) {
        console.error("Polling error:", error);
        if (isMounted) {
          pollTimeout = setTimeout(pollStatus, 30000); // Retry after 30s on error
        }
      }
    };

    // Initial poll
    if (isFirstLoad || pollingDelay > 0) {
      pollStatus();
    }

    // Cleanup
    return () => {
      isMounted = false;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [id, navigate, pollingDelay, isFirstLoad]);

  useEffect(() => {
    if (!request) return;
    const pc = request?.pickuplocation?.coordinates;
    const dc = request?.droplocation?.coordinates;
    if (!pc || !dc) return;

    const pickup = { lat: pc[1], lng: pc[0] };
    const drop = { lat: dc[1], lng: dc[0] };

    const init = async () => {
      if (
        request.status === "accepted" ||
        request.status === "in_progress" ||
        request.status === "completed" ||
        request.status === "notified"
      ) {
        await initMapIfNeeded(pickup, drop);
        // Draw/update ambulance and polyline if accepted/in progress/completed
        if (request.status !== "notified") {
          await updateAmbulanceOnMap(request);
        }
      }
    };

    init();
  }, [request]);

  if (loading && isFirstLoad) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" variant="primary" className="mb-3" />
        <h4 className="text-center">
          {request?.status
            ? `Ambulance is ${request.status.replace("_", " ")}`
            : "Requesting ambulance..."}
        </h4>
        <p className="text-muted">Please wait while we process your request</p>
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
                    {request.pickuplocation?.coordinates
                      ? [...request.pickuplocation.coordinates]
                          .reverse()
                          .join(", ")
                      : ""}
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
                    {request.droplocation?.coordinates
                      ? [...request.droplocation.coordinates]
                          .reverse()
                          .join(", ")
                      : ""}
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
              disabled={["completed", "accepted"].includes(request.status)}
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

export default P_RideSatus;
