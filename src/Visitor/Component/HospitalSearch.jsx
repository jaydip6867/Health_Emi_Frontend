import { City, Country, State } from "country-state-city";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { FiMapPin, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import Loader from "../../Loader";
import { API_BASE_URL } from "../../config";
import { toast, ToastContainer } from "react-toastify";

const HospitalSearch = ({ hospitalList, setHospitalList }) => {
  const [loading, setloading] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const locationCalledRef = useRef(false); // 🔒 prevent multiple calls

  const [recordlist, setreclist] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [showList, setShowList] = useState(false);

  const selectedStateName =
    states.find((st) => st.isoCode === selectedState)?.name || "";

  // -------------------- LOAD CITIES --------------------
  const loadCitiesForState = (stateIso) => {
    const india = Country.getCountryByCode("IN");
    const cityList = City.getCitiesOfState(india.isoCode, stateIso) || [];
    setCities(cityList);
    return cityList;
  };

  // -------------------- LOCATION DETECTION --------------------
  const detectUserLocation = async () => {
    if (!navigator.geolocation || states.length === 0) return;

    setLocationLoading(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
      );
      const data = await response.json();
      if (!data?.address) return;

      const { state, city, town, village, state_district } = data.address;
      const detectedCity = city || town || village || state_district;

      const matchedState = states.find(
        (st) => st.name.toLowerCase() === state?.toLowerCase()
      );
      if (!matchedState) return;

      setSelectedState(matchedState.isoCode);

      const cityList = loadCitiesForState(matchedState.isoCode);
      if (!cityList.length || !detectedCity) {
        setSelectedCity(cityList?.[0]?.name || "");
        return;
      }

      const normalizedDetectedCity = detectedCity
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

      const matchedCity =
        cityList.find((c) => c.name.toLowerCase() === normalizedDetectedCity) ||
        cityList.find((c) =>
          new RegExp(`\\b${normalizedDetectedCity}\\b`).test(
            c.name.toLowerCase()
          )
        ) ||
        null;

      setSelectedCity(matchedCity?.name || cityList[0].name);
    } catch (error) {
      console.error("Location error:", error);
      if (!locationErrorToastShownRef.current) {
        locationErrorToastShownRef.current = true;
        toast.error(
          "Unable to get your current location. Also allow Location permission / turn on GPS in your device.",
          { autoClose: 6000 }
        );
      }
    } finally {
      setLocationLoading(false);
    }
  };

  // -------------------- LOAD STATES ONCE --------------------
  useEffect(() => {
    document.title = "Health Easy EMI - Keep Life Healthy";
    const india = Country.getCountryByCode("IN");
    setStates(State.getStatesOfCountry(india.isoCode));
  }, []);

  // -------------------- AUTO LOCATION (ONCE) --------------------
  useEffect(() => {
    if (states.length > 0 && !locationCalledRef.current) {
      locationCalledRef.current = true;

      detectUserLocation();
    }
  }, [states]);

  // -------------------- UPDATE CITIES --------------------
  useEffect(() => {
    if (selectedState) {
      loadCitiesForState(selectedState);
    }
  }, [selectedState]);

  // -------------------- SUGGESTIONS --------------------
  useEffect(() => {
    if (!inputValue.trim()) {
      setFilteredHospitals([]);
      return;
    }
    const searchTerm = inputValue.toLowerCase();
    const filtered = hospitalList.filter(
      (hospital) =>
        hospital.name.toLowerCase().includes(searchTerm) ||
        (hospital.city && hospital.city.toLowerCase().includes(searchTerm)) ||
        (hospital.state && hospital.state.toLowerCase().includes(searchTerm))
    );

    setFilteredHospitals(filtered);
  }, [inputValue, hospitalList]);

  const locationErrorToastShownRef = useRef(false);
  // -------------------- UI (UNCHANGED) --------------------
  return (
    <>
      <ToastContainer />
      <Container>
        <Row
          className="justify-content-center position-relative"
          style={{ zIndex: 100 }}
        >
          <Col xs={12} md={10} lg={8}>
            <div className="px-2 py-1">
              <div className="d-md-flex searchbox align-items-center position-relative">
                {/* State */}
                <div className="d-flex align-items-center position-relative selectsize">
                  <FiMapPin
                    className="position-absolute"
                    style={{ left: 12 }}
                  />
                  <Form.Select
                    className="ps-5 pe-1 py-2 bg-transparent border-0"
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedCity("");
                    }}
                    onFocus={() => setShowList(false)}
                  >
                    <option value="">
                      {locationLoading
                        ? "Detecting location..."
                        : "Choose State"}
                    </option>
                    {states.map((st) => (
                      <option key={st.isoCode} value={st.isoCode}>
                        {st.name}
                      </option>
                    ))}
                  </Form.Select>
                </div>

                <div className="d-flex g-0 align-items-center">
                  <div className="mx-md-2 line_search_bar"></div>

                  {/* City */}
                  <div className="d-flex align-items-center w-100 position-relative selectsize">
                    <FiMapPin
                      className="position-absolute"
                      style={{ left: 12 }}
                    />
                    <Form.Select
                      className="ps-5 pe-1 py-2 bg-transparent border-0"
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                      }}
                      onFocus={() => setShowList(false)}
                      disabled={!selectedState}
                    >
                      <option value="">Choose City</option>
                      {cities.map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                  <div className="mx-md-2 line_search_bar"></div>
                </div>

                {/* Search */}
                <div className="flex-grow-1">
                  <div className="position-relative">
                    <FiSearch
                      className="position-absolute"
                      style={{ left: 12, top: 12 }}
                    />
                    <Form.Control
                      placeholder="Search Hospital"
                      autoComplete="off"
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        setShowList(e.target.value.length > 0);
                      }}
                      onFocus={() => inputValue.length > 0 && setShowList(true)}
                      onBlur={() => setTimeout(() => setShowList(false), 200)}
                      className="bg-transparent ps-5 py-2 border-0"
                    />
                  </div>
                  {showList && filteredHospitals.length === 0 && inputValue && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "100%",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "10px",
                        zIndex: 1000,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      }}
                      className="text-muted small"
                    >
                      No hospitals found matching "{inputValue}"
                    </div>
                  )}
                  {showList && filteredHospitals.length > 0 && (
                    <ul
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "100%",
                        border: "1px solid #e5e7eb",
                        backgroundColor: "white",
                        listStyle: "none",
                        padding: "6px",
                        margin: 0,
                        maxHeight: "350px",
                        overflowY: "auto",
                        zIndex: 1000,
                        borderRadius: "14px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      }}
                      className="suggestion-box"
                    >
                      {filteredHospitals.map((hospital, index) => (
                        <li
                          key={hospital.id || index}
                          style={{
                            padding: "10px 8px",
                            cursor: "pointer",
                            borderBottom: "1px solid #f3f4f6",
                            borderRadius: "10px",
                            transition: "background-color 0.2s",
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setInputValue(hospital.name);
                            setSelectedCity(hospital.city || "");
                            // If you want to filter the main list when a hospital is selected
                            setHospitalList([hospital]);
                            setShowList(false);
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#f9fafb")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                        >
                          <div className="d-flex flex-column">
                            <span className="fw-medium">{hospital.name}</span>
                            <small className="text-muted">
                              {[hospital.city, hospital.state]
                                .filter(Boolean)
                                .join(", ")}
                            </small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {loading && <Loader />}
    </>
  );
};

export default HospitalSearch;
