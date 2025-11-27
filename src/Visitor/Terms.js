import { useEffect, useState } from "react";
import FooterBar from "./Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../config'
import CryptoJS from "crypto-js";
import NavBar from "./Component/NavBar";
import { Container, Row, Col, Nav, Accordion, ListGroup } from "react-bootstrap";

function Terms() {
    var navigate = useNavigate();

    const [logdata, setlogdata] = useState(null)
    const [token, settoken] = useState(null)

    useEffect(() => {
        var pgetlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
        var dgetlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
        if (pgetlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(pgetlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
            setlogdata(data.userData);
        }
        else if (dgetlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(dgetlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
            setlogdata(data.doctorData);
        }
        if (data) {
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])

    useEffect(() => {
        document.title = "About Health Easy EMI - Our Terms & Conditions"
    }, [])


    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>Terms & Conditions</h2>
                </Container>
            </section>

            {/* TC section */}
            <section className="py-5">
                <Container>
                    <ListGroup>
                        <ListGroup.Item action onClick={()=>navigate('/doctor-tc')}>Doctor terms & condition</ListGroup.Item>
                        <ListGroup.Item action onClick={()=>navigate('/doctor-telemedicine-tc')}>Doctor Telemedicine Terms & condition</ListGroup.Item>
                    </ListGroup>
                </Container>
            </section>
            
            <FooterBar />
        </>
    );
}
export default Terms;