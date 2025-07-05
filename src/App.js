import { Route, Routes } from 'react-router-dom';
import './App.css';
import DoctorRegister from './doctor/DoctorRegister';
import DoctorLogin from './doctor/DoctorLogin';
import DoctorForgot from './doctor/DoctorForgot';
import DoctorDashboard from './doctor/DoctorDashboard';
import Home from './Home';
import NotFound from './NotFound';
import D_Appointment from './doctor/D_Appointment';
import DoctorProfile from './doctor/DoctorProfile';
import PatientRegister from './patient/PatientRegister';
import PatientLogin from './patient/PatientLogin';
import D_Surgery from './doctor/D_Surgery';
import PatientForgotps from './patient/PatientForgotps';
import PatientDashboard from './patient/PatientDashboard';
import PatientProfile from './patient/PatientProfile';
import P_DoctorAppointment from './patient/P_DoctorAppointment';
import P_DoctorProfile from './patient/P_DoctorProfile';
import P_Appointment from './patient/P_Appointment';
import D_Calender from './doctor/D_Calender';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/doctor'>
          <Route path='' index element={<DoctorLogin />}></Route>
          <Route path='doctorregister' element={<DoctorRegister />}></Route>
          <Route path='forgotdoctor' element={<DoctorForgot />}></Route>
          <Route path='doctordashboard' element={<DoctorDashboard />}></Route>
          <Route path='doctorprofile' element={<DoctorProfile />}></Route>
          <Route path='doctorappointment' element={<D_Appointment />}></Route>
          <Route path='doctorsurgery' element={<D_Surgery />}></Route>
          <Route path='calender' element={<D_Calender />}></Route>
        </Route>
        <Route path='/patientregister' element={<PatientRegister />}></Route>
        <Route path='/patient'>
          <Route path='' index element={<PatientLogin />}></Route>
          <Route path='forgotpatient' index element={<PatientForgotps />}></Route>
          <Route path='patientdahsboard' element={<PatientDashboard />}></Route>
          <Route path='patientdoctorappointment' element={<P_DoctorAppointment />}></Route>
          <Route path='appointment' element={<P_Appointment />}></Route>
          <Route path='doctor_ap/:id' element={<P_DoctorProfile />}></Route>
          <Route path='patientprofile' element={<PatientProfile />}></Route>
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
