import { useEffect, useState } from "react";
import FooterBar from "../Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import { Container, Accordion } from "react-bootstrap";

function PnsPolicy() {
    const navigate = useNavigate();

    const [logdata, setlogdata] = useState(null);
    const [token, settoken] = useState(null);

    useEffect(() => {
        const pgetlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
        const dgetlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
        let data = null;

        if (pgetlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(pgetlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            data = JSON.parse(decrypted);
            setlogdata(data.userData);
        } else if (dgetlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(dgetlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            data = JSON.parse(decrypted);
            setlogdata(data.doctorData);
        }

        if (data && data.accessToken) {
            settoken(`Bearer ${data.accessToken}`);
        }
    }, []);

    useEffect(() => {
        document.title = "HealthEasy EMI – Patient No-Show (PNS) Policy";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>Patient No-Show (PNS) Policy [cite: 84]</h2>
                </Container>
            </section>
            
            <section className="py-5">
                <Container>
                    <div className="p-3 border rounded">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>1. Overview</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI is committed to improving access to healthcare services by facilitating timely appointments between patients and healthcare providers. [cite: 86] Missed appointments reduce the availability of healthcare professionals, create scheduling inefficiencies, and may delay medical care for other patients. [cite: 87] To promote responsible use of the platform and ensure fair access to healthcare services, HealthEasy EMI has established this Patient No-Show ("PNS") Policy. [cite: 88] This Policy applies to all patients using appointment booking services through the HealthEasy EMI website and mobile application. [cite: 89]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header>2. Definition of Patient No-Show (PNS)</Accordion.Header>
                                <Accordion.Body>
                                    <p>A Patient No-Show occurs when a patient books a confirmed appointment through HealthEasy EMI and: [cite: 91]</p>
                                    <ul>
                                        <li>Fails to attend the scheduled appointment; and [cite: 92]</li>
                                        <li>Does not cancel the appointment in advance; and [cite: 93]</li>
                                        <li>Does not reschedule the appointment before the scheduled appointment time; and [cite: 94]</li>
                                        <li>Does not notify the doctor, clinic, or healthcare provider prior to the appointment. [cite: 95]</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>3. Recording and Verification of No-Shows</Accordion.Header>
                                <Accordion.Body>
                                    <h5>3.1 Reporting by Doctors and Clinics [cite: 97]</h5>
                                    <p>Healthcare providers using HealthEasy EMI's appointment management systems may mark an appointment as a Patient No-Show if the patient does not attend the scheduled appointment without prior notice. [cite: 98] The healthcare provider must update the appointment status within five (5) calendar days from the scheduled appointment date. [cite: 99]</p>
                                    
                                    <h5>3.2 Patient Verification Process [cite: 100]</h5>
                                    <p>Once a Patient No-Show is reported: [cite: 101]</p>
                                    <ul>
                                        <li>HealthEasy EMI may notify the patient through SMS, email, in-app notification, phone call, or any other communication channel available on record. [cite: 102]</li>
                                        <li>The patient may be requested to confirm whether the appointment was missed and provide a reason for non-attendance. [cite: 103]</li>
                                        <li>The patient should respond within seven (7) calendar days from the date of notification. [cite: 104]</li>
                                        <li>Failure to respond within the prescribed period may result in the No-Show being treated as valid. [cite: 105]</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header>4. Valid Patient No-Shows</Accordion.Header>
                                <Accordion.Body>
                                    <p>A Patient No-Show may be classified as valid under any of the following circumstances: [cite: 106]</p>
                                    <h5>4.1 Non-Response [cite: 108]</h5>
                                    <p>The patient fails to respond within seven (7) calendar days after receiving a notification regarding the reported No-Show. [cite: 109]</p>
                                    <h5>4.2 Patient Confirmation [cite: 110]</h5>
                                    <p>The patient confirms that the appointment was missed due to reasons including but not limited to: [cite: 111]</p>
                                    <ul>
                                        <li>Forgetting the appointment; [cite: 112]</li>
                                        <li>Scheduling conflicts; [cite: 113]</li>
                                        <li>Being occupied with personal or professional commitments; [cite: 114]</li>
                                        <li>Choosing to consult another healthcare provider; [cite: 115]</li>
                                        <li>Deciding not to proceed with the consultation; [cite: 116]</li>
                                        <li>Any other reason that HealthEasy EMI reasonably determines to constitute a valid No-Show. [cite: 117]</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header>5. Invalid Patient No-Shows</Accordion.Header>
                                <Accordion.Body>
                                    <p>A reported Patient No-Show may be treated as invalid where: [cite: 119]</p>
                                    <h5>5.1 Incorrect Marking [cite: 120]</h5>
                                    <p>The patient reasonably demonstrates that they attended the appointment and were incorrectly marked as absent. [cite: 121] HealthEasy EMI may investigate such cases and request supporting information from the patient and healthcare provider before making a determination. [cite: 122]</p>
                                    <h5>5.2 Medical Emergency or Serious Illness [cite: 123]</h5>
                                    <p>The patient was medically unfit to attend due to an emergency, hospitalization, accident, or serious health condition. [cite: 124] HealthEasy EMI may, at its sole discretion, accept such circumstances as an exception upon review of available evidence. [cite: 125]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header>6. Consequences of Repeated No-Shows</Accordion.Header>
                                <Accordion.Body>
                                    <h5>6.1 Applicability [cite: 127]</h5>
                                    <p>This Policy applies only to appointments booked through the "Book Appointment" functionality available on the HealthEasy EMI platform. [cite: 128]</p>
                                    <h5>6.2 Temporary Booking Restrictions [cite: 129]</h5>
                                    <p>If a patient accumulates three (3) valid Patient No-Shows within any rolling twelve (12) month period, HealthEasy EMI may temporarily suspend the patient's ability to book appointments online through the platform for a period of up to four (4) months. [cite: 130] During such suspension, the patient may still independently contact healthcare providers outside the platform, subject to the provider's policies. [cite: 131]</p>
                                    <h5>6.3 Additional Restrictions [cite: 132]</h5>
                                    <p>Where a patient demonstrates a recurring pattern of missed appointments, misuse of booking services, or conduct adversely affecting healthcare provider availability, HealthEasy EMI reserves the right to impose restrictions after one (1) or two (2) valid Patient No-Shows. [cite: 133]</p>
                                    <p>Such restrictions may include: [cite: 134]</p>
                                    <ul>
                                        <li>Temporary booking limitations; [cite: 135]</li>
                                        <li>Mandatory confirmation requirements; [cite: 136]</li>
                                        <li>Reduced advance booking privileges; [cite: 137]</li>
                                        <li>Temporary suspension of appointment booking functionality. [cite: 138]</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header>7. Refund Policy for Missed Appointments</Accordion.Header>
                                <Accordion.Body>
                                    <p>Refund eligibility for prepaid appointments affected by a Patient No-Show shall be governed by the applicable policies of the concerned doctor, clinic, hospital, or healthcare provider. [cite: 140] HealthEasy EMI acts solely as a technology platform and does not determine, control, guarantee, or process refund decisions made by healthcare providers. [cite: 141] Patients are advised to review the cancellation and refund policies of the relevant healthcare provider before booking appointments. [cite: 142]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header>8. Fraud Prevention and Platform Integrity</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI reserves the right to investigate any activity that appears fraudulent, abusive, misleading, or intended to manipulate appointment availability. [cite: 144] Where misuse is identified, HealthEasy EMI may: [cite: 145]</p>
                                    <ul>
                                        <li>Suspend or terminate user accounts; [cite: 146]</li>
                                        <li>Restrict future bookings; [cite: 147]</li>
                                        <li>Cancel existing appointments; [cite: 148]</li>
                                        <li>Take any other action permitted under applicable law and platform policies. [cite: 149]</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header>9. Dispute Resolution</Accordion.Header>
                                <Accordion.Body>
                                    <p>If a patient disputes a Patient No-Show classification, the patient may contact HealthEasy EMI Customer Support within seven (7) calendar days from receiving notification. [cite: 151] HealthEasy EMI may review: [cite: 152]</p>
                                    <ul>
                                        <li>Appointment records; [cite: 153]</li>
                                        <li>Provider statements; [cite: 154]</li>
                                        <li>Communication logs; [cite: 155]</li>
                                        <li>Patient submissions; [cite: 156]</li>
                                        <li>Any other relevant information. [cite: 157]</li>
                                    </ul>
                                    <p>Following review, HealthEasy EMI's determination shall be final and binding for the purposes of platform administration. [cite: 158] Nothing in this Policy limits any statutory rights available under applicable law. [cite: 159]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header>10. Limitation of Liability</Accordion.Header>
                                <Accordion.Body>
                                    <p>To the fullest extent permitted under applicable law: [cite: 161]</p>
                                    <ul>
                                        <li>HealthEasy EMI shall not be liable for any indirect, incidental, consequential, special, punitive, or exemplary damages arising from the application of this Policy. [cite: 162]</li>
                                        <li>HealthEasy EMI shall not be responsible for appointment availability, provider scheduling decisions, consultation outcomes, or refund determinations made by healthcare providers. [cite: 163]</li>
                                    </ul>
                                    <p>In any event, HealthEasy EMI's aggregate liability arising under this Policy shall not exceed INR 200 (Indian Rupees Two Hundred) or the amount paid by the patient to HealthEasy EMI in connection with the relevant booking, whichever is lower. [cite: 164]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header>11. Policy Modifications</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI reserves the right to amend, modify, update, suspend, or discontinue this Policy at any time. [cite: 165] Any revised version shall become effective upon publication on the HealthEasy EMI website or mobile application. [cite: 167] Continued use of the platform following publication of revised terms constitutes acceptance of the updated Policy. [cite: 168]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header>12. Governing Law and Jurisdiction</Accordion.Header>
                                <Accordion.Body>
                                    <p>This Policy shall be governed by and construed in accordance with the laws of India. [cite: 170] Any disputes arising out of or relating to this Policy shall be subject to the exclusive jurisdiction of the competent courts located in Latur, Maharashtra, India. [cite: 171]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header>13. Additional Platform Disclaimers</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI reserves the right to verify reported Patient No-Shows and take appropriate action to maintain fair access to healthcare services. [cite: 172] Repeated missed appointments may result in temporary booking restrictions in accordance with this Policy. [cite: 173] HealthEasy EMI acts solely as a technology platform and does not guarantee appointment availability or refund approval by healthcare providers. [cite: 174]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                        </Accordion>
                    </div>
                </Container>
            </section>

            <FooterBar />
        </>
    );
}

export default PnsPolicy;