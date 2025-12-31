import { City, Country, State } from "country-state-city";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { FiMapPin, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import Loader from "../../Loader";
import { API_BASE_URL } from "../../config";
import { toast, ToastContainer } from "react-toastify";

const HospitalSearch = () => {
  const [loading, setloading] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);

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
  const getsuggestion = async (n) => {
    if (!n) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/user/suggestions`, {
        search: n,
        state: selectedStateName,
        city: selectedCity,
      });
      setreclist(res.data.Data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowList(true);
    getsuggestion(e.target.value);
  };

  const handleSelectItem = (item) => {
    setInputValue(item);
    setShowList(false);
  };
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
                      if (inputValue?.trim()) getsuggestion(inputValue);
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
                        if (inputValue?.trim()) getsuggestion(inputValue);
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
                      onChange={handleInputChange}
                      onFocus={() => setShowList(true)}
                      onBlur={() => setTimeout(() => setShowList(false), 50)}
                      className="bg-transparent ps-5 py-2 border-0"
                    />
                  </div>

                  {showList && (
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
                      {recordlist.length === 0 ? (
                        <p className="p-2 m-0 text-muted">No Record Found</p>
                      ) : (
                        recordlist.map((item, index) => (
                          <li
                            style={{
                              padding: "10px 8px",
                              cursor: "pointer",
                              borderBottom: "1px solid #f3f4f6",
                              borderRadius: "10px",
                            }}
                            key={index}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            <Link
                              to={
                                item.type === "surgery"
                                  ? `/surgery/${encodeURIComponent(
                                      btoa(item.name)
                                    )}`
                                  : `/doctorprofile/${encodeURIComponent(
                                      btoa(item.id)
                                    )}`
                              }
                              onClick={() => handleSelectItem(item.name)}
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))
                      )}
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
