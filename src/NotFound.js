import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <>
    <Link to={'doctor'}>Doctor</Link>
          <Link>Patient</Link>
        <h3>Page Not Found</h3>
    </>
  )
}

export default NotFound