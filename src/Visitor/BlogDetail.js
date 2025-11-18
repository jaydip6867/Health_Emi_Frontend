import { useEffect, useState } from "react";
import Loader from "../Loader"
import FooterBar from "./Component/FooterBar"
import NavBar from "./Component/NavBar"
import { useNavigate, useParams } from "react-router-dom";
import CryptoJS from "crypto-js";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";
import { IoCalendarOutline } from "react-icons/io5";
import { BsClock } from "react-icons/bs";
import BlogBox from "./Component/BlogBox";

const BlogDetail = () => {
    const SECRET_KEY = "health-emi";
    var navigate = useNavigate();
    const { id } = useParams();
    console.log(id)

    const [loading, setloading] = useState(false)
    const [patient, setpatient] = useState(null)
    const [token, settoken] = useState(null)
    const [blog, setblog] = useState(null)
    const [bloglist, setbloglist] = useState(null)

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
        getblogdetail()
        getblog()
    }, [navigate])

    function getblogdetail() {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/blogs/getone',
            headers: {
                Authorization: token,
            },
            data: {
                "blogid": id,
            }
        }).then((res) => {
            // console.log(res.data.Data)
            setblog(res.data.Data)
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

    function getblog() {
        setloading(true)
        axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/blogs',
            headers: {
                Authorization: token,
            },
            data: {
                "page": 1,
                "limit": 4,
                "search": "",
            }
        }).then((res) => {
            // console.log(res.data.Data.docs)
            setbloglist(res.data.Data.docs)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }
    return (
        <>
            <NavBar />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>Blog Detail</h2>
                </Container>
            </section>

            {/* blog detail */}
            <section className='py-5'>
                <Container>
                    <Row>
                        <Col xs={12} md={6}>
                            <img src={blog?.image} alt="" />
                        </Col>
                        <Col xs={12} md={6} className="blog">
                            <h2>{blog?.title}</h2>
                            <div className='d-flex justify-content-between blog_box mb-2'>
                                <div className='d-flex align-items-center gap-1'>
                                    {/* <img src={blog?.createdBy?.profile_pic}></img> */}
                                    <img src={require('./assets/step_doctor.png')}></img>
                                    {/* <span>{blog?.createdBy?.name}</span> */}
                                    <span>John Doe</span>
                                </div>
                                <div className='d-flex align-items-center gap-1'>
                                    <IoCalendarOutline />
                                    <FormattedDate isoString={blog?.createdAt} />
                                </div>
                            </div>
                            <div className="blog_expired">
                                <span className="d-flex align-items-center gap-2"><BsClock />Expired On</span>
                                <div className="fw-bold"><FormattedDate isoString={blog?.createdAt} /></div>
                            </div>
                            <p className="mt-2">{blog?.description}</p>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* blog list */}
            <section className='py-5'>
                <Container>
                    <Row>
                        {bloglist?.map((item, index) => (
                            <BlogBox item={item} index={index} />
                        ))}
                    </Row>
                </Container>
            </section>

            {loading && <Loader />}
            <FooterBar />
        </>
    )
}

export default BlogDetail