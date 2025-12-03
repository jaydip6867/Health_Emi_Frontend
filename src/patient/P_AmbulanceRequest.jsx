import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import P_Sidebar from "./P_Sidebar";
import axios from "axios";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";
import Loader from "../Loader";
import {
  API_BASE_URL,
  SECRET_KEY,
  STORAGE_KEYS,
  GOOGLE_MAPS_API_KEY,
} from "../config";
import {
  FaAmbulance,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaMotorcycle,
  FaCar,
} from "react-icons/fa";
import NavBar from "../Visitor/Component/NavBar";

let gmapsPromise = null;
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
      GOOGLE_MAPS_API_KEY
    )}&libraries=places,marker`;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve(window.google);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return gmapsPromise;
};

const P_AmbulanceRequest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    let data;
    const getlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      data = JSON.parse(decrypted);
    }
    if (!data) {
      navigate("/patient");
    } else {
      setPatient(data.patientData);
      setToken(`Bearer ${data.accessToken}`);
    }
  }, [navigate]);

  const [form, setForm] = useState({
    pickupaddress: "",
    pickup_longitude: "",
    pickup_latitude: "",
    dropaddress: "",
    drop_longitude: "",
    drop_latitude: "",
  });

  const [details, setDetails] = useState({
    name: "",
    mobile: "",
    pickup_house_number: "",
    drop_house_number: "",
    book_for: "myself",
    ambulance_type: "",
    price: "",
    gst_per: 18,
    distance: 0,
  });

  const [platformFee, setPlatformFee] = useState(0);
  const [activeType, setActiveType] = useState("pickup");
  const activeTypeRef = useRef("pickup");
  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropMarkerRef = useRef(null);
  const defaultCenter = [19.076, 72.8777]; // Default to Mumbai
  const autoLocatedRef = useRef(false);
  const [countryCode, setCountryCode] = useState("in");
  const [currentCity, setCurrentCity] = useState("");

  const [suggestions, setSuggestions] = useState({ pickup: [], drop: [] });
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [vehiclePrices, setVehiclePrices] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (patient) {
      setDetails((prev) => ({
        ...prev,
        name: patient.fullname || "",
        mobile: patient.mobilenumber || "",
      }));
    }
  }, [patient]);

  const initMap = async () => {
    try {
      await loadGoogleMaps();
      const { maps } = window.google;

      // Initialize map
      mapRef.current = new maps.Map(document.getElementById("map"), {
        center: { lat: defaultCenter[0], lng: defaultCenter[1] },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
      });

      // Initialize services
      autocompleteService.current = new maps.places.AutocompleteService();
      placesService.current = new maps.places.PlacesService(mapRef.current);

      setMapLoaded(true);
      autoLocateUser();
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  const autoLocateUser = () => {
    if (navigator.geolocation && !autoLocatedRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapRef.current.setCenter(pos);
          mapRef.current.setZoom(15);
          autoLocatedRef.current = true;
          reverseGeocode(pos);
        },
        () => {
          // If geolocation fails, use default location
          const pos = { lat: defaultCenter[0], lng: defaultCenter[1] };
          mapRef.current.setCenter(pos);
          reverseGeocode(pos);
        }
      );
    }
  };

  const reverseGeocode = (location) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address;
        const cityComp = results[0].address_components.find((comp) =>
          comp.types.includes("locality")
        );
        if (cityComp) {
          setCurrentCity(cityComp.long_name);
        }

        if (activeTypeRef.current === "pickup") {
          setForm((prev) => ({
            ...prev,
            pickupaddress: address,
            pickup_latitude: location.lat,
            pickup_longitude: location.lng,
          }));
        } else {
          setForm((prev) => ({
            ...prev,
            dropaddress: address,
            drop_latitude: location.lat,
            drop_longitude: location.lng,
          }));
        }
      }
    });
  };

  const handlePlaceSelect = (place, type) => {
    if (!place.geometry) {
      console.error("No geometry found for place:", place);
      return;
    }

    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    // Update form with selected place
    if (type === "pickup") {
      setForm((prev) => ({
        ...prev,
        pickupaddress: place.formatted_address || place.name,
        pickup_latitude: location.lat,
        pickup_longitude: location.lng,
      }));

      // Update map marker
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setPosition(location);
      } else {
        pickupMarkerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapRef.current,
          title: "Pickup Location",
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
          },
        });
      }
    } else {
      setForm((prev) => ({
        ...prev,
        dropaddress: place.formatted_address || place.name,
        drop_latitude: location.lat,
        drop_longitude: location.lng,
      }));

      // Update map marker
      if (dropMarkerRef.current) {
        dropMarkerRef.current.setPosition(location);
      } else {
        dropMarkerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapRef.current,
          title: "Drop Location",
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          },
        });
      }
    }

    // Center map on the selected location
    mapRef.current.setCenter(location);
    mapRef.current.setZoom(15);

    // If both locations are set, calculate distance and price
    if (form.pickup_latitude && form.drop_latitude) {
      calculateDistanceAndPrice();
    }
  };

  const handleAddressChange = (e, type) => {
    const value = e.target.value;

    if (type === "pickup") {
      setForm((prev) => ({ ...prev, pickupaddress: value }));
    } else {
      setForm((prev) => ({ ...prev, dropaddress: value }));
    }

    if (value.length > 2) {
      getPlacePredictions(value, type);
    } else {
      setSuggestions((prev) => ({ ...prev, [type]: [] }));
    }
  };

  const getPlacePredictions = (input, type) => {
    if (!autocompleteService.current) return;

    autocompleteService.current.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: countryCode },
        types: ["address"],
      },
      (predictions, status) => {
        if (status === "OK") {
          setSuggestions((prev) => ({
            ...prev,
            [type]: predictions.slice(0, 5),
          }));
        }
      }
    );
  };

  const calculateDistanceAndPrice = () => {
    if (!form.pickup_latitude || !form.drop_latitude) return;

    const service = new window.google.maps.DistanceMatrixService();
    const origin = new window.google.maps.LatLng(
      form.pickup_latitude,
      form.pickup_longitude
    );
    const destination = new window.google.maps.LatLng(
      form.drop_latitude,
      form.drop_longitude
    );

    setIsCalculating(true);

    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: "DRIVING",
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        setIsCalculating(false);

        if (status === "OK") {
          const distance = response.rows[0].elements[0].distance.value / 1000; // Convert to km
          setDetails((prev) => ({
            ...prev,
            distance: parseFloat(distance.toFixed(2)),
          }));
          calculatePrice(distance);
        }
      }
    );
  };

  const calculatePrice = (distance) => {
    // Base prices and per km rates
    const prices = {
      Ambulance: { base: 500, perKm: 20 },
      Bike: { base: 50, perKm: 10 },
      Rickshaw: { base: 100, perKm: 15 },
      Cab: { base: 200, perKm: 18 },
    };

    const calculatedPrices = {};
    Object.entries(prices).forEach(([type, { base, perKm }]) => {
      calculatedPrices[type] = Math.round(base + distance * perKm);
    });

    setVehiclePrices(calculatedPrices);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.pickup_latitude || !form.drop_latitude) {
      Swal.fire(
        "Error",
        "Please select both pickup and drop locations",
        "error"
      );
      setLoading(false);
      return;
    }

    if (!details.ambulance_type) {
      Swal.fire("Error", "Please select an ambulance type", "error");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/patient/ambulancerequest/create`,
        {
          ...form,
          ...details,
          price: vehiclePrices[details.ambulance_type],
          gst_amount: (vehiclePrices[details.ambulance_type] * 0.18).toFixed(2),
          total_amount: (vehiclePrices[details.ambulance_type] * 1.18).toFixed(
            2
          ),
          patient_id: patient?.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );

      if (response.data.IsSuccess) {
        Swal.fire(
          "Success!",
          "Ambulance request submitted successfully!",
          "success"
        ).then(() => {
          navigate("/patient/ambulancerequests");
        });
      } else {
        throw new Error(response.data.Message || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      Swal.fire(
        "Error",
        error.response?.data?.Message || "Failed to submit request",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initMap();
    return () => {
      if (mapRef.current) {
        // Cleanup map instance
        const mapElement = document.getElementById("map");
        if (mapElement) {
          mapElement.innerHTML = "";
        }
      }
    };
  }, []);

  const hasBothLocations = form.pickup_latitude && form.drop_latitude;
  const canSubmit = hasBothLocations && details.ambulance_type;

  return (
    <div className="bg-light min-vh-100">
      <NavBar logindata={patient} />
      <Container>
        <Row className="align-items-start">
          <P_Sidebar patient={patient} />
          <Col xs={12} md={9} className="p-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom py-3">
              <h4 className="mb-0">Book Ambulance</h4>
            </div>

            <Row>
              <Col lg={6} className="mb-4">
                <Card className="h-100">
                  <Card.Body className="p-0" style={{ height: "500px" }}>
                    <div id="map" style={{ width: "100%", height: "100%" }} />
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={6}>
                <Card>
                  <Card.Body>
                    <Form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <Form.Label className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-2 text-danger" />
                          Pickup Location
                        </Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type="text"
                            placeholder="Enter pickup location"
                            value={form.pickupaddress}
                            onChange={(e) => {
                              handleAddressChange(e, "pickup");
                              activeTypeRef.current = "pickup";
                            }}
                            onFocus={() => (activeTypeRef.current = "pickup")}
                            required
                          />
                          {suggestions.pickup.length > 0 && (
                            <div className="suggestions-dropdown">
                              {suggestions.pickup.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="suggestion-item"
                                  onClick={() => {
                                    const place = {
                                      geometry: {
                                        location: {
                                          lat: () => 0, // These will be updated in handlePlaceSelect
                                          lng: () => 0,
                                        },
                                      },
                                      formatted_address: suggestion.description,
                                      name: suggestion.structured_formatting
                                        .main_text,
                                    };
                                    handlePlaceSelect(place, "pickup");
                                    setSuggestions((prev) => ({
                                      ...prev,
                                      pickup: [],
                                    }));
                                  }}
                                >
                                  {suggestion.description}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Form.Control
                          type="hidden"
                          name="pickup_latitude"
                          value={form.pickup_latitude}
                        />
                        <Form.Control
                          type="hidden"
                          name="pickup_longitude"
                          value={form.pickup_longitude}
                        />
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="mt-2"
                          type="button"
                          onClick={() => {
                            activeTypeRef.current = "pickup";
                            autoLocateUser();
                          }}
                        >
                          <FaLocationArrow className="me-1" /> Use Current
                          Location
                        </Button>
                      </div>

                      <div className="mb-3">
                        <Form.Label className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-2 text-success" />
                          Drop Location
                        </Form.Label>
                        <div className="position-relative">
                          <Form.Control
                            type="text"
                            placeholder="Enter drop location"
                            value={form.dropaddress}
                            onChange={(e) => {
                              handleAddressChange(e, "drop");
                              activeTypeRef.current = "drop";
                            }}
                            onFocus={() => (activeTypeRef.current = "drop")}
                            required
                          />
                          {suggestions.drop.length > 0 && (
                            <div className="suggestions-dropdown">
                              {suggestions.drop.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="suggestion-item"
                                  onClick={() => {
                                    const place = {
                                      geometry: {
                                        location: {
                                          lat: () => 0,
                                          lng: () => 0,
                                        },
                                      },
                                      formatted_address: suggestion.description,
                                      name: suggestion.structured_formatting
                                        .main_text,
                                    };
                                    handlePlaceSelect(place, "drop");
                                    setSuggestions((prev) => ({
                                      ...prev,
                                      drop: [],
                                    }));
                                  }}
                                >
                                  {suggestion.description}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Form.Control
                          type="hidden"
                          name="drop_latitude"
                          value={form.drop_latitude}
                        />
                        <Form.Control
                          type="hidden"
                          name="drop_longitude"
                          value={form.drop_longitude}
                        />
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="mt-2"
                          type="button"
                          onClick={() => {
                            activeTypeRef.current = "drop";
                            autoLocateUser();
                          }}
                        >
                          <FaLocationArrow className="me-1" /> Use Current
                          Location
                        </Button>
                      </div>

                      {hasBothLocations && (
                        <div className="mb-3">
                          <Form.Label>Passenger Details</Form.Label>
                          <Row>
                            <Col md={6} className="mb-2">
                              <Form.Control
                                placeholder="Full Name"
                                value={details.name}
                                onChange={(e) =>
                                  setDetails({
                                    ...details,
                                    name: e.target.value,
                                  })
                                }
                                required
                              />
                            </Col>
                            <Col md={6} className="mb-2">
                              <Form.Control
                                placeholder="Mobile Number"
                                value={details.mobile}
                                onChange={(e) =>
                                  setDetails({
                                    ...details,
                                    mobile: e.target.value,
                                  })
                                }
                                required
                              />
                            </Col>
                            <Col md={6} className="mb-2">
                              <Form.Control
                                placeholder="Pickup House No."
                                value={details.pickup_house_number}
                                onChange={(e) =>
                                  setDetails({
                                    ...details,
                                    pickup_house_number: e.target.value,
                                  })
                                }
                                required
                              />
                            </Col>
                            <Col md={6} className="mb-2">
                              <Form.Control
                                placeholder="Drop House No."
                                value={details.drop_house_number}
                                onChange={(e) =>
                                  setDetails({
                                    ...details,
                                    drop_house_number: e.target.value,
                                  })
                                }
                                required
                              />
                            </Col>
                            <Col md={12} className="mb-2">
                              <Form.Label>Book For</Form.Label>
                              <div>
                                <Form.Check
                                  inline
                                  type="radio"
                                  label="Myself"
                                  name="book_for"
                                  checked={details.book_for === "myself"}
                                  onChange={() =>
                                    setDetails({
                                      ...details,
                                      book_for: "myself",
                                    })
                                  }
                                />
                                <Form.Check
                                  inline
                                  type="radio"
                                  label="Someone Else"
                                  name="book_for"
                                  checked={details.book_for === "other"}
                                  onChange={() =>
                                    setDetails({
                                      ...details,
                                      book_for: "other",
                                    })
                                  }
                                />
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}

                      {hasBothLocations && (
                        <div className="mb-3">
                          <Form.Label>Select Vehicle Type</Form.Label>
                          <div className="vehicle-options">
                            {[
                              {
                                type: "Ambulance",
                                icon: <FaAmbulance className="me-2" />,
                                description: "Medical emergency transport",
                              },
                              {
                                type: "Bike",
                                icon: <FaMotorcycle className="me-2" />,
                                description: "Fastest option in traffic",
                              },
                              {
                                type: "Rickshaw",
                                icon: <FaCar className="me-2" />,
                                description: "Budget-friendly auto",
                              },
                              {
                                type: "Cab",
                                icon: <FaCar className="me-2" />,
                                description: "Comfortable ride",
                              },
                            ].map((vehicle) => (
                              <div
                                key={vehicle.type}
                                className={`vehicle-option ${
                                  details.ambulance_type === vehicle.type
                                    ? "active"
                                    : ""
                                }`}
                                onClick={() =>
                                  setDetails({
                                    ...details,
                                    ambulance_type: vehicle.type,
                                  })
                                }
                              >
                                <div className="d-flex align-items-center">
                                  {vehicle.icon}
                                  <div>
                                    <div className="fw-bold">
                                      {vehicle.type}
                                    </div>
                                    <div className="small text-muted">
                                      {vehicle.description}
                                    </div>
                                  </div>
                                </div>
                                {vehiclePrices && (
                                  <div className="price">
                                    ₹{vehiclePrices[vehicle.type]}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {details.ambulance_type && vehiclePrices && (
                        <div className="price-summary mb-3 p-3 bg-light rounded">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Base Fare:</span>
                            <span>
                              ₹{vehiclePrices[details.ambulance_type]}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>GST (18%):</span>
                            <span>
                              ₹
                              {(
                                vehiclePrices[details.ambulance_type] * 0.18
                              ).toFixed(2)}
                            </span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between fw-bold">
                            <span>Total:</span>
                            <span>
                              ₹
                              {(
                                vehiclePrices[details.ambulance_type] * 1.18
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-100"
                        disabled={!canSubmit || loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Processing...
                          </>
                        ) : (
                          "Book Ambulance"
                        )}
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
      <style jsx>{`
        .suggestions-dropdown {
          position: absolute;
          z-index: 1000;
          width: 100%;
          max-height: 200px;
          overflow-y: auto;
          background: white;
          border: 1px solid #ced4da;
          border-radius: 0.25rem;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
        .suggestion-item {
          padding: 0.5rem 1rem;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
        }
        .suggestion-item:hover {
          background-color: #f8f9fa;
        }
        .vehicle-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .vehicle-option {
          padding: 1rem;
          border: 1px solid #dee2e6;
          border-radius: 0.5rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s;
        }
        .vehicle-option:hover {
          border-color: #0d6efd;
          background-color: #f8f9fa;
        }
        .vehicle-option.active {
          border-color: #0d6efd;
          background-color: #e7f1ff;
        }
        .price-summary {
          border: 1px solid #dee2e6;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default P_AmbulanceRequest;
