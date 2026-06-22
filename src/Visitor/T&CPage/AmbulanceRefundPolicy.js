import { useEffect, useState } from "react";
import { Container, Accordion, Table } from "react-bootstrap";
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import FooterBar from "../Component/FooterBar";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';

function AmbulanceRefundPolicy() {
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
        document.title = "HealthEasy EMI – Ambulance Cancellation & Refund Policy";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center'>
                    <h2>HealthEasy EMI Ambulance Services – Cancellation & Refund Policy</h2>
                </Container>
            </section>
            
            <section className="py-5 bg-light">
                <Container>
                    <div className="p-4 bg-white border rounded shadow-sm">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header><strong>1. Introduction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>This Cancellation & Refund Policy ("Policy") governs cancellations, refunds, rescheduling requests, and related matters concerning ambulance transportation services booked through HealthEasy EMI Ambulance Services.</p>
                                    <p>HealthEasy EMI Ambulance Services is operated by Arogya Mantra Healthtech Private Limited ("HealthEasy EMI", "Company", "we", "our", or "us").</p>
                                    <p>By booking ambulance services through our website, mobile application, customer support channels, or any authorized platform, you agree to be bound by this Policy.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header><strong>2. Scope of Policy</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>This Policy applies to all ambulance transportation services facilitated through the Platform, including:</p>
                                    <ul>
                                        <li>Advanced Life Support (ALS) Ambulances;</li>
                                        <li>Basic Life Support (BLS) Ambulances;</li>
                                        <li>ICU Ambulances;</li>
                                        <li>Neonatal Ambulances;</li>
                                        <li>Cardiac Ambulances;</li>
                                        <li>Mortuary and Hearse Services;</li>
                                        <li>Inter-Hospital Transfers;</li>
                                        <li>Scheduled Medical Transportation;</li>
                                        <li>Non-Emergency Patient Transfers;</li>
                                        <li>Healthcare Transport Subscription Plans;</li>
                                        <li>EMI or Financing-Based Transportation Services.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header><strong>3. Booking Confirmation</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>A booking shall be deemed confirmed only when:</p>
                                    <ul>
                                        <li>A booking reference number is generated; and</li>
                                        <li>Confirmation is communicated through SMS, email, telephone, WhatsApp, mobile application, or other authorized communication channels.</li>
                                    </ul>
                                    <p>All bookings remain subject to:</p>
                                    <ul>
                                        <li>Ambulance availability;</li>
                                        <li>Ambulance partner acceptance;</li>
                                        <li>Serviceability of the requested location;</li>
                                        <li>Operational feasibility.</li>
                                    </ul>
                                    <p>Estimated arrival times are indicative only and may vary due to traffic, weather, road conditions, emergencies, or other circumstances beyond reasonable control.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header><strong>4. Customer Cancellation Policy</strong></Accordion.Header>
                                <Accordion.Body>
                                    <h6>4.1 Immediate Ambulance Bookings</h6>
                                    <p>Users may cancel a booking without charge if:</p>
                                    <ul>
                                        <li>Cancellation occurs within three (3) minutes of booking; and</li>
                                        <li>No ambulance has been dispatched.</li>
                                    </ul>
                                    <p>Once an ambulance has been dispatched, cancellation charges may apply.</p>
                                    
                                    <h6>4.2 Scheduled Ambulance Bookings</h6>
                                    <p>For scheduled ambulance services:</p>
                                    <ul>
                                        <li>Cancellation more than one (1) hour before pickup time: No cancellation charges.</li>
                                        <li>Cancellation within one (1) hour before scheduled pickup: Cancellation charges may apply as described below.</li>
                                    </ul>
                                    
                                    <h6>4.3 Rescheduling Requests</h6>
                                    <p>Where operationally feasible, HealthEasy EMI may permit rescheduling of ambulance bookings.</p>
                                    <p>Rescheduling requests are subject to:</p>
                                    <ul>
                                        <li>Ambulance availability;</li>
                                        <li>Route feasibility;</li>
                                        <li>Ambulance partner acceptance.</li>
                                    </ul>
                                    <p>HealthEasy EMI does not guarantee rescheduling availability.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header><strong>5. Cancellation Charges</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The following cancellation charges may apply:</p>
                                    <Table striped bordered hover responsive size="sm" className="bg-white">
                                        <thead>
                                            <tr>
                                                <th>Cancellation Stage</th>
                                                <th>Applicable Charge</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Within 3 minutes and before dispatch</td>
                                                <td>Nil</td>
                                            </tr>
                                            <tr>
                                                <td>Ambulance dispatched but not arrived</td>
                                                <td>₹50 to ₹300 or actual dispatch cost, whichever is higher</td>
                                            </tr>
                                            <tr>
                                                <td>Ambulance arrived at pickup location</td>
                                                <td>Full base fare</td>
                                            </tr>
                                            <tr>
                                                <td>Scheduled booking cancelled within 1 hour of pickup</td>
                                                <td>Up to 25% of estimated fare</td>
                                            </tr>
                                            <tr>
                                                <td>No-Show by User</td>
                                                <td>Full applicable fare</td>
                                            </tr>
                                            <tr>
                                                <td>Subscription/EMI Plans</td>
                                                <td>Subject to applicable plan terms</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                    <p>Cancellation charges may vary depending on:</p>
                                    <ul>
                                        <li>Ambulance type;</li>
                                        <li>Distance already travelled;</li>
                                        <li>Time elapsed;</li>
                                        <li>Resources allocated;</li>
                                        <li>Emergency service category.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header><strong>6. No-Show Policy</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>A booking shall be considered a No-Show if:</p>
                                    <ul>
                                        <li>The ambulance reaches the designated pickup location and the patient is unavailable;</li>
                                        <li>The patient or representative cannot be contacted after reasonable attempts;</li>
                                        <li>Incorrect pickup information is provided;</li>
                                        <li>The patient refuses transportation after ambulance arrival;</li>
                                        <li>Access to the patient location is not possible due to incorrect details supplied by the User.</li>
                                    </ul>
                                    <p>In such circumstances:</p>
                                    <ul>
                                        <li>Full fare may be charged;</li>
                                        <li>No refund shall be payable;</li>
                                        <li>Repeated incidents may result in account restrictions.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header><strong>7. Ambulance Partner or System-Initiated Cancellation</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI or the assigned Ambulance Partner may cancel a booking due to:</p>
                                    <ul>
                                        <li>Vehicle breakdown;</li>
                                        <li>Medical emergency redeployment;</li>
                                        <li>Driver unavailability;</li>
                                        <li>Force majeure events;</li>
                                        <li>Natural disasters;</li>
                                        <li>Public safety concerns;</li>
                                        <li>Regulatory restrictions;</li>
                                        <li>Incorrect booking information;</li>
                                        <li>Technical failures.</li>
                                    </ul>
                                    <p>Where such cancellation occurs before commencement of service:</p>
                                    <ul>
                                        <li>Any prepaid amount shall be refunded in full; or</li>
                                        <li>An alternate ambulance may be arranged where available.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header><strong>8. Refund Eligibility</strong></Accordion.Header>
                                <Accordion.Body>
                                    <h6>Eligible Refund Scenarios</h6>
                                    <ul>
                                        <li>Cancellation within the free cancellation period;</li>
                                        <li>Duplicate payment transactions;</li>
                                        <li>Duplicate bookings caused by technical errors;</li>
                                        <li>Payment deducted but booking not confirmed;</li>
                                        <li>Ambulance partner cancellation;</li>
                                        <li>Service unavailable after payment collection;</li>
                                        <li>Billing errors verified by HealthEasy EMI.</li>
                                    </ul>
                                    <h6>Non-Refundable Scenarios</h6>
                                    <p>Refunds will generally not be issued for:</p>
                                    <ul>
                                        <li>No-show events;</li>
                                        <li>Incorrect booking information provided by the User;</li>
                                        <li>Cancellation after service commencement;</li>
                                        <li>Ambulance arrival at pickup location;</li>
                                        <li>Refusal of transportation after dispatch;</li>
                                        <li>Delays caused by traffic, weather, or external circumstances.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header><strong>9. EMI and Healthcare Financing Refunds</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Where payments have been made through:</p>
                                    <ul>
                                        <li>EMI facilities;</li>
                                        <li>Healthcare financing programs;</li>
                                        <li>Lending partners;</li>
                                        <li>Medical credit facilities;</li>
                                    </ul>
                                    <p>refund processing shall additionally be governed by the policies of the respective lender or financing institution.</p>
                                    <p>HealthEasy EMI cannot guarantee timelines controlled by third-party financial institutions.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header><strong>10. Refund Processing Timelines</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Approved refunds shall generally be processed as follows:</p>
                                    <Table striped bordered hover responsive size="sm" className="bg-white">
                                        <thead>
                                            <tr>
                                                <th>Payment Method</th>
                                                <th>Estimated Processing Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>UPI</td>
                                                <td>3–7 Business Days</td>
                                            </tr>
                                            <tr>
                                                <td>Debit Card</td>
                                                <td>5–10 Business Days</td>
                                            </tr>
                                            <tr>
                                                <td>Credit Card</td>
                                                <td>5–10 Business Days</td>
                                            </tr>
                                            <tr>
                                                <td>Net Banking</td>
                                                <td>5–10 Business Days</td>
                                            </tr>
                                            <tr>
                                                <td>Wallet Payments</td>
                                                <td>3–7 Business Days</td>
                                            </tr>
                                            <tr>
                                                <td>EMI / Financing Transactions</td>
                                                <td>7–14 Business Days or as per lender policy</td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                    <p>Actual timelines may vary depending upon banking systems and payment service providers.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header><strong>11. Disputed Charges</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Users who believe a cancellation fee or refund determination is incorrect may submit a dispute request.</p>
                                    <p>HealthEasy EMI may request:</p>
                                    <ul>
                                        <li>Booking details;</li>
                                        <li>Transaction records;</li>
                                        <li>Communication history;</li>
                                        <li>Supporting documentation.</li>
                                    </ul>
                                    <p>All decisions following investigation shall be final and binding, subject to applicable law.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header><strong>12. Force Majeure</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI shall not be liable for delays, cancellations, or service disruptions arising from circumstances beyond reasonable control, including:</p>
                                    <ul>
                                        <li>Natural disasters;</li>
                                        <li>Floods;</li>
                                        <li>Earthquakes;</li>
                                        <li>Pandemics;</li>
                                        <li>Government restrictions;</li>
                                        <li>Civil disturbances;</li>
                                        <li>Road closures;</li>
                                        <li>Traffic emergencies;</li>
                                        <li>Communication failures;</li>
                                        <li>Power outages.</li>
                                    </ul>
                                    <p>Where feasible, HealthEasy EMI shall make reasonable efforts to assist Users with alternate arrangements.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header><strong>13. Fraudulent Bookings and Misuse</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI reserves the right to:</p>
                                    <ul>
                                        <li>Suspend accounts;</li>
                                        <li>Recover losses;</li>
                                        <li>Restrict future bookings;</li>
                                        <li>Initiate legal proceedings against Users involved in:</li>
                                    </ul>
                                    <ul>
                                        <li>False emergency requests;</li>
                                        <li>Fraudulent transactions;</li>
                                        <li>Repeated misuse of services;</li>
                                        <li>Abuse of ambulance personnel;</li>
                                        <li>Intentional non-payment.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="13">
                                <Accordion.Header><strong>14. Limitation of Liability</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>To the maximum extent permitted under applicable law:</p>
                                    <p>HealthEasy EMI's liability relating to cancellations, refunds, booking disputes, or payment issues shall not exceed the amount paid by the User for the specific booking giving rise to the claim.</p>
                                    <p>HealthEasy EMI shall not be liable for any indirect, incidental, consequential, special, or punitive damages.</p>
                                    <p>Nothing in this Policy limits liability that cannot be excluded under applicable law.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="14">
                                <Accordion.Header><strong>15. Amendments</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may update or modify this Policy at any time.</p>
                                    <p>The updated version shall become effective immediately upon publication on the Platform.</p>
                                    <p>Continued use of the Services constitutes acceptance of the revised Policy.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="15">
                                <Accordion.Header><strong>16. Governing Law and Jurisdiction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>This Policy shall be governed by and interpreted in accordance with the laws of India.</p>
                                    <p>Any dispute arising from or relating to this Policy shall be subject to the exclusive jurisdiction of the competent courts located in Pune, Maharashtra, India.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="16">
                                <Accordion.Header><strong>17. Contact Information</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI Ambulance Services<br />
                                    Arogya Mantra Healthtech Private Limited<br />
                                    Email: support@healtheasyemi.com<br />
                                    Customer Support: +91-8855919195<br />
                                    Website: www.healtheasyemi.com<br />
                                    Registered Office: Office no.23, 3rd Floor, Aston Plaza, Narhe Ambegaon Rd, above Star Bazaar, Ambegaon Budruk, Pune, Maharashtra 411046</p>
                                </Accordion.Body>
                            </Accordion.Item>

                        </Accordion>

                        {/* BOTTOM DISCLAIMER NOTE */}
                        <div className="mt-4 p-3 bg-light border rounded small text-muted">
                            <p>Cancellation & Refund Notice: Ambulance bookings may be subject to cancellation charges once dispatch has commenced or the ambulance has arrived at the pickup location. Refund eligibility depends on booking status, service utilization, payment method, and applicable partner policies. Users are encouraged to review the full Cancellation & Refund Policy before confirming a booking.</p>
                        </div>

                    </div>
                </Container>
            </section>

            <FooterBar />
        </>
    );
}

export default AmbulanceRefundPolicy;