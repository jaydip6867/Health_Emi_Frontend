import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <>
      <div>Home Page</div>
      <Link to={'doctor'}>Doctor</Link>
      <Link to={'patient'}>Patient</Link>
    </>
  )
}

export default Home