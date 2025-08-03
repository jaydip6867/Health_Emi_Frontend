import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import A_Sidebar from './A_Sidebar'

const AdminDashboard = () => {
    return (
        <>
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <A_Sidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        {/* <P_nav patientname={patient && patient.name} /> */}
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
