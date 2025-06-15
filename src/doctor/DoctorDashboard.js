import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {

  var navigate = useNavigate();

  const [doctor,setdoctor] = useState(null)
  const [token,settoken] = useState(null)

  useEffect(()=>{
    var data = JSON.parse(localStorage.getItem('doctordata'));
    if(!data){
      navigate('/doctor')
    }
    else{
      setdoctor(data.data.Data.doctorData);
      settoken(`Bearer ${data.data.Data.accessToken}`)
    }
  },[navigate])

  return (
    <>
      {
        doctor === null ? 
        'data loading' : 
        <div>
          hello doctor {doctor.name}
          <button onClick={()=>(localStorage.removeItem('doctordata'),navigate('/doctor'))}>logout</button>
        </div>
      }
    </>
  )
}

export default DoctorDashboard
