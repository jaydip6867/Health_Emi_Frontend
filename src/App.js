import { Route, Routes } from 'react-router-dom';
import './App.css';
import DoctorRegister from './doctor/DoctorRegister';
import DoctorLogin from './doctor/DoctorLogin';
import DoctorForgot from './doctor/DoctorForgot';
import DoctorDashboard from './doctor/DoctorDashboard';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<DoctorRegister/>}></Route>
        <Route path='/LoginDoctor' element={<DoctorLogin/>}></Route>
        <Route path='/DoctorForgot' element={<DoctorForgot/>}></Route>
        <Route path='/Doctor_Dashboard' element={<DoctorDashboard/>}></Route>
      </Routes>
    </div>
  );
}

export default App;
