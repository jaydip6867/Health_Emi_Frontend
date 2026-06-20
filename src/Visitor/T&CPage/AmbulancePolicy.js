import { useEffect, useState } from "react";
import FooterBar from "../Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import { Container, Accordion } from "react-bootstrap";

function AmbulancePolicy() {
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
        document.title = "HealthEasy EMI – Ambulance Services Privacy Policy";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>HealthEasy EMI Ambulance Services Privacy Policy</h2>
                </Container>
            </section>
            
            <section className="py-5">
                <Container>
                    <div className="p-3 border rounded">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>1. Introduction</Accordion.Header>
                                <Accordion.Body>
                                    <p>Arogya Mantra Healthtech Private Limited, operating under the brand name "HealthEasy EMI Ambulance Services" ("HealthEasy EMI", "Company", "we", "our", or "us"), is committed to protecting the privacy, confidentiality, and security of personal information entrusted to us[cite: 1043]. This Privacy Policy describes how we collect, use, process, store, disclose, transfer, and protect personal information when you access or use our ambulance booking platform, website, mobile applications, call center services, emergency response coordination services, and related healthcare transportation services (collectively, the "Services")[cite: 1044]. By accessing or using the Services, you acknowledge that you have read, understood, and agreed to this Privacy Policy[cite: 1045].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header>2. Applicability</Accordion.Header>
                                <Accordion.Body>
                                    <p>This Privacy Policy applies to:</p>
                                    <ul>
                                        <li>Patients; [cite: 1048]</li>
                                        <li>Family members, attendants, and caregivers; [cite: 1049]</li>
                                        <li>Ambulance service users; [cite: 1050]</li>
                                        <li>Ambulance operators and drivers; [cite: 1051]</li>
                                        <li>Hospitals and healthcare facilities; [cite: 1052]</li>
                                        <li>Visitors to our website and mobile applications; [cite: 1053]</li>
                                        <li>Individuals interacting with our customer support services. [cite: 1054]</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>3. Legal Basis for Processing</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI processes personal data in accordance with applicable Indian laws, including:</p>
                                    <ul>
                                        <li>Digital Personal Data Protection Act, 2023; [cite: 1057]</li>
                                        <li>Information Technology Act, 2000; [cite: 1058]</li>
                                        <li>Applicable healthcare and emergency service regulations; [cite: 1059]</li>
                                        <li>Consumer protection laws; [cite: 1060]</li>
                                        <li>Payment and financial regulations where applicable. [cite: 1061]</li>
                                    </ul>
                                    <p>By using the Services, you consent to the collection and processing of information as described in this Privacy Policy where such consent is required under applicable law[cite: 1062].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header>4. Information We Collect</Accordion.Header>
                                <Accordion.Body>
                                    <h5>4.1 Personal Information</h5>
                                    <p>We may collect:</p>
                                    <ul>
                                        <li>Full name; [cite: 1066]</li>
                                        <li>Mobile number; [cite: 1067]</li>
                                        <li>Email address; [cite: 1068]</li>
                                        <li>Date of birth; [cite: 1069]</li>
                                        <li>Age; [cite: 1070]</li>
                                        <li>Gender; [cite: 1071]</li>
                                        <li>Residential address; [cite: 1072]</li>
                                        <li>Emergency contact information; [cite: 1073]</li>
                                        <li>Profile information. [cite: 1074]</li>
                                    </ul>

                                    <h5>4.2 Ambulance Booking Information</h5>
                                    <p>We may collect:</p>
                                    <ul>
                                        <li>Pickup location; [cite: 1077]</li>
                                        <li>Destination location; [cite: 1078]</li>
                                        <li>Preferred hospital or healthcare facility; [cite: 1079]</li>
                                        <li>Booking date and time; [cite: 1080]</li>
                                        <li>Ambulance category requested; [cite: 1081]</li>
                                        <li>Transport requirements; [cite: 1082]</li>
                                        <li>Patient transport preferences. [cite: 1083]</li>
                                    </ul>

                                    <h5>4.3 Health and Medical Information</h5>
                                    <p>To facilitate ambulance and healthcare transportation services, we may collect:</p>
                                    <ul>
                                        <li>Patient name and age; [cite: 1086]</li>
                                        <li>Medical condition information; [cite: 1087]</li>
                                        <li>Injury details; [cite: 1088]</li>
                                        <li>Diagnosis information voluntarily provided; [cite: 1089]</li>
                                        <li>Treating doctor details; [cite: 1090]</li>
                                        <li>Hospital information; [cite: 1091]</li>
                                        <li>Special medical requirements; [cite: 1092]</li>
                                        <li>Oxygen requirements; [cite: 1093]</li>
                                        <li>Ventilator requirements; [cite: 1094]</li>
                                        <li>ICU transport requirements; [cite: 1095]</li>
                                        <li>Isolation or infectious disease precautions; [cite: 1096]</li>
                                        <li>Emergency medical information. [cite: 1097]</li>
                                    </ul>

                                    <h5>4.4 Location Information</h5>
                                    <p>We may collect:</p>
                                    <ul>
                                        <li>Real-time device location; [cite: 1100]</li>
                                        <li>Pickup location; [cite: 1101]</li>
                                        <li>Ambulance tracking information; [cite: 1102]</li>
                                        <li>GPS coordinates; [cite: 1103]</li>
                                        <li>Route and navigation information. [cite: 1104]</li>
                                    </ul>
                                    <p>Location information is collected only where necessary to facilitate transportation services, tracking, emergency coordination, safety, and operational efficiency[cite: 1105].</p>

                                    <h5>4.5 Payment and Financing Information</h5>
                                    <p>Where applicable, we may collect:</p>
                                    <ul>
                                        <li>Transaction details; [cite: 1108]</li>
                                        <li>Payment records; [cite: 1109]</li>
                                        <li>Billing information; [cite: 1110]</li>
                                        <li>UPI transaction details; [cite: 1111]</li>
                                        <li>Bank details required for refunds; [cite: 1112]</li>
                                        <li>Healthcare financing or EMI-related information. [cite: 1113]</li>
                                    </ul>
                                    <p>Payment card information is generally processed by authorized payment service providers and not stored directly by HealthEasy EMI except where required by law[cite: 1114].</p>

                                    <h5>4.6 Technical Information</h5>
                                    <p>We may automatically collect:</p>
                                    <ul>
                                        <li>Device identifiers; [cite: 1117]</li>
                                        <li>IP addresses; [cite: 1118]</li>
                                        <li>Browser information; [cite: 1119]</li>
                                        <li>Operating system information; [cite: 1120]</li>
                                        <li>Application logs; [cite: 1121]</li>
                                        <li>Usage analytics; [cite: 1122]</li>
                                        <li>Crash reports; [cite: 1123]</li>
                                        <li>Session information. [cite: 1124]</li>
                                    </ul>

                                    <h5>4.7 Communications and Support Information</h5>
                                    <p>We may collect:</p>
                                    <ul>
                                        <li>Customer support interactions; [cite: 1127]</li>
                                        <li>Chat messages; [cite: 1128]</li>
                                        <li>Service requests; [cite: 1129]</li>
                                        <li>Complaint information; [cite: 1130]</li>
                                        <li>Call recordings where legally permitted; [cite: 1131]</li>
                                        <li>User feedback and ratings. [cite: 1132]</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header>5. How We Use Information</Accordion.Header>
                                <Accordion.Body>
                                    <p>We may use information for the following purposes:</p>
                                    
                                    <h6>Service Delivery</h6>
                                    <ul>
                                        <li>Ambulance booking and dispatch; [cite: 1136]</li>
                                        <li>Real-time ambulance tracking; [cite: 1137]</li>
                                        <li>Emergency response coordination; [cite: 1138]</li>
                                        <li>Hospital coordination; [cite: 1139]</li>
                                        <li>Patient transportation management. [cite: 1140]</li>
                                    </ul>

                                    <h6>Communication</h6>
                                    <ul>
                                        <li>Booking confirmations; [cite: 1142]</li>
                                        <li>Arrival notifications; [cite: 1143]</li>
                                        <li>Status updates; [cite: 1144]</li>
                                        <li>Emergency alerts; [cite: 1145]</li>
                                        <li>Customer support responses. [cite: 1146]</li>
                                    </ul>

                                    <h6>Payment Processing</h6>
                                    <ul>
                                        <li>Processing payments; [cite: 1148]</li>
                                        <li>EMI and healthcare financing facilitation; [cite: 1149]</li>
                                        <li>Refund processing; [cite: 1150]</li>
                                        <li>Fraud prevention. [cite: 1151]</li>
                                    </ul>

                                    <h6>Platform Improvement</h6>
                                    <ul>
                                        <li>Service analytics; [cite: 1153]</li>
                                        <li>Performance monitoring; [cite: 1154]</li>
                                        <li>Product development; [cite: 1155]</li>
                                        <li>User experience enhancement. [cite: 1156]</li>
                                    </ul>

                                    <h6>Safety and Emergency Response</h6>
                                    <ul>
                                        <li>Coordinating emergency transportation; [cite: 1158]</li>
                                        <li>Assisting ambulance providers; [cite: 1159]</li>
                                        <li>Facilitating communication between patients, caregivers, hospitals, and ambulance operators. [cite: 1160]</li>
                                    </ul>

                                    <h6>Legal Compliance</h6>
                                    <ul>
                                        <li>Regulatory compliance; [cite: 1162]</li>
                                        <li>Recordkeeping obligations; [cite: 1163]</li>
                                        <li>Law enforcement requests; [cite: 1164]</li>
                                        <li>Dispute resolution. [cite: 1165]</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header>6. Sharing of Information</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI does not sell personal information[cite: 1167]. We may share information only where necessary for service delivery or legal compliance[cite: 1168].</p>
                                    
                                    <h6>Ambulance Service Providers</h6>
                                    <p>We may share relevant information with ambulance operators and transportation partners, including:</p>
                                    <ul>
                                        <li>Patient details; [cite: 1171]</li>
                                        <li>Pickup and destination information; [cite: 1172]</li>
                                        <li>Emergency requirements; [cite: 1173]</li>
                                        <li>Medical transport requirements. [cite: 1174]</li>
                                    </ul>

                                    <h6>Hospitals and Healthcare Facilities</h6>
                                    <p>Information may be shared with receiving hospitals, healthcare facilities, emergency departments, and medical personnel where required for patient care and transportation coordination[cite: 1176].</p>

                                    <h6>Payment and Financial Partners</h6>
                                    <p>Where payment, financing, or EMI services are used, information may be shared with:</p>
                                    <ul>
                                        <li>Banks; [cite: 1179]</li>
                                        <li>Payment gateways; [cite: 1180]</li>
                                        <li>Financial institutions; [cite: 1181]</li>
                                        <li>Lending partners; [cite: 1182]</li>
                                        <li>Verification agencies. [cite: 1183]</li>
                                    </ul>

                                    <h6>Service Providers</h6>
                                    <p>We may engage authorized service providers for:</p>
                                    <ul>
                                        <li>Cloud hosting; [cite: 1186]</li>
                                        <li>Communication services; [cite: 1187]</li>
                                        <li>GPS and mapping services; [cite: 1188]</li>
                                        <li>Customer support; [cite: 1189]</li>
                                        <li>Technology infrastructure; [cite: 1190]</li>
                                        <li>Analytics. [cite: 1191]</li>
                                    </ul>

                                    <h6>Legal and Regulatory Authorities</h6>
                                    <p>We may disclose information where required by:</p>
                                    <ul>
                                        <li>Applicable law; [cite: 1194]</li>
                                        <li>Court orders; [cite: 1195]</li>
                                        <li>Regulatory authorities; [cite: 1196]</li>
                                        <li>Emergency response requirements; [cite: 1197]</li>
                                        <li>Protection of public safety. [cite: 1198]</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header>7. Emergency Situations</Accordion.Header>
                                <Accordion.Body>
                                    <p>In emergency situations involving risk to life, serious injury, public health concerns, or urgent medical care requirements, HealthEasy EMI may process and share relevant information without additional consent to the extent permitted by applicable law and necessary for protecting life and health[cite: 1200].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header>8. Marketing Communications</Accordion.Header>
                                <Accordion.Body>
                                    <p>Where legally required, HealthEasy EMI will obtain consent before sending promotional communications[cite: 1202]. Users may opt out of marketing communications at any time[cite: 1203]. Operational communications relating to bookings, emergencies, payments, safety, and service delivery may continue notwithstanding marketing preferences[cite: 1204].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header>9. Cookies and Similar Technologies</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI uses cookies, SDKs, device identifiers, and related technologies to:</p>
                                    <ul>
                                        <li>Enable platform functionality; [cite: 1207]</li>
                                        <li>Improve user experience; [cite: 1208]</li>
                                        <li>Analyze usage patterns; [cite: 1209]</li>
                                        <li>Maintain account sessions; [cite: 1210]</li>
                                        <li>Enhance security. [cite: 1211]</li>
                                    </ul>
                                    <p>Users may disable cookies through browser or device settings, although certain features may become unavailable[cite: 1212].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header>10. Data Security</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI implements reasonable technical, administrative, and organizational safeguards designed to protect personal information, including:</p>
                                    <ul>
                                        <li>Encryption measures; [cite: 1215]</li>
                                        <li>Access controls; [cite: 1216]</li>
                                        <li>Authentication systems; [cite: 1217]</li>
                                        <li>Security monitoring; [cite: 1218]</li>
                                        <li>Audit logging; [cite: 1219]</li>
                                        <li>Secure infrastructure. [cite: 1220]</li>
                                    </ul>
                                    <p>However, no system can guarantee absolute security[cite: 1221]. Users are responsible for maintaining the confidentiality of their account credentials[cite: 1222].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header>11. Data Retention</Accordion.Header>
                                <Accordion.Body>
                                    <p>We retain information only for as long as reasonably necessary for:</p>
                                    <ul>
                                        <li>Service delivery; [cite: 1225]</li>
                                        <li>Emergency response documentation; [cite: 1226]</li>
                                        <li>Legal obligations; [cite: 1227]</li>
                                        <li>Regulatory compliance; [cite: 1228]</li>
                                        <li>Dispute resolution; [cite: 1229]</li>
                                        <li>Fraud prevention; [cite: 1230]</li>
                                        <li>Business operations. [cite: 1231]</li>
                                    </ul>
                                    <p>Following expiration of retention requirements, information may be securely deleted, anonymized, or aggregated[cite: 1232].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header>12. Your Rights</Accordion.Header>
                                <Accordion.Body>
                                    <p>Subject to applicable law, users may have the right to:</p>
                                    <ul>
                                        <li>Access personal information; [cite: 1235]</li>
                                        <li>Correct inaccurate information; [cite: 1236]</li>
                                        <li>Update account information; [cite: 1237]</li>
                                        <li>Withdraw consent where applicable; [cite: 1238]</li>
                                        <li>Request account deletion; [cite: 1239]</li>
                                        <li>Request information regarding processing activities; [cite: 1240]</li>
                                        <li>Raise privacy-related complaints. [cite: 1241]</li>
                                    </ul>
                                    <p>Requests may be submitted using the contact information below[cite: 1242].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header>13. Children's Privacy & International Transfers</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>Children's Privacy:</strong> The Services are not intended for independent use by individuals below eighteen (18) years of age[cite: 1244]. Parents, guardians, caregivers, or authorized representatives may use the Services on behalf of minors where legally permitted[cite: 1245].</p>
                                    <p><strong>International Transfers:</strong> Where information is processed, stored, or accessed outside India, HealthEasy EMI shall implement appropriate safeguards consistent with applicable law and contractual obligations[cite: 1247].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="13">
                                <Accordion.Header>14. Policy Updates</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may modify this Privacy Policy from time to time[cite: 1249]. Updated versions shall be published on the platform and become effective upon publication unless otherwise stated[cite: 1250]. Continued use of the Services after publication constitutes acceptance of the revised Privacy Policy[cite: 1251].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="14">
                                <Accordion.Header>15. Contact Information & Grievance Officer</Accordion.Header>
                                <Accordion.Body>
                                    <p>For privacy-related questions, requests, or concerns, please contact:</p>
                                    <p>HealthEasy EMI Ambulance Services Arogya Mantra Healthtech Private Limited<br />
                                    Support Email: support@healtheasyemi.com<br />
                                    Privacy Email: privacy@healtheasyemi.com<br />
                                    Registered Office: Office no.23, 3rd Floor, Aston Plaza, Narhe Ambegaon Rd, above Star Bazaar, Ambegaon Budruk, Pune, Maharashtra 411046 [cite: 1254, 1255, 1256, 1257]</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="15">
                                <Accordion.Header>16. Governing Law and Jurisdiction</Accordion.Header>
                                <Accordion.Body>
                                    <p>This Privacy Policy shall be governed by and construed in accordance with the laws of India[cite: 1259]. Any disputes arising from or relating to this Privacy Policy shall be subject to the exclusive jurisdiction of the competent courts located at Latur, Maharashtra, India[cite: 1260].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="16">
                                <Accordion.Header>17. Privacy Notice Summary</Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI Ambulance Services processes personal, health, location, and emergency-response information solely for ambulance booking, patient transportation, healthcare coordination, safety, legal compliance, and related service delivery purposes[cite: 1261]. By using our Services, you consent to the processing of information as described in our Privacy Policy[cite: 1262]. In life-threatening emergencies, certain information may be shared with ambulance operators, hospitals, and emergency responders to facilitate urgent medical care[cite: 1263].</p>
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

export default AmbulancePolicy;