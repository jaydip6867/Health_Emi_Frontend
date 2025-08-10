import React from 'react'
import { Link } from 'react-router-dom'
import NavBar from './Component/NavBar'
import FooterBar from './Component/FooterBar'
import { Container } from 'react-bootstrap'

const NotFound = () => {
  return (
    <>
      <div className='d-flex flex-column min-vh-100'>
        <NavBar />
        <section className='py-5'>
          <Container>
            <h3 className='text-center py-5'>Page Not Found</h3>
          </Container>
        </section>
        <FooterBar />
      </div>
    </>
  )
}

export default NotFound