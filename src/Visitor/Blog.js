import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import NavBar from './Component/NavBar';
import FooterBar from './Component/FooterBar';
import Loader from '../Loader';
import { Card, Col, Container, Row } from 'react-bootstrap';
import axios from 'axios';
import { IoCalendarOutline } from "react-icons/io5";
import BlogBox from './Component/BlogBox';
import { FiSearch } from 'react-icons/fi';

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
            console.log(res.data.Data)
            setbloglist(res.data.Data)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }

    function searchblog(e){
        
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
            {/* search blog */}
            <section className='py-5'>
                <Container>
                    <Row className='justify-content-center'>
                        <Col xs={6}>
                            <div className='blog_search_bar position-relative'>
                                <input type="text" placeholder='Search blog details' onChange={searchblog} />
                                <FiSearch className='position-absolute' style={{ left: 14, top: 12}}  />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* blog lists */}
            <section className='py-5'>
                <Container>
                    <Row>
                        {bloglist && bloglist?.map((item, index) => (
                            <BlogBox key={index} item={item} />
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