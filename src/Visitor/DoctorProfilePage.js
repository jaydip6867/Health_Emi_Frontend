import React, { useEffect, useState } from 'react'
import NavBar from './Component/NavBar'
import { Container } from 'react-bootstrap'
import FooterBar from './Component/FooterBar'
import Loader from '../Loader'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const DoctorProfilePage = () => {
  const [loading, setloading] = useState(false)
  var { id } = useParams()
  const d_id = atob(decodeURIComponent(id))
  // console.log('ID:', id, d_id);
  
  const [doctor_profile, setdocprofile] = useState(null)

  useEffect(() => {
    setloading(true)
    if(d_id){
      getdoctordata(d_id)
    }
  }, [d_id])

  const getdoctordata = async (d) =>{
    await axios({
      method: 'post',
      url: 'https://healtheasy-o25g.onrender.com/user/doctors/getone',
      data: {
        "doctorid": d
      }
    }).then((res) => {
      setdocprofile(res.data.Data)
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
          <h3>Doctor {doctor_profile?.name}</h3>
        </Container>
      </section>
      <FooterBar />
      {loading ? <Loader /> : ''}
    </>
  )
}

export default DoctorProfilePage