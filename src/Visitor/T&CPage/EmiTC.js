import { useEffect, useState } from "react";
import FooterBar from "../Component/FooterBar";
import { useNavigate } from "react-router-dom";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import { Container, Accordion } from "react-bootstrap";

function EmiTC() {
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
        document.title = "HealthEasy EMI – Terms & Conditions, Privacy Policy and FAQs";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center '>
                    <h2>HealthEasy EMI – Terms & Conditions, Privacy Policy and FAQs</h2>
                </Container>
            </section>
            
            <section className="py-5">
                <Container>
                    <div className="p-3 border rounded">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            {/* --- TERMS & CONDITIONS SECTION --- */}
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>1. Introduction & 2. About HealthEasy EMI</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>1. Introduction:</strong> Welcome to HealthEasy EMI ("Platform", "HealthEasy EMI", "we", "our", or "us")[cite: 1428, 1430]. These Terms and Conditions govern your access to and use of the website, applications, services, products, and related features offered through HealthEasy EMI[cite: 1431]. By accessing, browsing, registering on, or using the Platform, you agree to be legally bound by these Terms[cite: 1432]. If you do not agree to these Terms, you should discontinue use of the Platform immediately[cite: 1433].</p>
                                    <p><strong>2. About HealthEasy EMI:</strong> HealthEasy EMI acts solely as a technology-enabled Lending Service Provider ("LSP") facilitating access to healthcare financing products offered by RBI-regulated Banks and Non-Banking Financial Companies (NBFCs)[cite: 1435]. HealthEasy EMI: Is not a lender[cite: 1436, 1437]; Does not provide loans[cite: 1438]; Does not make credit decisions[cite: 1439]; Does not guarantee loan approval[cite: 1440]; Does not determine interest rates or repayment terms[cite: 1441]. All lending decisions are made exclusively by the respective lender[cite: 1442].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header>3. Eligibility & 4. Services Offered</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>3. Eligibility:</strong> You must:</p>
                                    <ul>
                                        <li>Be at least 18 years old[cite: 1444, 1445].</li>
                                        <li>Be legally competent to contract under Indian law[cite: 1446].</li>
                                        <li>Possess valid identification and KYC documents[cite: 1447].</li>
                                        <li>Provide accurate and complete information[cite: 1448].</li>
                                        <li>Meet the eligibility criteria of the lender[cite: 1449].</li>
                                    </ul>
                                    <p><strong>4. Services Offered:</strong> The Platform may facilitate:</p>
                                    <ul>
                                        <li>Medical treatment financing[cite: 1451, 1452].</li>
                                        <li>Hospital bill financing[cite: 1453].</li>
                                        <li>Surgery financing[cite: 1454].</li>
                                        <li>Diagnostic and healthcare financing[cite: 1455].</li>
                                        <li>Loan application submission[cite: 1456].</li>
                                        <li>Document collection and verification[cite: 1457].</li>
                                        <li>Communication between borrowers, hospitals, and lenders[cite: 1458].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header>5. Loan Applications & 6. Key Fact Statement (KFS)</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>5. Loan Applications:</strong> Submission of an application does not guarantee approval[cite: 1459, 1460]. Loan approval depends on: Creditworthiness[cite: 1461, 1462]; KYC verification[cite: 1463]; Income assessment[cite: 1464]; Lender policies[cite: 1465]; Regulatory requirements[cite: 1466]. The lender may reject any application without assigning reasons[cite: 1467].</p>
                                    <p><strong>6. Key Fact Statement (KFS):</strong> Before loan execution, users shall receive a Key Fact Statement from the lender containing: Loan amount[cite: 1469, 1470]; APR[cite: 1471]; Interest rate[cite: 1472]; Processing fees[cite: 1473]; Repayment schedule[cite: 1474]; Penal charges[cite: 1475]; Cooling-off period[cite: 1476]; Grievance details[cite: 1477]. Users should carefully review the KFS before accepting a loan offer[cite: 1478].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header>7. User Responsibilities & 8. Electronic Communications</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>7. User Responsibilities:</strong> You agree that: All information provided is true and accurate[cite: 1479, 1481]; Submitted documents are authentic[cite: 1482]; You will not misuse the Platform[cite: 1483]; You will not engage in fraud or identity misrepresentation[cite: 1484]. Any violation may result in suspension or legal action[cite: 1485].</p>
                                    <p><strong>8. Electronic Communications:</strong> You consent to receive: Emails[cite: 1487, 1488]; SMS[cite: 1489]; Phone calls[cite: 1490]; WhatsApp messages[cite: 1491]; Push notifications[cite: 1492]. These communications may relate to: Loan applications[cite: 1493, 1494]; Verification[cite: 1495]; EMI reminders[cite: 1496]; Service updates[cite: 1497]; Regulatory notices[cite: 1498].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header>9. Intellectual Property & 10. Third-Party Services</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>9. Intellectual Property:</strong> All content including: Trademarks[cite: 1500, 1501]; Logos[cite: 1502]; Graphics[cite: 1503]; Website design[cite: 1504]; Software [cite: 1505]; are the property of HealthEasy EMI or its licensors[cite: 1506]. Unauthorized use is prohibited[cite: 1507].</p>
                                    <p><strong>10. Third-Party Services:</strong> The Platform may contain links to: Hospitals[cite: 1509, 1510]; Payment gateways[cite: 1511]; Lenders[cite: 1512]; Verification providers[cite: 1513]. HealthEasy EMI is not responsible for third-party services or content[cite: 1514].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header>11. Limitation of Liability & 12. Suspension and Termination</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>11. Limitation of Liability:</strong> HealthEasy EMI shall not be liable for: Loan rejection[cite: 1516, 1517]; Lender decisions[cite: 1518]; Treatment outcomes[cite: 1519]; Hospital services[cite: 1520]; Data inaccuracies provided by users[cite: 1521]; Technical interruptions beyond reasonable control[cite: 1522].</p>
                                    <p><strong>12. Suspension and Termination:</strong> We reserve the right to suspend or terminate access where: Fraud is suspected[cite: 1524, 1525]; False information is provided[cite: 1526]; Regulatory requirements demand action[cite: 1527]; These Terms are violated[cite: 1528].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header>13. Grievance Redressal, 14. Governing Law & 15. Changes to Terms</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>13. Grievance Redressal:</strong> Users may contact:</p>
                                    <p>Grievance Officer<br />
                                    Email: healtheasyemi@gmail.com<br />
                                    Phone: +91 8855919195<br />
                                    Address: Office no. 23, 3rd Floor, Aston Plaza, Narhe Ambegaon Rd, above Star Bazaar, Ambegaon Budruk, Pune, Maharashtra 411046 [cite: 1531, 1532, 1533, 1534]</p>
                                    <p><strong>14. Governing Law:</strong> These Terms shall be governed by the laws of India[cite: 1535, 1536]. Any disputes shall be subject to the exclusive jurisdiction of courts located in Pune, Maharashtra, India[cite: 1537].</p>
                                    <p><strong>15. Changes to Terms:</strong> We may modify these Terms at any time[cite: 1538, 1539]. Updated versions will be posted on the Platform and become effective immediately upon publication[cite: 1540].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            {/* --- PRIVACY POLICY SECTION --- */}
                            <Accordion.Item eventKey="7">
                                <Accordion.Header>1. Introduction & 2. Information We Collect</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>1. Introduction:</strong> HealthEasy EMI respects your privacy and is committed to protecting your personal data[cite: 1542, 1544]. This Privacy Policy explains how we collect, use, process, store, and disclose information when you use our services[cite: 1545].</p>
                                    <p><strong>2. Information We Collect:</strong></p>
                                    <h6>Personal Information</h6>
                                    <ul>
                                        <li>Full name [cite: 1547, 1548]</li>
                                        <li>Date of birth [cite: 1549]</li>
                                        <li>Gender [cite: 1550]</li>
                                        <li>Address [cite: 1551]</li>
                                        <li>Email address [cite: 1552]</li>
                                        <li>Mobile number [cite: 1553]</li>
                                    </ul>
                                    <h6>Identity Information</h6>
                                    <ul>
                                        <li>PAN [cite: 1554, 1555]</li>
                                        <li>Aadhaar (where legally permitted) [cite: 1556]</li>
                                        <li>Driving Licence [cite: 1557]</li>
                                        <li>Passport [cite: 1558]</li>
                                        <li>Voter ID [cite: 1559]</li>
                                    </ul>
                                    <h6>Financial Information</h6>
                                    <ul>
                                        <li>Bank account details [cite: 1560, 1561]</li>
                                        <li>Income information [cite: 1562]</li>
                                        <li>Employment information [cite: 1563]</li>
                                        <li>Credit history information [cite: 1564]</li>
                                    </ul>
                                    <h6>Healthcare Financing Information</h6>
                                    <ul>
                                        <li>Hospital details [cite: 1565, 1566]</li>
                                        <li>Medical treatment estimates [cite: 1567]</li>
                                        <li>Medical invoices [cite: 1568]</li>
                                        <li>Financing requirements [cite: 1569]</li>
                                    </ul>
                                    <h6>Technical Information</h6>
                                    <ul>
                                        <li>IP address [cite: 1570, 1571]</li>
                                        <li>Device information [cite: 1572]</li>
                                        <li>Browser information [cite: 1573]</li>
                                        <li>Website usage data [cite: 1574]</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header>3. How We Use & 4. Sharing of Information</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>3. How We Use Information:</strong> Information may be used to:</p>
                                    <ul>
                                        <li>Process loan applications[cite: 1576, 1577].</li>
                                        <li>Verify identity[cite: 1578].</li>
                                        <li>Conduct KYC[cite: 1579].</li>
                                        <li>Prevent fraud[cite: 1580].</li>
                                        <li>Improve services[cite: 1581].</li>
                                        <li>Comply with legal obligations[cite: 1582].</li>
                                        <li>Respond to customer requests[cite: 1583].</li>
                                    </ul>
                                    <p><strong>4. Sharing of Information:</strong> Information may be shared with:</p>
                                    <ul>
                                        <li><strong>Lending Partners:</strong> For loan assessment and servicing[cite: 1586, 1587].</li>
                                        <li><strong>Hospitals:</strong> For treatment financing coordination[cite: 1588, 1589].</li>
                                        <li><strong>Service Providers:</strong> For KYC verification, fraud prevention, technology services, and customer support[cite: 1590, 1592, 1593, 1594, 1595].</li>
                                        <li><strong>Government Authorities:</strong> Where required by law[cite: 1596, 1597].</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header>5. Security, 6. Retention, 7. Rights, 8. Cookies & 9. Children's Privacy</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>5. Data Security:</strong> We implement reasonable security measures including: Encryption[cite: 1599, 1600]; Secure servers[cite: 1601]; Access controls[cite: 1602]; Monitoring systems[cite: 1603]. No internet transmission can be guaranteed to be completely secure[cite: 1604].</p>
                                    <p><strong>6. Data Retention:</strong> Information shall be retained: For legal compliance[cite: 1606, 1607]; Regulatory requirements[cite: 1608]; Contractual obligations[cite: 1609]; Fraud prevention purposes[cite: 1610]. Thereafter information may be deleted or anonymized[cite: 1611].</p>
                                    <p><strong>7. User Rights:</strong> Subject to applicable law, users may: Request access to personal data[cite: 1613, 1614]; Request correction of inaccurate data[cite: 1615]; Withdraw consent where applicable[cite: 1616]; Request deletion where legally permissible[cite: 1617].</p>
                                    <p><strong>8. Cookies:</strong> We use cookies for: Website functionality[cite: 1618, 1620]; Analytics[cite: 1621]; Security[cite: 1622]; User experience improvement[cite: 1623]. Users may manage cookie preferences through browser settings[cite: 1624].</p>
                                    <p><strong>9. Children's Privacy:</strong> Our services are not intended for persons below 18 years of age[cite: 1625, 1626].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            {/* --- FREQUENTLY ASKED QUESTIONS SECTION --- */}
                            <Accordion.Item eventKey="10">
                                <Accordion.Header>FREQUENTLY ASKED QUESTIONS (FAQs) - Part 1</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>What is HealthEasy EMI?</strong><br />HealthEasy EMI is a healthcare financing facilitation platform that helps patients access loan products offered by RBI-regulated lenders for eligible medical expenses[cite: 1628, 1629].</p>
                                    <p><strong>Is HealthEasy EMI a lender?</strong><br />No. HealthEasy EMI is a Lending Service Provider and does not lend money directly. Loans are provided only by partner Banks and NBFCs[cite: 1630, 1632, 1633].</p>
                                    <p><strong>What medical expenses can be financed?</strong><br />Subject to lender approval: Surgeries[cite: 1634, 1636]; Hospitalization[cite: 1637]; Diagnostic procedures[cite: 1638]; Dental treatments[cite: 1639]; Fertility treatments[cite: 1640]; Cosmetic procedures (where permitted)[cite: 1641]; Emergency medical care[cite: 1642]; Specialist consultations[cite: 1643].</p>
                                    <p><strong>How do I apply?</strong><br />Submit your application[cite: 1644, 1645]; Upload required documents[cite: 1646]; Complete verification[cite: 1647]; Receive lender decision[cite: 1648]; Review KFS and loan agreement[cite: 1649]; Accept the offer digitally[cite: 1650].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header>FREQUENTLY ASKED QUESTIONS (FAQs) - Part 2</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>What documents are required?</strong><br />Typically: PAN Card[cite: 1651, 1653]; Aadhaar Card[cite: 1654]; Address proof[cite: 1655]; Income proof[cite: 1656]; Bank statement[cite: 1657]; Medical estimate or hospital invoice[cite: 1658]. Additional documents may be requested[cite: 1659].</p>
                                    <p><strong>Will applying affect my credit score?</strong><br />The lender may perform a credit bureau enquiry, which may impact your credit profile according to bureau policies[cite: 1660, 1661].</p>
                                    <p><strong>How long does approval take?</strong><br />Approval timelines vary based on: Document completeness[cite: 1663, 1664]; Verification requirements[cite: 1665]; Lender processing[cite: 1666]. Some decisions may be available within minutes, while others may take longer[cite: 1667].</p>
                                    <p><strong>Can I repay early?</strong><br />Prepayment and foreclosure terms depend on the lender and will be disclosed in the loan agreement and KFS[cite: 1668, 1669].</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header>FREQUENTLY ASKED QUESTIONS (FAQs) - Part 3 & Regulatory Disclaimers</Accordion.Header>
                                <Accordion.Body>
                                    <p><strong>How are loan funds disbursed?</strong><br />Depending on the lender and financing arrangement: Directly to the hospital[cite: 1670, 1672]; Directly to the healthcare provider[cite: 1673]; To the borrower where permitted[cite: 1674].</p>
                                    <p><strong>What if my loan application is rejected?</strong><br />Loan approval remains solely at the lender's discretion. HealthEasy EMI cannot influence or overturn lender decisions[cite: 1675, 1676, 1677].</p>
                                    <p><strong>How do I protect myself from fraud?</strong><br />Never share OTPs[cite: 1678, 1679]; Never share passwords[cite: 1680]; Verify official communications[cite: 1681]; Contact customer support if suspicious activity is detected[cite: 1682].</p>
                                    
                                    <hr />
                                    
                                    <p><strong>Important Regulatory Notice:</strong> HealthEasy EMI is a Lending Service Provider (LSP) and not a lender[cite: 1683]. Loan products are offered solely by RBI-regulated Banks and/or NBFCs[cite: 1684]. Approval, disbursement, interest rates, tenure, and repayment terms are determined exclusively by the respective lender[cite: 1685]. Please review the Key Fact Statement (KFS) and loan agreement carefully before accepting any loan offer[cite: 1686].</p>
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

export default EmiTC;