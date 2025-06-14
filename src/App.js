import { Route, Routes } from 'react-router-dom';
import './App.css';
import DoctorRegister from './doctor/DoctorRegister';
import DoctorLogin from './doctor/DoctorLogin';
import DoctorForgot from './doctor/DoctorForgot';
import DoctorDashboard from './doctor/DoctorDashboard';
import Home from './Home';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/doctor'>
          <Route path='' index element={<DoctorLogin/>}></Route>
          <Route path='doctorregister' element={<DoctorRegister/>}></Route>
          <Route path='forgotdoctor' element={<DoctorForgot/>}></Route>
          <Route path='doctordashboard' element={<DoctorDashboard/>}></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
