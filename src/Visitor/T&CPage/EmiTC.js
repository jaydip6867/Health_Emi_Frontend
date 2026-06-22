import { useEffect, useState } from "react";
import { Container, Accordion } from "react-bootstrap";
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import FooterBar from "../Component/FooterBar";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';

function EmiTC() {
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
        document.title = "HealthEasy EMI – Terms, Privacy & FAQs";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center'>
                    <h2>HealthEasy EMI – Documentations</h2>
                </Container>
            </section>
            
            <section className="py-5 bg-light">
                <Container>
                    <div className="p-4 bg-white border rounded shadow-sm">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            {/* TERMS & CONDITIONS SECTION */}
                            <Accordion.Item eventKey="0">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 1. Introduction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Welcome to HealthEasy EMI ("Platform", "HealthEasy EMI", "we", "our", or "us"). These Terms and Conditions govern your access to and use of the website, applications, services, products, and related features offered through HealthEasy EMI. By accessing, browsing, registering on, or using the Platform, you agree to be legally bound by these Terms. If you do not agree to these Terms, you should discontinue use of the Platform immediately.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 2. About HealthEasy EMI</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI acts solely as a technology-enabled Lending Service Provider ("LSP") facilitating access to healthcare financing products offered by RBI-regulated Banks and Non-Banking Financial Companies (NBFCs). HealthEasy EMI:</p>
                                    <ul>
                                        <li>Is not a lender.</li>
                                        <li>Does not provide loans.</li>
                                        <li>Does not make credit decisions.</li>
                                        <li>Does not guarantee loan approval.</li>
                                        <li>Does not determine interest rates or repayment terms.</li>
                                    </ul>
                                    <p>All lending decisions are made exclusively by the respective lender.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 3. Eligibility</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>You must:</p>
                                    <ul>
                                        <li>Be at least 18 years old.</li>
                                        <li>Be legally competent to contract under Indian law.</li>
                                        <li>Possess valid identification and KYC documents.</li>
                                        <li>Provide accurate and complete information.</li>
                                        <li>Meet the eligibility criteria of the lender.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 4. Services Offered</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The Platform may facilitate:</p>
                                    <ul>
                                        <li>Medical treatment financing.</li>
                                        <li>Hospital bill financing.</li>
                                        <li>Surgery financing.</li>
                                        <li>Diagnostic and healthcare financing.</li>
                                        <li>Loan application submission.</li>
                                        <li>Document collection and verification.</li>
                                        <li>Communication between borrowers, hospitals, and lenders.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 5. Loan Applications</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Submission of an application does not guarantee approval. Loan approval depends on:</p>
                                    <ul>
                                        <li>Creditworthiness.</li>
                                        <li>KYC verification.</li>
                                        <li>Income assessment.</li>
                                        <li>Lender policies.</li>
                                        <li>Regulatory requirements.</li>
                                    </ul>
                                    <p>The lender may reject any application without assigning reasons.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 6. Key Fact Statement (KFS)</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Before loan execution, users shall receive a Key Fact Statement from the lender containing:</p>
                                    <ul>
                                        <li>Loan amount.</li>
                                        <li>APR.</li>
                                        <li>Interest rate.</li>
                                        <li>Processing fees.</li>
                                        <li>Repayment schedule.</li>
                                        <li>Penal charges.</li>
                                        <li>Cooling-off period.</li>
                                        <li>Grievance details.</li>
                                    </ul>
                                    <p>Users should carefully review the KFS before accepting a loan offer.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 7. User Responsibilities</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>You agree that:</p>
                                    <ul>
                                        <li>All information provided is true and accurate.</li>
                                        <li>Submitted documents are authentic.</li>
                                        <li>You will not misuse the Platform.</li>
                                        <li>You will not engage in fraud or identity misrepresentation.</li>
                                    </ul>
                                    <p>Any violation may result in suspension or legal action.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 8. Electronic Communications</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>You consent to receive:</p>
                                    <ul>
                                        <li>Emails.</li>
                                        <li>SMS.</li>
                                        <li>Phone calls.</li>
                                        <li>WhatsApp messages.</li>
                                        <li>Push notifications.</li>
                                    </ul>
                                    <p>These communications may relate to:</p>
                                    <ul>
                                        <li>Loan applications.</li>
                                        <li>Verification.</li>
                                        <li>EMI reminders.</li>
                                        <li>Service updates.</li>
                                        <li>Regulatory notices.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 9. Intellectual Property</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>All content including:</p>
                                    <ul>
                                        <li>Trademarks.</li>
                                        <li>Logos.</li>
                                        <li>Graphics.</li>
                                        <li>Website design.</li>
                                        <li>Software.</li>
                                    </ul>
                                    <p>are the property of HealthEasy EMI or its licensors. Unauthorized use is prohibited.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 10. Third-Party Services</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The Platform may contain links to:</p>
                                    <ul>
                                        <li>Hospitals.</li>
                                        <li>Payment gateways.</li>
                                        <li>Lenders.</li>
                                        <li>Verification providers.</li>
                                    </ul>
                                    <p>HealthEasy EMI is not responsible for third-party services or content.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 11. Limitation of Liability</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI shall not be liable for:</p>
                                    <ul>
                                        <li>Loan rejection.</li>
                                        <li>Lender decisions.</li>
                                        <li>Treatment outcomes.</li>
                                        <li>Hospital services.</li>
                                        <li>Data inaccuracies provided by users.</li>
                                        <li>Technical interruptions beyond reasonable control.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 12. Suspension and Termination</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>We reserve the right to suspend or terminate access where:</p>
                                    <ul>
                                        <li>Fraud is suspected.</li>
                                        <li>False information is provided.</li>
                                        <li>Regulatory requirements demand action.</li>
                                        <li>These Terms are violated.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 13. Grievance Redressal</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Users may contact:</p>
                                    <p>Grievance Officer<br />
                                    Email: healtheasyemi@gmail.com<br />
                                    Phone: +91 8855919195<br />
                                    Address: Office no. 23, 3rd Floor, Aston Plaza, Narhe Ambegaon Rd, above Star Bazaar, Ambegaon Budruk, Pune, Maharashtra 411046</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="13">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 14. Governing Law</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts located in Pune, Maharashtra, India.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="14">
                                <Accordion.Header><strong>TERMS & CONDITIONS - 15. Changes to Terms</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>We may modify these Terms at any time. Updated versions will be posted on the Platform and become effective immediately upon publication.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            {/* PRIVACY POLICY SECTION */}
                            <Accordion.Item eventKey="15">
                                <Accordion.Header><strong>PRIVACY POLICY - 1. Introduction</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, process, store, and disclose information when you use our services.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="16">
                                <Accordion.Header><strong>PRIVACY POLICY - 2. Information We Collect</strong></Accordion.Header>
                                <Accordion.Body>
                                    <h6>Personal Information</h6>
                                    <ul>
                                        <li>Full name</li>
                                        <li>Date of birth</li>
                                        <li>Gender</li>
                                        <li>Address</li>
                                        <li>Email address</li>
                                        <li>Mobile number</li>
                                    </ul>
                                    <h6>Identity Information</h6>
                                    <ul>
                                        <li>PAN</li>
                                        <li>Aadhaar (where legally permitted)</li>
                                        <li>Driving Licence</li>
                                        <li>Passport</li>
                                        <li>Voter ID</li>
                                    </ul>
                                    <h6>Financial Information</h6>
                                    <ul>
                                        <li>Bank account details</li>
                                        <li>Income information</li>
                                        <li>Employment information</li>
                                        <li>Credit history information</li>
                                    </ul>
                                    <h6>Healthcare Financing Information</h6>
                                    <ul>
                                        <li>Hospital details</li>
                                        <li>Medical treatment estimates</li>
                                        <li>Medical invoices</li>
                                        <li>Financing requirements</li>
                                    </ul>
                                    <h6>Technical Information</h6>
                                    <ul>
                                        <li>IP address</li>
                                        <li>Device information</li>
                                        <li>Browser information</li>
                                        <li>Website usage data</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="17">
                                <Accordion.Header><strong>PRIVACY POLICY - 3. How We Use Information</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Information may be used to:</p>
                                    <ul>
                                        <li>Process loan applications.</li>
                                        <li>Verify identity.</li>
                                        <li>Conduct KYC.</li>
                                        <li>Prevent fraud.</li>
                                        <li>Improve services.</li>
                                        <li>Comply with legal obligations.</li>
                                        <li>Respond to customer requests.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="18">
                                <Accordion.Header><strong>PRIVACY POLICY - 4. Sharing of Information</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Information may be shared with:</p>
                                    <ul>
                                        <li>Lending Partners For loan assessment and servicing.</li>
                                        <li>Hospitals For treatment financing coordination.</li>
                                        <li>Service Providers For: KYC verification, Fraud prevention, Technology services, Customer support</li>
                                        <li>Government Authorities Where required by law.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="19">
                                <Accordion.Header><strong>PRIVACY POLICY - 5. Data Security</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>We implement reasonable security measures including:</p>
                                    <ul>
                                        <li>Encryption.</li>
                                        <li>Secure servers.</li>
                                        <li>Access controls.</li>
                                        <li>Monitoring systems.</li>
                                    </ul>
                                    <p>No internet transmission can be guaranteed to be completely secure.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="20">
                                <Accordion.Header><strong>PRIVACY POLICY - 6. Data Retention</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Information shall be retained:</p>
                                    <ul>
                                        <li>For legal compliance.</li>
                                        <li>Regulatory requirements.</li>
                                        <li>Contractual obligations.</li>
                                        <li>Fraud prevention purposes.</li>
                                    </ul>
                                    <p>Thereafter information may be deleted or anonymized.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="21">
                                <Accordion.Header><strong>PRIVACY POLICY - 7. User Rights</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Subject to applicable law, users may:</p>
                                    <ul>
                                        <li>Request access to personal data.</li>
                                        <li>Request correction of inaccurate data.</li>
                                        <li>Withdraw consent where applicable.</li>
                                        <li>Request deletion where legally permissible.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="22">
                                <Accordion.Header><strong>PRIVACY POLICY - 8. Cookies</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>We use cookies for:</p>
                                    <ul>
                                        <li>Website functionality.</li>
                                        <li>Analytics.</li>
                                        <li>Security.</li>
                                        <li>User experience improvement.</li>
                                    </ul>
                                    <p>Users may manage cookie preferences through browser settings.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="23">
                                <Accordion.Header><strong>PRIVACY POLICY - 9. Children's Privacy</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Our services are not intended for persons below 18 years of age.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            {/* FAQs SECTION */}
                            <Accordion.Item eventKey="24">
                                <Accordion.Header><strong>FAQ - What is HealthEasy EMI?</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI is a healthcare financing facilitation platform that helps patients access loan products offered by RBI-regulated lenders for eligible medical expenses.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="25">
                                <Accordion.Header><strong>FAQ - Is HealthEasy EMI a lender?</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>No. HealthEasy EMI is a Lending Service Provider and does not lend money directly. Loans are provided only by partner Banks and NBFCs.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="26">
                                <Accordion.Header><strong>FAQ - What medical expenses can be financed?</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Subject to lender approval:</p>
                                    <ul>
                                        <li>Surgeries</li>
                                        <li>Hospitalization</li>
                                        <li>Diagnostic procedures</li>
                                        <li>Dental treatments</li>
                                        <li>Fertility treatments</li>
                                        <li>Cosmetic procedures (where permitted)</li>
                                        <li>Emergency medical care</li>
                                        <li>Specialist consultations</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="27">
                                <Accordion.Header><strong>FAQ - How do I apply?</strong></Accordion.Header>
                                <Accordion.Body>
                                    <ul>
                                        <li>Submit your application.</li>
                                        <li>Upload required documents.</li>
                                        <li>Complete verification.</li>
                                        <li>Receive lender decision.</li>
                                        <li>Review KFS and loan agreement.</li>
                                        <li>Accept the offer digitally.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="28">
                                <Accordion.Header><strong>FAQ - What documents are required?</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Typically:</p>
                                    <ul>
                                        <li>PAN Card</li>
                                        <li>Aadhaar Card</li>
                                        <li>Address proof</li>
                                        <li>Income proof</li>
                                        <li>Bank statement</li>
                                        <li>Medical estimate or hospital invoice</li>
                                    </ul>
                                    <p>Additional documents may be requested.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="29">
                                <Accordion.Header><strong>FAQ - Will applying affect my credit score?</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>The lender may perform a credit bureau enquiry, which may impact your credit profile according to bureau policies.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="30">
                                <Accordion.Header><strong>FAQ - How long does approval take?</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Approval timelines vary based on:</p>
                                    <ul>
                                        <li>Document completeness.</li>
                                        <li>Verification requirements.</li>
                                        <li>Lender processing.</li>
                                    </ul>
                                    <p>Some decisions may be available within minutes, while others may take longer.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="31">
                                <Accordion.Header><strong>FAQ - Can I repay early?</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Prepayment and foreclosure terms depend on the lender and will be disclosed in the loan agreement and KFS.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="32">
                                <Accordion.Header><strong>FAQ - How are loan funds disbursed?</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Depending on the lender and financing arrangement:</p>
                                    <ul>
                                        <li>Directly to the hospital.</li>
                                        <li>Directly to the healthcare provider.</li>
                                        <li>To the borrower where permitted.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="33">
                                <Accordion.Header><strong>FAQ - What if my loan application is rejected?</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Loan approval remains solely at the lender's discretion. HealthEasy EMI cannot influence or overturn lender decisions.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="34">
                                <Accordion.Header><strong>FAQ - How do I protect myself from fraud?</strong></Accordion.Header>
                                <Accordion.Body>
                                    <ul>
                                        <li>Never share OTPs.</li>
                                        <li>Never share passwords.</li>
                                        <li>Verify official communications.</li>
                                        <li>Contact customer support if suspicious activity is detected.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                        </Accordion>

                        {/* BOTTOM DISCLAIMER NOTE */}
                        <div className="mt-4 p-3 bg-light border rounded small text-muted">
                            <p>HealthEasy EMI is a Lending Service Provider (LSP) and not a lender. Loan products are offered solely by RBI-regulated Banks and/or NBFCs. Approval, disbursement, interest rates, tenure, and repayment terms are determined exclusively by the respective lender. Please review the Key Fact Statement (KFS) and loan agreement carefully before accepting any loan offer.</p>
                        </div>

                    </div>
                </Container>
            </section>

            <FooterBar />
        </>
    );
}

export default EmiTC;