import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <>
      <div>Home Page</div>
      <Link to={'doctor'}>Doctor</Link>
      <Link to={'patient_register'}>Patient</Link>
    </>
  )
}

export default Home