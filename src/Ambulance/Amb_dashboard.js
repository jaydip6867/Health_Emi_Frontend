import React, { useEffect, useState } from 'react'
import CryptoJS from "crypto-js";
import { useNavigate } from 'react-router-dom';

const Amb_dashboard = () => {

  const SECRET_KEY = "health-emi";
  var navigate = useNavigate();

  const [ambulance, setambulance] = useState(null)
  const [token, settoken] = useState(null)

  useEffect(() => {
    var getlocaldata = localStorage.getItem('Ambulance');
    if (getlocaldata != null) {
      const bytes = CryptoJS.AES.decrypt(getlocaldata, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      var data = JSON.parse(decrypted);
      // console.log(data)
    }
    if (!data) {
      navigate('/ambulance')
    }
    else {
      setambulance(data.ambulanceData);
      settoken(`Bearer ${data.accessToken}`)
    }

  }, [navigate])

  return (
    <>
      Ambulance Dashboard
    </>
  )
}

export default Amb_dashboard