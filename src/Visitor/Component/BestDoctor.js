import { Container, Row, Col } from 'react-bootstrap'
import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Loader from '../../Loader'
import DoctorListComponents from './DoctorListComponent'
import HeadTitle from './HeadTitle'
import { API_BASE_URL } from '../../config'

const BestDoctor = () => {
    const [doclist, setdoclist] = useState([])
    const [loading, setloading] = useState(false)
    const getdoctorlist = async (d) => {
        setloading(true)
        await axios({
            method: 'post',
            url: `${API_BASE_URL}/user/doctors/list`,
            data: {
                surgerytypeid: d
            }
        }).then((res) => {
            setdoclist(res.data.Data)
            // console.log('doctor ', res.data.Data)
        }).catch(function (error) {
            // console.log(error);
        }).finally(() => {
            setloading(false)
        });
    }
    useEffect(() => {
        getdoctorlist()
    }, [])

    const randomFour = useMemo(() => {
        if (!doclist || doclist.length === 0) return []
        const copy = [...doclist]
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            const temp = copy[i]
            copy[i] = copy[j]
            copy[j] = temp
        }
        return copy.slice(0, 4)
    }, [doclist])
    return (
        <>
            <section className='spacer-y my-5' style={{ backgroundColor: '#EBF6FF' }}>
                <Container>
                    <Row>
                        <Col xs={12} className='text-center'>
                            <h2 className='head_sec'><HeadTitle title="Best Doctors" /></h2>
                        </Col>
                    </Row>
                    <Row>
                        {randomFour.map((v, i) => (
                            <Col xs={12} md={6} lg={4} xl={3} key={i}>
                                <DoctorListComponents details={v} />
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>
            {loading ? <Loader /> : ''}
        </>
    )
}

export default BestDoctor