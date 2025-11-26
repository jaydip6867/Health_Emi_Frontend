import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import NavBar from './Component/NavBar';
import FooterBar from './Component/FooterBar';
import Loader from '../Loader';
import { Col, Container, Row, Pagination } from 'react-bootstrap';
import axios from 'axios';
import BlogBox from './Component/BlogBox';
import { FiSearch } from 'react-icons/fi';
import { API_BASE_URL, SECRET_KEY, DEFAULT_PAGE_LIMIT, STORAGE_KEYS } from '../config';
import FadeIn from '../components/FadeIn';

const Blog = () => {
    var navigate = useNavigate();

    const [loading, setloading] = useState(false)
    const [token, settoken] = useState(null)
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
        getblog()
    }, [navigate])

    const [bloglist, setbloglist] = useState([])
    const [page, setPage] = useState(1)
    const [limit] = useState(DEFAULT_PAGE_LIMIT)
    const [searchQuery, setSearchQuery] = useState('')
    const [totalPages, setTotalPages] = useState(1)
    function getblog(pageArg = page, searchArg = searchQuery) {
        setloading(true)
        axios({
            method: 'post',
            url: `${API_BASE_URL}/user/blogs`,
            headers: {
                Authorization: token,
            },
            data: {
                "page": pageArg,
                "limit": limit,
                "search": searchArg,
            }
        }).then((res) => {
            const data = res?.data?.Data;
            if (data?.docs) {
                setbloglist(data.docs)
                if (data?.totalPages) setTotalPages(data.totalPages)
                if (data?.page) setPage(data.page)
            } else if (Array.isArray(data)) {
                setbloglist(data)
                setTotalPages(1)
                setPage(1)
            } else {
                setbloglist([])
                setTotalPages(1)
            }
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }

    function searchblog(e) {
        const val = e.target.value;
        setSearchQuery(val)
        setPage(1)
        getblog(1, val)
    }

    const getPageNumbers = () => {
        const pages = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, page + 2);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    }

    const changePage = (p) => {
        if (p < 1 || (totalPages && p > totalPages) || p === page) return;
        setPage(p)
        getblog(p, searchQuery)
    }

    return (
        <>
            <NavBar logindata={logdata} />
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
                                <FiSearch className='position-absolute' style={{ left: 14, top: 12 }} />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* blog lists */}
            <section className='py-5'>
                <Container>
                    <FadeIn>
                    <Row className='g-4'>
                        {bloglist && bloglist?.map((item, index) => (
                            <BlogBox key={index} item={item} />
                        ))}
                    </Row>
                    </FadeIn>
                </Container>
            </section>
            <section className='pb-5'>
                <Container>
                    {totalPages > 1 && (
                        <div className='d-flex justify-content-center'>
                            <Pagination className='blog_pagination gap-2'>
                                {/* <Pagination.First onClick={() => changePage(1)} disabled={page === 1} /> */}
                                <Pagination.Prev onClick={() => changePage(page - 1)} disabled={page === 1} >Prev </Pagination.Prev>
                                {getPageNumbers().map((num) => (
                                    <Pagination.Item key={num} active={num === page} onClick={() => changePage(num)}>
                                        {num}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next onClick={() => changePage(page + 1)} disabled={page === totalPages} >Next</Pagination.Next>
                                {/* <Pagination.Last onClick={() => changePage(totalPages)} disabled={page === totalPages} /> */}
                            </Pagination>
                        </div>
                    )}
                </Container>
            </section>
            {loading && <Loader />}
            <FooterBar />
        </>
    )
}

export default Blog