import { useEffect, useState } from "react";
import Loader from "../Loader"
import FooterBar from "./Component/FooterBar"
import NavBar from "./Component/NavBar"
import { Link, useNavigate, useParams } from "react-router-dom";
import CryptoJS from "crypto-js";
import axios from "axios";
import { Container, Row, Col } from "react-bootstrap";
import { IoCalendarOutline } from "react-icons/io5";
import { BsClock } from "react-icons/bs";
import BlogBox from "./Component/BlogBox";
import Swal from "sweetalert2";
import { API_BASE_URL, SECRET_KEY, STORAGE_KEYS } from '../config';
import { MdOutlineModeComment, MdThumbUpAlt, MdThumbUpOffAlt } from "react-icons/md";

const BlogDetail = () => {
    var navigate = useNavigate();
    const { id } = useParams();
    // console.log(id)

    const [loading, setloading] = useState(false)

    const [token, settoken] = useState(null)
    const [blog, setblog] = useState(null)
    const [bloglist, setbloglist] = useState(null)
    const [logdata, setlogdata] = useState(null)
    const [comment, setcomment] = useState("")

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
            // console.log(res.data.Data)
            setblog(res.data.Data)
        }).catch(function (error) {
            // console.log(error);
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
            // console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }

    function likeblog(blogid) {
        if (logdata.logintype === 'patient') {
            setloading(true)
            axios({
                method: 'post',
                url: `${API_BASE_URL}/user/blogs/like`,
                headers: {
                    Authorization: token,
                },
                data: {
                    "blogid": blogid,
                }
            }).then((res) => {
                // console.log(res.data.Data)
                getblogdetail()
                Swal.fire({
                    icon: 'success',
                    title: 'Blog Liked',
                })
            }).catch(function (error) {
                // console.log(error);
            }).finally(() => {
                setloading(false)
            });
        }
        else {
            Swal.fire({
                icon: 'info',
                title: 'Patient Login',
                text: 'please login to patient for like this blog',
            })
        }


    }

    function sendcomment() {
        if (logdata?.logintype !== 'patient') {
            Swal.fire({
                icon: 'info',
                title: 'Patient Login',
                text: 'please login to patient for comment on this blog',
            })
            return
        }
        const already = blog?.allcomments?.some((c) => c?.userid?._id === logdata?._id)
        if (already) {
            Swal.fire({
                icon: 'info',
                title: 'Comment already added',
                text: 'you can add only one comment on this blog',
            })
            return
        }
        if (!comment.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Enter comment',
            })
            return
        }
        setloading(true)
        axios({
            method: 'post',
            url: `${API_BASE_URL}/user/blogs/comment`,
            headers: {
                Authorization: token,
            },
            data: {
                blogid: id,
                message: comment.trim(),
            }
        }).then((res) => {
            setcomment("")
            getblogdetail()
            Swal.fire({
                icon: 'success',
                title: 'Comment added',
            })
        }).catch(function (error) {
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
                            <img src={blog?.image} alt={`${blog?.title} blog image `} />
                        </Col>
                        <Col xs={12} md={6} className="blog">
                            <h2>{blog?.title}</h2>
                            <div className='d-flex justify-content-between blog_box mb-2'>
                                <Link to={`/doctorprofile/${encodeURIComponent(btoa(blog?.createdBy?._id))}`} className='d-flex align-items-center gap-1'>
                                    <img src={blog?.createdBy?.profile_pic || require('./assets/profile_icon_img.png')} alt={`${blog?.createdBy?.name} profile image`}></img>
                                    <span>Dr. {blog?.createdBy?.name}</span>
                                </Link>
                                <div className='d-flex align-items-center gap-1'>
                                    <IoCalendarOutline />
                                    <FormattedDate isoString={blog?.createdAt} />
                                </div>
                            </div>
                            {
                                blog?.expirydate !== "" ? <div className="blog_expired">
                                    <span className="d-flex align-items-center gap-2"><BsClock />Expired On</span>
                                    <div className="fw-bold">{blog?.expirydate}</div>
                                </div> : null
                            }

                            <p className="mt-2">{blog?.description}</p>
                            <div className="d-flex align-items-center gap-4">
                                <span className="d-flex align-items-center gap-2">{blog?.is_like ? <MdThumbUpAlt fill="#00233D" /> : <MdThumbUpOffAlt onClick={() => likeblog(blog?._id)} />} {blog?.totalLike}</span>
                                <span className="d-flex align-items-center gap-2"><MdOutlineModeComment /> {blog?.totalComment}</span>
                            </div>

                            <div className="blog_message d-flex align-items-center register_doctor gap-2 mt-3">
                                <input
                                    type="text"
                                    placeholder="Enter Text Messsage"
                                    value={comment}
                                    className="form-control"
                                    onChange={(e) => setcomment(e.target.value)}
                                // disabled={!logdata || logdata?.logintype !== 'patient' || blog?.allcomments?.some((c) => c?.userid?._id === logdata?._id)}
                                />
                                <button
                                    className="btn btn_gradient btn-primary"
                                    onClick={sendcomment}
                                >
                                    Send
                                </button>
                            </div>
                            <div className="blog_comment_list">
                                {
                                    blog?.allcomments?.map((item, index) => (
                                        <div key={index} className="my-3 border rounded-3 px-3 py-2 ">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center gap-3 pb-2">
                                                    <img src={item?.userid?.profile_pic} alt={`${item?.userid?.name} profile pic`} className="shadow rounded-circle" style={{ width: '32px', height: '32px', objectFit: 'cover' }} ></img>
                                                    <span className="fw-semibold">{item?.userid?.name}</span>
                                                </div>
                                                <div className='d-flex align-items-center gap-2 text-nowrap'>
                                                    {/* <IoCalendarOutline /> */}
                                                    <span className="text-muted small"><FormattedDate isoString={item?.createdAt} /></span>
                                                </div>
                                            </div>
                                            <p className="mb-0 mt-1 py-1 border-top">{item?.message}</p>
                                        </div>
                                    ))
                                }
                            </div>

                        </Col>
                    </Row>
                </Container>
            </section>

            {/* blog list */}
            <section className='py-5'>
                <Container>
                    <Row className="g-4">
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