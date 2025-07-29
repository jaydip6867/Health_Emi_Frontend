import React, { useEffect, useState } from 'react'
import Loader from '../Loader'
import { Col, Container, Row, Table } from 'react-bootstrap'
import P_Sidebar from './P_Sidebar'
import P_nav from './P_nav'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const P_Blog = () => {
    const SECRET_KEY = "health-emi";

    var navigate = useNavigate();
    const [loading, setloading] = useState(false)

    const [patient, setpatient] = useState(null)
    const [token, settoken] = useState(null)

    useEffect(() => {
        var getlocaldata = localStorage.getItem('PatientLogin');
        if (getlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
        }
        if (!data) {
            navigate('/patient')
        }
        else {
            setpatient(data.userData);
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])

    useEffect(() => {
        setloading(true)
        if (patient) {
            setTimeout(() => {
                getblogs()
            }, 200);
        }
    }, [patient])

    const [bloglist, setbloglist] = useState(null)

    function getblogs() {
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/blogs/list',
            headers: {
                Authorization: token
            }
        }).then((res) => {
            console.log('blogs = ', res.data.Data);
            setbloglist(res.data.Data)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }
    return (
        <>
            <Container fluid className='p-0 panel'>
                <Row className='g-0'>
                    <P_Sidebar />
                    <Col xs={12} sm={9} lg={10} className='p-3'>
                        <P_nav patientname={patient && patient.name} />
                        <div className='bg-white rounded p-3 mb-3'>
                            <h5 className='mb-3'>All Blogs</h5>
                            <Table hover bordered responsive>
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Blog Title</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        bloglist && bloglist.map((v, i) => {
                                            return (
                                                <tr key={i}>
                                                    <th>{i + 1}</th>
                                                    <td>{v.title}</td>
                                                    <td>{v.description}</td>
                                                </tr>
                                            )
                                        })
                                    }
                                </tbody>
                            </Table>
                        </div>
                    </Col>
                </Row>
            </Container>
            {loading ? <Loader /> : ''}
        </>
    )
}

export default P_Blog