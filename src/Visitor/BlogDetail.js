import { useEffect, useState } from "react";
import Loader from "../Loader"
import FooterBar from "./Component/FooterBar"
import NavBar from "./Component/NavBar"
import { Link, useNavigate, useParams } from "react-router-dom";
import CryptoJS from "crypto-js";
import axios from "axios";
import { Container, Row, Col, Card } from "react-bootstrap";
import { IoCalendarOutline } from "react-icons/io5";
import { BsClock } from "react-icons/bs";
import BlogBox from "./Component/BlogBox";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';

const BlogDetail = () => {
    var navigate = useNavigate();
    const { id } = useParams();
    // console.log(id)

    const [loading, setloading] = useState(false)

    const [token, settoken] = useState(null)
    const [blog, setblog] = useState(null)
    const [bloglist, setbloglist] = useState(null)
    const [logdata, setlogdata] = useState(null)

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
        getblogdetail()
        getblog()
    }, [navigate])

    function getblogdetail() {
        setloading(true)
        axios({
            method: 'post',
            url: `${API_BASE_URL}/user/blogs/getone`,
            headers: {
                Authorization: token,
            },
            data: {
                "blogid": id,
            }
        }).then((res) => {
            console.log(res.data.Data)
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
            url: `${API_BASE_URL}/user/blogs`,
            headers: {
                Authorization: token,
            },
            data: {
                "page": 1,
                "limit": 4,
                "search": "",
            }
        }).then((res) => {
            setbloglist(res.data.Data.docs)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }
    return (
        <>
            <NavBar logindata={logdata} />
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
                                <Link to={`/doctorprofile/${encodeURIComponent(btoa(blog?.createdBy?._id))}`} className='d-flex align-items-center gap-1'>
                                    <img src={blog?.createdBy?.profile_pic}></img>
                                    <span>{blog?.createdBy?.name}</span>
                                </Link>
                                <div className='d-flex align-items-center gap-1'>
                                    <IoCalendarOutline />
                                    <FormattedDate isoString={blog?.createdAt} />
                                </div>
                            </div>
                            <div className="blog_expired">
                                <span className="d-flex align-items-center gap-2"><BsClock />Expired On</span>
                                <div className="fw-bold">{blog?.expirydate}</div>
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
                            <BlogBox item={item} index={index} key={index} />
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