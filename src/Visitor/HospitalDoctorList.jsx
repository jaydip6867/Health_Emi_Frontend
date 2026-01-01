import React, { useEffect, useState } from "react";
import NavBar from "./Component/NavBar";
import { Col, Container, Row } from "react-bootstrap";
import Loader from "../Loader";
import FooterBar from "./Component/FooterBar";
import axios from "axios";
import { useParams } from "react-router-dom";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";

import DoctorListComponents from "./Component/DoctorListComponent";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from "../config";

const HospitalDoctorList = () => {
  var navigate = useNavigate();
  const { hospitalTitle } = useParams();


  const [patient, setpatient] = useState(null);
  const [token, settoken] = useState(null);
  const [loading, setloading] = useState(false);
  const [doctor_list, setdoclist] = useState([]);

  const normalize = (str = "") => str.toLowerCase().trim().replace(/\s+/g, " ");

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

  // Filters state
  const getdoctorlist = async () => {
    try {
      const endpoint = `${API_BASE_URL}/user/doctors`;
      const requestData = {
        search: "",
      };

      const response = await axios({
        method: "post",
        url: endpoint,
        headers: token ? { Authorization: token } : {},
        data: requestData,
      });

      const doctorsData = response.data.Data?.docs || [];

      const filteredDoctors = doctorsData.filter((doctor) =>
        doctor.hospitals?.some(
          (hospital) => normalize(hospital.name) === normalize(hospitalTitle)
        )
      );

      setdoclist(Array.isArray(filteredDoctors) ? filteredDoctors : []);
    } catch (error) {
      // console.error('Error fetching doctors list:', error);
      setdoclist([]);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    getdoctorlist();
  }, []);

  return (
    <>
      <NavBar logindata={patient} />

      {/* doctor list section */}
      <section className="py-5">
        <Container>
          <Row>
            <Col xs={12}>
              <h2 className="head_sec text-center">
              <span className="sky-blue">Doctors</span> in Hospital  
              </h2>
            </Col>
          </Row>
          <Row>
            {doctor_list.length <= 0 ? (
              <Col>No Doctor Found...</Col>
            ) : (
              doctor_list.map((doc, i) => (
                <Col xs={12} md={6} lg={4} xl={3} key={i}>
                  <DoctorListComponents details={doc} />
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

export default HospitalDoctorList;
