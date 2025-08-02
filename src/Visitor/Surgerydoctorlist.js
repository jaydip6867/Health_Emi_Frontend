import React, { useEffect, useState } from 'react'
import NavBar from './Component/NavBar'
import { Container } from 'react-bootstrap'
import Loader from '../Loader'
import FooterBar from './Component/FooterBar'
import axios from 'axios'
import { useParams } from 'react-router-dom'

const Surgerydoctorlist = () => {
    const [loading, setloading] = useState(false)
    var { id } = useParams()
    const d_id = atob(decodeURIComponent(id))
    const [doctor_list, setdoclist] = useState(null)

    useEffect(() => {
        setloading(true)
        if (d_id) {
            getdoctorlist(d_id)
        }
    }, [d_id])

    const getdoctorlist = async (d) => {
        await axios({
            method: 'post',
            url: 'https://healtheasy-o25g.onrender.com/user/surgeries/list',
            // headers: {
            //     Authorization: token
            // },
            data: {
                "doctorid": d
            }
        }).then((res) => {
            setdoclist(res.data.Data)
            console.log('doctor ', res.data.Data)
        }).catch(function (error) {
            console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }
    return (
        <>
            <NavBar />
            {/* doctor list section */}
            <section className='py-5'>
                <Container>
                    {}
                </Container>
            </section>
            <FooterBar />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default Surgerydoctorlist