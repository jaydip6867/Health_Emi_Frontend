import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import NavBar from './Component/NavBar';
import FooterBar from './Component/FooterBar';
import Loader from '../Loader';
import { Card, Col, Container, Row } from 'react-bootstrap';
import axios from 'axios';
import { IoCalendarOutline } from "react-icons/io5";

const Blog = () => {
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
        if (data) {
            setpatient(data.userData);
            settoken(`Bearer ${data.accessToken}`)
        }
        getblog()
    }, [navigate])

    const [bloglist, setbloglist] = useState(null)
    function getblog() {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/blogs/list',
            headers: {
                Authorization: token,
            },
            data: {
                "search": "",
            }
        }).then((res) => {
            // console.log(res.data.Data)
            setbloglist(res.data.Data)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }

    function FormattedDate({ isoString }) {
        const formatted = new Date(isoString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        return <div>{formatted}</div>;
    }
    return (
        <>
            <NavBar />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>Blogs</h2>
                </Container>
            </section>

            {/* blog lists */}
            <section className='py-5'>
                <Container>
                    <Row className='blog'>
                        {bloglist && bloglist?.map((item, index) => (
                            <Col key={index} xl={3} lg={4} sm={6} xs={12}>
                                <Card className='rounded-4 overflow-hidden'>
                                    <Card.Img variant="top" src={item.image} />
                                    <Card.Body>
                                        <div className='d-flex justify-content-between blog_box'>
                                            <div className='d-flex align-items-center gap-1'>
                                                <img src={require('./assets/step_doctor.png')} className=''></img>
                                                <span>Wade Warren</span>
                                            </div>
                                            <div className='d-flex align-items-center gap-1'>
                                                <IoCalendarOutline />
                                                <FormattedDate isoString={item.createdAt} />
                                            </div>
                                        </div>
                                        <Card.Title>{item.title}</Card.Title>
                                        <Card.Text>{item.description}</Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>
            {loading && <Loader />}
            <FooterBar />
        </>
    )
}

export default Blog