import React, { useEffect, useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import A_Sidebar from './A_Sidebar'
import A_Nav from './A_Nav'
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";

const AdminDashboard = () => {
    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();

    const [admindata, setadmin] = useState(null)
    const [token, settoken] = useState(null)

    useEffect(() => {
        var getlocaldata = localStorage.getItem('healthadmincredit');
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }
        if (!data) {
            navigate('/healthadmin')
        }
        else {
            setadmin(data.userData);
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])
    return (
        <>
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <A_Sidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <A_Nav patientname={admindata?.name} />
                        <div className='bg-white rounded p-2'>
                            {/* {
                                patient === null ?
                                    'data loading' :
                                    <div>
                                        hello {patient.name}
                                    </div>
                            } */}
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default AdminDashboard
