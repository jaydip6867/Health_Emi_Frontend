import React, { useEffect, useRef, useState } from "react";
import NavBar from "./Component/NavBar";
import { Button, Col, Container, Row } from "react-bootstrap";
import Loader from "../Loader";
import FooterBar from "./Component/FooterBar";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import SearchBox from "./Component/SearchBox";
import { TbMapPin } from "react-icons/tb";
import { MdFilterListAlt } from "react-icons/md";
import DoctorListComponents from "./Component/DoctorListComponent";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from "../config";
import { TbChevronRight } from "react-icons/tb";
import HospitalSearch from "./Component/HospitalSearch";

const HospitalList = () => {
  var navigate = useNavigate();

  const [patient, setpatient] = useState(null);
  const [token, settoken] = useState(null);

  useEffect(() => {
    var getlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
    }
    if (data) {
      setpatient(data.userData);
      settoken(`Bearer ${data.accessToken}`);
    }
  }, [navigate]);
  const [loading, setloading] = useState(false);
  const [doctor_list, setdoclist] = useState([]);
  const [hospitalList, setHospitalList] = useState([]);
  // Filters state
  useEffect(() => {
    setloading(true);
    // Always call getdoctorlist, it will handle both cases
    getdoctorlist();
  }, []); // Add d_id to dependency array to refetch when it changes

  const getdoctorlist = async () => {
    try {
      const endpoint = `${API_BASE_URL}/user/doctors`; // When no ID, get all doctors

      const requestData = {
            search: "",
          };

      const response = await axios({
        method: "post",
        url: endpoint,
        headers: token ? { Authorization: token } : {},
        data: requestData,
      });

      const doctorsData =  response.data.Data?.docs || [];
      setdoclist(Array.isArray(doctorsData) ? doctorsData : []);
      const uniqueHospitals = [
        ...new Map(
          doctorsData
            .flatMap((d) => d.hospitals || [])
            .map((h) => [`${h.name}_${h.city}`, h])
        ).values(),
      ];
      setHospitalList(uniqueHospitals);
    } catch (error) {
      // console.error('Error fetching doctors list:', error);
      setdoclist([]);
    } finally {
      setloading(false);
    }
  };

  return (
    <>
      <NavBar logindata={patient} />
      {/* header bg */}
      <section className="spacer-y bg_sec_search">
        <Container>
          <Row>
            <Col xs={12}>
              <h2 className="head_sec text-center">
                Find Perfect <span className="sky-blue">Hospital</span>{" "}
              </h2>
            </Col>
          </Row>
        </Container>
      </section>
      {/* search box */}
      <div style={{ marginTop: "-22px" }}>
        <HospitalSearch hospitalList={hospitalList} setHospitalList={setHospitalList}/>
      </div>

      {/* doctor list section */}
      <section className="py-5">
        <Container>
          <Row>
            {doctor_list.length <= 0 ? (
              <Col>No Hospital Found...</Col>
            ) : (
              hospitalList.map((doc, i) => (
                <Col className="p-2" xs={12} md={6} lg={4} key={i}>
                  <div className="card main-card-box d-flex flex-column justify-content-between  p-3">
                    <div className="py-2">
                        <h2 className="title-hospital">{doc.name}</h2>
                        <div className="d-flex align-items-center h-100">
                            <TbMapPin size={20} className="text-sub-title" /> <div className="ms-1 text-sub-title">{doc.city} , {doc.state}</div>
                        </div>
                        <hr className="border-x"/>
                    </div>
                     
                     <div className="d-flex justify-content-end h-100 ">
                        <Link to='' className="text-primary see-all-doc">See All Dooctors <TbChevronRight size={18}/></Link>
                     </div>
                   
                  </div>
                </Col>
              ))
            )}
          </Row>
        </Container>
      </section>
      <FooterBar />
      {loading ? <Loader /> : ""}
    </>
  );
};

export default HospitalList;
