import { Button, Col } from 'react-bootstrap'
import { FaUserGear } from 'react-icons/fa6'
import { AiFillSchedule } from "react-icons/ai";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { Navigate, NavLink } from 'react-router-dom'
import { LuUserRound } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';

const P_Sidebar = () => {
    const navigate = useNavigate();
    return (
        <Col xs={12} md={3} className='patient_sticky top-0 pe-0'>
            <div className='py-5'>
                <div className='bg-white patient_side_height m-md-0'>
                    {/* <div className='px-3'><h4 className='p-3 m-0 border-bottom text-center'>Health Patient</h4></div> */}
                    <div className='sidebar_nav mt-3 px-2 py-3'>
                        {/* <NavLink to={'/patient/patientdahsboard'} className={({ isActive }) => (isActive ? 'active' : '')}><MdSpaceDashboard />Dashboard</NavLink> */}
                        <NavLink to={'/patient/patientprofile'} className={({ isActive }) => (isActive ? 'active' : '')}><FaUserGear /><span>Profile</span></NavLink>
                        {/* <NavLink to={'/patient/patientdoctorappointment'} className={({ isActive }) => (isActive ? 'active' : '')}><MdDifference />Add Appointment</NavLink> */}
                        <NavLink to={'/patient/appointment'} className={({ isActive }) => (isActive ? 'active' : '')} ><RiCalendarScheduleFill /><span>Consultation Appointment</span></NavLink>
                        <NavLink to={'/patient/surgeries'} className={({ isActive }) => (isActive ? 'active' : '')} ><AiFillSchedule /><span>Surgeries Appointment</span></NavLink>
                        {/* <NavLink to={'/patient/blog'} className={({ isActive }) => (isActive ? 'active' : '')}><BiSolidCommentAdd /><span>Blog</span></NavLink> */}
                    </div>
                    <div className='mx-2'>
                        <Button className='w-100 logout-btn' onClick={() => (localStorage.removeItem('PatientLogin'), navigate('/patient'))}><LuUserRound /> Logout</Button>

                    </div>
                </div>
            </div>
        </Col>
    )
}

export default P_Sidebar