import React, { useState } from 'react'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import Loader from '../Loader'
import { Container } from 'react-bootstrap'

const DoctorlistPage = () => {
    const [loading, setloading] = useState(false)
    return (
        <>
            <NavBar />
            {/* doctor list section */}
            <section className='py-5'>
                <Container>
                    <h3>Doctor List</h3>
                </Container>
            </section>
            <FooterBar />
            {loading ? <Loader /> : ''}
        </>
    )
}

export default DoctorlistPage