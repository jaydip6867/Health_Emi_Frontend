import { Route, Routes } from 'react-router-dom';
import './App.css';
import 'leaflet/dist/leaflet.css';
import DoctorRegister from './doctor/DoctorRegister';
import DoctorLogin from './doctor/DoctorLogin';
import DoctorForgot from './doctor/DoctorForgot';
import DoctorDashboard from './doctor/DoctorDashboard';
import NotFound from './Visitor/NotFound';
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
import D_Blog from './doctor/D_Blog';
import P_Blog from './patient/P_Blog';
import Home from './Visitor/Home';
import About from './Visitor/About';
import Contact from './Visitor/Contact';
import VideoConsult from './Visitor/VideoConsult';
import Surgeries from './Visitor/Surgeries';
import Doctors from './Visitor/Doctors';
import DoctorProfilePage from './Visitor/DoctorProfilePage';
import Surgerydoctorlist from './Visitor/Surgerydoctorlist';
import Amb_register from './Ambulance/Amb_register';
import Amb_login from './Ambulance/Amb_login';
import Amb_dashboard from './Ambulance/Amb_dashboard';
import Amb_Forgot from './Ambulance/Amb_Forgot';
import Amb_Profile from './Ambulance/Amb_Profile';
import D_Consultation from './doctor/D_Consultation';
import P_Surgeries from './patient/P_Surgeries';
import D_SurgeryAppointment from './doctor/D_SurgeryAppointment';
import D_AmbulanceRequest from './doctor/D_AmbulanceRequest';
import CompareDoctor from './Visitor/CompareDoctor';
import Amb_Request from './Ambulance/Amb_Request';
import 'leaflet/dist/leaflet.css';
import Amb_Ridedetails from './Ambulance/Amb_Ridedetails';
import D_StatusAmbulance from './doctor/D_StatusAmbulance';
import AmbulancePage from './Visitor/AmbulancePage';
import Faq from './Visitor/Faq';
import Blog from './Visitor/Blog';
import BlogDetail from './Visitor/BlogDetail';
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/about' element={<About />}></Route>
        <Route path='/contact' element={<Contact />}></Route>
        <Route path='/consult' element={<VideoConsult />}></Route>
        <Route path='/doctorfind' element={<Doctors />}></Route>
        <Route path='/doctorprofile/:id' element={<DoctorProfilePage />}></Route>
        <Route path='/surgery' element={<Surgeries />}></Route>
        <Route path='/surgery/:id' element={<Surgerydoctorlist />}></Route>
        <Route path='/compare-doctor' element={<CompareDoctor />}></Route>
        <Route path='/ambulancepage' element={<AmbulancePage />}></Route>
        <Route path='/faq' element={<Faq />}></Route>
        <Route path='/blog' element={<Blog />}></Route>
        <Route path='/blog/:id' element={<BlogDetail />}></Route>
        <Route path='/doctor'>
          <Route path='' index element={<DoctorLogin />}></Route>
          <Route path='doctorregister' element={<DoctorRegister />}></Route>
          <Route path='forgotdoctor' element={<DoctorForgot />}></Route>
          <Route path='doctordashboard' element={<DoctorDashboard />}></Route>
          <Route path='doctorprofile' element={<DoctorProfile />}></Route>
          <Route path='doctorappointment' element={<D_Appointment />}></Route>
          <Route path='doctorsurgeryappointment' element={<D_SurgeryAppointment />}></Route>
          <Route path='doctorblog' element={<D_Blog />}></Route>
          <Route path='doctorsurgery' element={<D_Surgery />}></Route>
          <Route path='doctorconsultation' element={<D_Consultation />}></Route>
          <Route path='calender' element={<D_Calender />}></Route>
          <Route path='ambulance-request' element={<D_AmbulanceRequest />}></Route>
          <Route path="ambulance-request/status/:id" element={<D_StatusAmbulance />} />
        </Route>
        <Route path='/patientregister' element={<PatientRegister />}></Route>
        <Route path='/patient'>
          <Route path='' index element={<PatientLogin />}></Route>
          <Route path='forgotpatient'  element={<PatientForgotps />}></Route>
          <Route path='patientdahsboard' element={<PatientDashboard />}></Route>
          <Route path='patientdoctorappointment' element={<P_DoctorAppointment />}></Route>
          <Route path='appointment' element={<P_Appointment />}></Route>
          <Route path='surgeries' element={<P_Surgeries />}></Route>
          <Route path='blog' element={<P_Blog />}></Route>
          <Route path='doctor_ap/:id' element={<P_DoctorProfile />}></Route>
          <Route path='patientprofile' element={<PatientProfile />}></Route>
        </Route>
        <Route path='/ambulance'>
          <Route path='' index element={<Amb_login />}></Route>
          <Route path='ambregister'  element={<Amb_register />}></Route>
          <Route path='ambdashboard'  element={<Amb_dashboard />}></Route>
          <Route path='forgotambulance'  element={<Amb_Forgot />}></Route>
          <Route path='profileambulance'  element={<Amb_Profile />}></Route>
          <Route path='ambrequests'  element={<Amb_Request />}></Route>
          <Route path="rides/:id" element={<Amb_Ridedetails />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
