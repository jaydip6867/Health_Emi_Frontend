import { useEffect, useState } from "react";
import FooterBar from "../Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../../config'
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import { Container, Accordion } from "react-bootstrap";

function PnsPolicy() {
    var navigate = useNavigate();

    const [logdata, setlogdata] = useState(null)
    const [token, settoken] = useState(null)

    useEffect(() => {
        var pgetlocaldata = localStorage.getItem(STORAGE_KEYS.PATIENT);
        var dgetlocaldata = localStorage.getItem(STORAGE_KEYS.DOCTOR);
        if (pgetlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(pgetlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
            setlogdata(data.userData);
        }
        else if (dgetlocaldata != null) {
            const bytes = CryptoJS.AES.decrypt(dgetlocaldata, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            var data = JSON.parse(decrypted);
            setlogdata(data.doctorData);
        }
        if (data) {
            settoken(`Bearer ${data.accessToken}`)
        }
    }, [navigate])

    useEffect(() => {
        document.title = "Patient No-Show (PNS) Policy"
    }, [])
    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>Patient No-Show (PNS) Policy</h2>
                </Container>
            </section>
            <section className="py-5">
                <Container>
                    <div className="p-3 border rounded">
                        <p>Missed appointments, also known as Patient No-Shows (PNS), are a significant challenge within India’s healthcare ecosystem. Given the limited availability of healthcare professionals and the increasing demand for medical services, no-shows can result in inefficiencies and delay timely care for other patients.
                        </p>
                        <p>To promote responsible use of its platform and ensure fair access to healthcare services, <strong>Healtheasy EMI</strong> has established this
                            <strong>Patient No-Show (PNS) Policy</strong>.
                        </p>
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>What Is a Patient No-Show (PNS)?</Accordion.Header>
                                <Accordion.Body>
                                    <p>A Patient No-Show refers to any situation in which a patient fails to attend a confirmed appointment booked through Healtheasyemi.com or the Healtheasy EMI mobile application, without:</p>
                                    <ul className="list_disc">
                                        <li>Cancelling the appointment,</li>
                                        <li>Rescheduling the appointment in advance, or</li>
                                        <li>Informing the concerned clinic or doctor prior to the scheduled time.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header>How PNS Is Recorded</Accordion.Header>
                                <Accordion.Body>
                                    <strong>
                                        1. Marking No-Shows by Doctors or Clinics
                                    </strong>
                                    <p>Doctors and clinics using Healtheasy EMI’s practice software may mark an appointment as a PNS if the patient does not appear at the scheduled time without prior intimation. This status must be updated within <strong>five (5) days</strong> of the appointment date through the desktop application.
                                    </p>

                                    <strong>
                                        2. Verifying No-Shows with Patients
                                    </strong>
                                    <p>After a doctor or clinic marks a PNS:</p>
                                    <ul className="list_disc">
                                        <li>The patient receives an SMS and email notification requesting confirmation and a brief reason for missing the appointment.</li>
                                        <li>The patient is required to respond within seven (7) days of receiving this communication.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>Actions on Repeat No-Shows</Accordion.Header>
                                <Accordion.Body>
                                    <p>To maintain doctor availability and discourage repeated missed appointments, Healtheasy EMI enforces the following measures:</p>


                                    <table className="table table-bordered privacy-table">
                                        <tbody>
                                            <tr>
                                                <th className="section-title">1. Applicability</th>
                                                <td>
                                                    This policy applies exclusively to patients who book appointments using the <strong>“Book Appointment”</strong> feature on the Healtheasy EMI platform.
                                                </td>
                                            </tr>
                                            <tr>
                                                <th className="section-title">2. Temporary Account Suspension After Three (3) Valid PNS Instances:</th>
                                                <td>
                                                    If a patient accumulates <strong>three (3)</strong> valid PNS incidents within a 12-month period, their Healtheasy EMI account will be temporarily suspended from making online appointment bookings for <strong>four (4)</strong> months. <br></br>
                                                    During this period, the patient may still contact clinics directly through <strong>Healtheasyemi.com</strong> to request appointments.

                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header>What Qualifies as a Valid PNS</Accordion.Header>
                                <Accordion.Body>
                                    <p>A Patient No-Show will be considered valid under any of the following circumstances:</p>
                                    <ul className="list_disc">
                                        <li>
                                            No response is received from the patient within
                                            <strong> seven (7) days</strong> of the PNS notification
                                            (via SMS or email).
                                        </li>
                                        <li>
                                            The patient confirms any of the following reasons:
                                            <ul className="list_disc">
                                                <li>Forgot the appointment</li>
                                                <li>Consulted another doctor or platform</li>
                                                <li>Was occupied with other work</li>
                                                <li>
                                                    Any other reason deemed valid at
                                                    <strong> Healtheasy EMI</strong>’s sole discretion
                                                </li>
                                            </ul>
                                        </li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header>What Does Not Qualify as a Valid PNS</Accordion.Header>
                                <Accordion.Body>
                                    <p>A PNS will be considered invalid under the following conditions:</p>
                                    <ul className="list_disc">
                                        <li>
                                            The patient asserts that they attended the appointment but were incorrectly marked as a no-show. Such claims will be investigated by Healtheasy EMI’s support team.
                                        </li>
                                        <li>
                                            The patient was medically unfit or too unwell to attend the appointment. This may be accepted as a one-time exception only.
                                        </li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header>Immediate Restrictions Based on History</Accordion.Header>
                                <Accordion.Body>
                                    <p>If a patient has a past record of frequent no-shows, Healtheasy EMI reserves the right to temporarily suspend online appointment bookings even after one (1) or two (2) PNS incidents.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header>Refund Policy for PNS</Accordion.Header>
                                <Accordion.Body>
                                    <p>Refunds for prepaid appointments where a PNS has been recorded are entirely at the discretion of the treating doctor or clinic.</p>
                                    <p>Healtheasy EMI does not manage or intervene in refund processes related to missed appointments.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header>Dispute Resolution and Liability</Accordion.Header>
                                <Accordion.Body>
                                    <ul className="list_disc">
                                        <li>
                                            In the event of any dispute or conflicting claims, Healtheasy EMI reserves the exclusive right to make the final decision.
                                        </li>
                                        <li>
                                            The maximum liability of Healtheasy EMI under this policy shall not exceed INR 200 for any claim arising hereunder.
                                        </li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header>Policy Updates</Accordion.Header>
                                <Accordion.Body>
                                    <p>Healtheasy EMI reserves the right to amend, update, or modify this Patient No-Show Policy at any time, without prior notice.</p>
                                    <p>Patients are encouraged to review this policy periodically to remain informed about any changes.</p>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </div>
                </Container>
            </section>

            <FooterBar />
        </>
    )
}
export default PnsPolicy