import { useEffect, useState } from "react";
import FooterBar from "../Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import { Container, Accordion, Table } from "react-bootstrap";

function AmbulanceRefundPolicy() {
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
        document.title = "HealthEasy EMI – Ambulance Services Cancellation & Refund Policy";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>HealthEasy EMI Ambulance Services – Cancellation & Refund Policy</h2>
                </Container>
            </section>
            
            <section className="py-5">
                <Container>
                    <div className="p-3 border rounded">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>1. Introduction</Accordion.Header>
                                <Accordion.Body>
                                    <p>This Cancellation & Refund Policy ("Policy") governs cancellations, refunds, rescheduling requests, and related matters concerning ambulance transportation services booked through HealthEasy EMI Ambulance Services[cite: 1266]. HealthEasy EMI Ambulance Services is operated by Arogya Mantra Healthtech Private Limited ("HealthEasy EMI", "Company", "we", "our", or "us")[cite: 1267]. By booking ambulance services through our website, mobile application, customer support channels, or any authorized platform, you agree to be bound by this Policy[cite: 1268].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header>2. Scope of Policy</Accordion.Header>
                                <Accordion.Body>
                                    <p>This Policy applies to all ambulance transportation services facilitated through the Platform, including[cite: 1270]:</p>
                                    <ul>
                                        <li>Advanced Life Support (ALS) Ambulances; [cite: 1271]</li>
                                        <li>Basic Life Support (BLS) Ambulances; [cite: 1272]</li>
                                        <li>ICU Ambulances; [cite: 1273]</li>
                                        <li>Neonatal Ambulances; [cite: 1274]</li>
                                        <li>Cardiac Ambulances; [cite: 1275]</li>
                                        <li>Mortuary and Hearse Services; [cite: 1276]</li>
                                        <li>Inter-Hospital Transfers; [cite: 1277]</li>
                                        <li>Scheduled Medical Transportation; [cite: 1278]</li>
                                        <li>Non-Emergency Patient Transfers; [cite: 1279]</li>
                                        <li>Healthcare Transport Subscription Plans; [cite: 1280]</li>
                                        <li>EMI or Financing-Based Transportation Services. [cite: 1281]</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>3. Booking Confirmation</Accordion.Header>
                                <Accordion.Body>
                                    <p>A booking shall be deemed confirmed only when[cite: 1283]:</p>
                                    <ul>
                                        <li>A booking reference number is generated; and [cite: 1284]</li>
                                        <li>Confirmation is communicated through SMS, email, telephone, WhatsApp, mobile application, or other authorized communication channels. [cite: 1285]</li>
                                    </ul>
                                    <p>All bookings remain subject to ambulance availability, ambulance partner acceptance, serviceability of the requested location, and operational feasibility[cite: 1286, 1287, 1288, 1289, 1290]. Estimated arrival times are indicative only and may vary due to traffic, weather, road conditions, emergencies, or other circumstances beyond reasonable control[cite: 1291].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header>4. Customer Cancellation Policy & Rescheduling</Accordion.Header>
                                <Accordion.Body>
                                    <h5>4.1 Immediate Ambulance Bookings</h5>
                                    <p>Users may cancel a booking without charge if cancellation occurs within three (3) minutes of booking; and no ambulance has been dispatched[cite: 1294, 1295, 1296]. Once an ambulance has been dispatched, cancellation charges may apply[cite: 1297].</p>
                                    
                                    <h5>4.2 Scheduled Ambulance Bookings</h5>
                                    <p>For scheduled ambulance services[cite: 1299]:</p>
                                    <ul>
                                        <li>Cancellation more than one (1) hour before pickup time: No cancellation charges. [cite: 1300]</li>
                                        <li>Cancellation within one (1) hour before scheduled pickup: Cancellation charges may apply as described below. [cite: 1301]</li>
                                    </ul>
                                    
                                    <h5>4.3 Rescheduling Requests</h5>
                                    <p>Where operationally feasible, HealthEasy EMI may permit rescheduling of ambulance bookings[cite: 1303]. Rescheduling requests are subject to ambulance availability, route feasibility, and ambulance partner acceptance[cite: 1304, 1305, 1306, 1307]. HealthEasy EMI does not guarantee rescheduling availability[cite: 1308].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header>5. Cancellation Charges</Accordion.Header>
                                <Accordion.Body>
                                    <p>The following cancellation charges may apply[cite: 1309]:</p>
                                    <Table striped bordered hover responsive>
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
                                    <p>Cancellation charges may vary depending on ambulance type, distance already travelled, time elapsed, resources allocated, and emergency service category[cite: 1312, 1313, 1314, 1315, 1316, 1317].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header>6. No-Show Policy</Accordion.Header>
                                <Accordion.Body>
                                    <p>A booking shall be considered a No-Show if[cite: 1319]:</p>
                                    <ul>
                                        <li>The ambulance reaches the designated pickup location and the patient is unavailable; [cite: 1320]</li>
                                        <li>The patient or representative cannot be contacted after reasonable attempts; [cite: 1321]</li>
                                        <li>Incorrect pickup information is provided; [cite: 1322]</li>
                                        <li>The patient refuses transportation after ambulance arrival; [cite: 1323]</li>
                                        <li>Access to the patient location is not possible due to incorrect details supplied by the User. [cite: 1324]</li>
                                    </ul>
                                    <p>In such circumstances full fare may be charged, no refund shall be payable, and repeated incidents may result in account restrictions[cite: 1325, 1326, 1327, 1328].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header>7. Ambulance Partner or System-Initiated Cancellation</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI or the assigned Ambulance Partner may cancel a booking due to vehicle breakdown, medical emergency redeployment, driver unavailability, force majeure events, natural disasters, public safety concerns, regulatory restrictions, incorrect booking information, or technical failures[cite: 1329, 1331, 1332, 1333, 1334, 1335, 1336, 1337, 1338, 1339]. Where such cancellation occurs before commencement of service, any prepaid amount shall be refunded in full, or an alternate ambulance may be arranged where available[cite: 1340, 1341, 1342].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header>8. Refund Eligibility</Accordion.Header>
                                <Accordion.Body>
                                    <p>Refunds may be issued under the following circumstances[cite: 1343]:</p>
                                    <h6>Eligible Refund Scenarios</h6>
                                    <ul>
                                        <li>Cancellation within the free cancellation period; [cite: 1346]</li>
                                        <li>Duplicate payment transactions; [cite: 1347]</li>
                                        <li>Duplicate bookings caused by technical errors; [cite: 1348]</li>
                                        <li>Payment deducted but booking not confirmed; [cite: 1349]</li>
                                        <li>Ambulance partner cancellation; [cite: 1350]</li>
                                        <li>Service unavailable after payment collection; [cite: 1351]</li>
                                        <li>Billing errors verified by HealthEasy EMI. [cite: 1352]</li>
                                    </ul>
                                    <h6>Non-Refundable Scenarios</h6>
                                    <p>Refunds will generally not be issued for[cite: 1353, 1354]:</p>
                                    <ul>
                                        <li>No-show events; [cite: 1355]</li>
                                        <li>Incorrect booking information provided by the User; [cite: 1356]</li>
                                        <li>Cancellation after service commencement; [cite: 1357]</li>
                                        <li>Ambulance arrival at pickup location; [cite: 1358]</li>
                                        <li>Refusal of transportation after dispatch; [cite: 1359]</li>
                                        <li>Delays caused by traffic, weather, or external circumstances. [cite: 1360]</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header>9. EMI and Healthcare Financing Refunds</Accordion.Header>
                                <Accordion.Body>
                                    <p>Where payments have been made through EMI facilities, healthcare financing programs, lending partners, or medical credit facilities, refund processing shall additionally be governed by the policies of the respective lender or financing institution[cite: 1361, 1362, 1363, 1364, 1365, 1366, 1367]. HealthEasy EMI cannot guarantee timelines controlled by third-party financial institutions[cite: 1368].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header>10. Refund Processing Timelines</Accordion.Header>
                                <Accordion.Body>
                                    <p>Approved refunds shall generally be processed as follows[cite: 1369, 1370]:</p>
                                    <Table striped bordered hover responsive>
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
                                    <p>Actual timelines may vary depending upon banking systems and payment service providers[cite: 1372].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header>11. Disputed Charges</Accordion.Header>
                                <Accordion.Body>
                                    <p>Users who believe a cancellation fee or refund determination is incorrect may submit a dispute request[cite: 1374]. HealthEasy EMI may request booking details, transaction records, communication history, and supporting documentation[cite: 1375, 1376, 1377, 1378, 1379]. All decisions following investigation shall be final and binding, subject to applicable law[cite: 1380].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header>12. Force Majeure</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI shall not be liable for delays, cancellations, or service disruptions arising from circumstances beyond reasonable control, including natural disasters, floods, earthquakes, pandemics, government restrictions, civil disturbances, road closures, traffic emergencies, communication failures, or power outages[cite: 1381, 1382, 1383, 1384, 1385, 1386, 1387, 1388, 1389, 1390, 1391, 1392]. Where feasible, HealthEasy EMI shall make reasonable efforts to assist Users with alternate arrangements[cite: 1393].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header>13. Fraudulent Bookings and Misuse</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI reserves the right to suspend accounts, recover losses, restrict future bookings, or initiate legal proceedings against Users involved in false emergency requests, fraudulent transactions, repeated misuse of services, abuse of ambulance personnel, or intentional non-payment[cite: 1394, 1395, 1396, 1397, 1398, 1399, 1400, 1401, 1402, 1403, 1404, 1405].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="13">
                                <Accordion.Header>14. Limitation of Liability & Amendments</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>Limitation of Liability:</strong> To the maximum extent permitted under applicable law, HealthEasy EMI's liability relating to cancellations, refunds, booking disputes, or payment issues shall not exceed the amount paid by the User for the specific booking giving rise to the claim[cite: 1406, 1408]. HealthEasy EMI shall not be liable for any indirect, incidental, consequential, special, or punitive damages[cite: 1409]. Nothing in this Policy limits liability that cannot be excluded under applicable law[cite: 1410].</p>
                                    <p><strong>Amendments:</strong> HealthEasy EMI may update or modify this Policy at any time[cite: 1412]. The updated version shall become effective immediately upon publication on the Platform[cite: 1413]. Continued use of the Services constitutes acceptance of the revised Policy[cite: 1414].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="14">
                                <Accordion.Header>15. Governing Law and Jurisdiction</Accordion.Header>
                                <Accordion.Body>
                                    <p>This Policy shall be governed by and interpreted in accordance with the laws of India[cite: 1416]. Any dispute arising from or relating to this Policy shall be subject to the exclusive jurisdiction of the competent courts located in Pune, Maharashtra, India[cite: 1417].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="15">
                                <Accordion.Header>16. Contact Information & Final Notice</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI Ambulance Services Arogya Mantra Healthtech Private Limited<br />
                                    Email: support@healtheasyemi.com<br />
                                    Customer Support: +91-8855919195<br />
                                    Website: www.healtheasyemi.com<br />
                                    Registered Office: Office no.23, 3rd Floor, Aston Plaza, Narhe Ambegaon Rd, above Star Bazaar, Ambegaon Budruk, Pune, Maharashtra 411046 [cite: 1419, 1420, 1421, 1422, 1423]</p>
                                    
                                    <hr />
                                    
                                    <p><strong>Cancellation & Refund Notice:</strong> Ambulance bookings may be subject to cancellation charges once dispatch has commenced or the ambulance has arrived at the pickup location[cite: 1424]. Refund eligibility depends on booking status, service utilization, payment method, and applicable partner policies[cite: 1425]. Users are encouraged to review the full Cancellation & Refund Policy before confirming a booking[cite: 1426].</p>
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

export default AmbulanceRefundPolicy;