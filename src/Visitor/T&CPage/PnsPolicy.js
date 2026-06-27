import { useEffect, useState } from "react";
import { Container, Accordion } from "react-bootstrap";
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import FooterBar from "../Component/FooterBar";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';

function PnsPolicy() {
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
                <Container className='text-center'>
                    <h2>Patient No-Show (PNS) Policy</h2>
                </Container>
            </section>
            
            <section className="py-5 bg-light">
                <Container>
                    <div className="p-4 bg-white border rounded shadow-sm">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header><strong>1. Overview</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI is committed to improving access to healthcare services by facilitating timely appointments between patients and healthcare providers. Missed appointments reduce the availability of healthcare professionals, create scheduling inefficiencies, and may delay medical care for other patients.</p>
                                    <p>To promote responsible use of the platform and ensure fair access to healthcare services, HealthEasy EMI has established this Patient No-Show ("PNS") Policy.</p>
                                    <p>This Policy applies to all patients using appointment booking services through the HealthEasy EMI website and mobile application.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header><strong>2. Definition of Patient No-Show (PNS)</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>A Patient No-Show occurs when a patient books a confirmed appointment through HealthEasy EMI and:</p>
                                    <ul>
                                        <li>Fails to attend the scheduled appointment; and</li>
                                        <li>Does not cancel the appointment in advance; and</li>
                                        <li>Does not reschedule the appointment before the scheduled appointment time; and</li>
                                        <li>Does not notify the doctor, clinic, or healthcare provider prior to the appointment.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header><strong>3. Recording and Verification of No-Shows</strong></Accordion.Header>
                                <Accordion.Body>
                                    <h6>3.1 Reporting by Doctors and Clinics</h6>
                                    <p>Healthcare providers using HealthEasy EMI's appointment management systems may mark an appointment as a Patient No-Show if the patient does not attend the scheduled appointment without prior notice.</p>
                                    <p>The healthcare provider must update the appointment status within five (5) calendar days from the scheduled appointment date.</p>
                                    
                                    <h6>3.2 Patient Verification Process</h6>
                                    <p>Once a Patient No-Show is reported:</p>
                                    <ul>
                                        <li>HealthEasy EMI may notify the patient through SMS, email, in-app notification, phone call, or any other communication channel available on record.</li>
                                        <li>The patient may be requested to confirm whether the appointment was missed and provide a reason for non-attendance.</li>
                                        <li>The patient should respond within seven (7) calendar days from the date of notification.</li>
                                    </ul>
                                    <p>Failure to respond within the prescribed period may result in the No-Show being treated as valid.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header><strong>4. Valid Patient No-Shows</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>A Patient No-Show may be classified as valid under any of the following circumstances:</p>
                                    <h6>4.1 Non-Response</h6>
                                    <p>The patient fails to respond within seven (7) calendar days after receiving a notification regarding the reported No-Show.</p>
                                    
                                    <h6>4.2 Patient Confirmation</h6>
                                    <p>The patient confirms that the appointment was missed due to reasons including but not limited to:</p>
                                    <ul>
                                        <li>Forgetting the appointment;</li>
                                        <li>Scheduling conflicts;</li>
                                        <li>Being occupied with personal or professional commitments;</li>
                                        <li>Choosing to consult another healthcare provider;</li>
                                        <li>Deciding not to proceed with the consultation;</li>
                                        <li>Any other reason that HealthEasy EMI reasonably determines to constitute a valid No-Show.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header><strong>5. Invalid Patient No-Shows</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>A reported Patient No-Show may be treated as invalid where:</p>
                                    <h6>5.1 Incorrect Marking</h6>
                                    <p>The patient reasonably demonstrates that they attended the appointment and were incorrectly marked as absent.</p>
                                    <p>HealthEasy EMI may investigate such cases and request supporting information from the patient and healthcare provider before making a determination.</p>
                                    
                                    <h6>5.2 Medical Emergency or Serious Illness</h6>
                                    <p>The patient was medically unfit to attend due to an emergency, hospitalization, accident, or serious health condition.</p>
                                    <p>HealthEasy EMI may, at its sole discretion, accept such circumstances as an exception upon review of available evidence.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header><strong>6. Consequences of Repeated No-Shows</strong></Accordion.Header>
                                <Accordion.Body>
                                    <h6>6.1 Applicability</h6>
                                    <p>This Policy applies only to appointments booked through the "Book Appointment" functionality available on the HealthEasy EMI platform.</p>
                                    
                                    <h6>6.2 Temporary Booking Restrictions</h6>
                                    <p>If a patient accumulates three (3) valid Patient No-Shows within any rolling twelve (12) month period, HealthEasy EMI may temporarily suspend the patient's ability to book appointments online through the platform for a period of up to four (4) months.</p>
                                    <p>During such suspension, the patient may still independently contact healthcare providers outside the platform, subject to the provider's policies.</p>
                                    
                                    <h6>6.3 Additional Restrictions</h6>
                                    <p>Where a patient demonstrates a recurring pattern of missed appointments, misuse of booking services, or conduct adversely affecting healthcare provider availability, HealthEasy EMI reserves the right to impose restrictions after one (1) or two (2) valid Patient No-Shows.</p>
                                    <p>Such restrictions may include:</p>
                                    <ul>
                                        <li>Temporary booking limitations;</li>
                                        <li>Mandatory confirmation requirements;</li>
                                        <li>Reduced advance booking privileges;</li>
                                        <li>Temporary suspension of appointment booking functionality.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header><strong>7. Refund Policy for Missed Appointments</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Refund eligibility for prepaid appointments affected by a Patient No-Show shall be governed by the applicable policies of the concerned doctor, clinic, hospital, or healthcare provider.</p>
                                    <p>HealthEasy EMI acts solely as a technology platform and does not determine, control, guarantee, or process refund decisions made by healthcare providers.</p>
                                    <p>Patients are advised to review the cancellation and refund policies of the relevant healthcare provider before booking appointments.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header><strong>8. Fraud Prevention and Platform Integrity</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI reserves the right to investigate any activity that appears fraudulent, abusive, misleading, or intended to manipulate appointment availability.</p>
                                    <p>Where misuse is identified, HealthEasy EMI may:</p>
                                    <ul>
                                        <li>Suspend or terminate user accounts;</li>
                                        <li>Restrict future bookings;</li>
                                        <li>Cancel existing appointments;</li>
                                        <li>Take any other action permitted under applicable law and platform policies.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header><strong>9. Dispute Resolution</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>If a patient disputes a Patient No-Show classification, the patient may contact HealthEasy EMI Customer Support within seven (7) calendar days from receiving notification.</p>
                                    <p>HealthEasy EMI may review:</p>
                                    <ul>
                                        <li>Appointment records;</li>
                                        <li>Provider statements;</li>
                                        <li>Communication logs;</li>
                                        <li>Patient submissions;</li>
                                        <li>Any other relevant information.</li>
                                    </ul>
                                    <p>Following review, HealthEasy EMI's determination shall be final and binding for the purposes of platform administration.</p>
                                    <p>Nothing in this Policy limits any statutory rights available under applicable law.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header><strong>10. Limitation of Liability</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>To the fullest extent permitted under applicable law:</p>
                                    <ul>
                                        <li>HealthEasy EMI shall not be liable for any indirect, incidental, consequential, special, punitive, or exemplary damages arising from the application of this Policy.</li>
                                        <li>HealthEasy EMI shall not be responsible for appointment availability, provider scheduling decisions, consultation outcomes, or refund determinations made by healthcare providers.</li>
                                    </ul>
                                    <p>In any event, HealthEasy EMI's aggregate liability arising under this Policy shall not exceed INR 200 (Indian Rupees Two Hundred) or the amount paid by the patient to HealthEasy EMI in connection with the relevant booking, whichever is lower.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header><strong>11. Policy Modifications</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI reserves the right to amend, modify, update, suspend, or discontinue this Policy at any time.</p>
                                    <p>Any revised version shall become effective upon publication on the HealthEasy EMI website or mobile application.</p>
                                    <p>Continued use of the platform following publication of revised terms constitutes acceptance of the updated Policy.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header><strong>12. Governing Law and Jurisdiction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>This Policy shall be governed by and construed in accordance with the laws of India.</p>
                                    <p>Any disputes arising out of or relating to this Policy shall be subject to the exclusive jurisdiction of the competent courts located in Latur, Maharashtra, India.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                        </Accordion>

                        {/* BOTTOM DISCLAIMER NOTE */}
                        <div className="mt-4 p-3 bg-light border rounded small text-muted">
                            <p>HealthEasy EMI reserves the right to verify reported Patient No-Shows and take appropriate action to maintain fair access to healthcare services. Repeated missed appointments may result in temporary booking restrictions in accordance with this Policy. HealthEasy EMI acts solely as a technology platform and does not guarantee appointment availability or refund approval by healthcare providers.</p>
                        </div>

                    </div>
                </Container>
            </section>

            <FooterBar />
        </>
    );
}

export default PnsPolicy;