import { useEffect, useState } from "react";
import { Container, Accordion } from "react-bootstrap";
import CryptoJS from "crypto-js";
import NavBar from "../Component/NavBar";
import FooterBar from "../Component/FooterBar";
import { SECRET_KEY, STORAGE_KEYS } from '../../config';

function FinanceTC() {
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
        document.title = "HealthEasy EMI – Terms & Conditions";
    }, []);

    return (
        <>
            <NavBar logindata={logdata} />
            
            {/* breadcrumb section */}
            <section className='breadcrumb_Sec'>
                <Container className='text-center'>
                    <h2>HealthEasy EMI – Terms & Conditions</h2>
                </Container>
            </section>
            
            <section className="py-5 bg-light">
                <Container>
                    <div className="p-4 bg-white border rounded shadow-sm">
                        <Accordion defaultActiveKey="0" className='faq-accordion'>
                            
                            <Accordion.Item eventKey="0">
                                <Accordion.Header><strong>1. About HealthEasy EMI</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI ("Platform", "we", "our", "us") is a technology-enabled healthcare financing facilitation platform that acts as a Lending Service Provider ("LSP") for one or more RBI-regulated Banks and/or Non-Banking Financial Companies ("NBFCs").</p>
                                    <p>HealthEasy EMI does not provide loans, does not accept deposits, and does not make credit decisions.</p>
                                    <p>All loan approvals, rejections, interest rates, tenures, charges, disbursements, collections, and recovery actions are determined solely by the respective lending partner.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="1">
                                <Accordion.Header><strong>2. Acceptance of Terms</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>By accessing or using the Platform, you agree to:</p>
                                    <ul>
                                        <li>Terms and Conditions;</li>
                                        <li>Privacy Policy;</li>
                                        <li>Consent and Authorization Policy;</li>
                                        <li>Any lender-specific loan agreements and disclosures.</li>
                                    </ul>
                                    <p>If you do not agree, you must discontinue use of the Platform.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="2">
                                <Accordion.Header><strong>3. Eligibility</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>To use the Platform, you must:</p>
                                    <ul>
                                        <li>Be at least 18 years old;</li>
                                        <li>Be legally competent to enter contracts under Indian law;</li>
                                        <li>Possess valid KYC documents;</li>
                                        <li>Provide true, accurate, and complete information;</li>
                                        <li>Satisfy lender eligibility requirements.</li>
                                    </ul>
                                    <p>Loan eligibility remains solely at the discretion of the lender.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="3">
                                <Accordion.Header><strong>4. Nature of Services</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may provide:</p>
                                    <ul>
                                        <li>Loan discovery services;</li>
                                        <li>Medical financing facilitation;</li>
                                        <li>Application processing assistance;</li>
                                        <li>Document collection;</li>
                                        <li>Identity verification support;</li>
                                        <li>Communication between borrowers, healthcare providers, and lenders.</li>
                                    </ul>
                                    <p>HealthEasy EMI does not:</p>
                                    <ul>
                                        <li>Guarantee loan approval;</li>
                                        <li>Influence lender underwriting decisions;</li>
                                        <li>Determine interest rates;</li>
                                        <li>Collect loan repayments in its own account;</li>
                                        <li>Hold customer loan funds.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="4">
                                <Accordion.Header><strong>5. Lending Partners</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Loans facilitated through the Platform are provided only by RBI-regulated lending institutions.</p>
                                    <p>The Platform shall clearly disclose:</p>
                                    <ul>
                                        <li>Name of lender;</li>
                                        <li>Loan amount;</li>
                                        <li>Interest rate/APR;</li>
                                        <li>Tenure;</li>
                                        <li>Applicable charges;</li>
                                        <li>Penal charges;</li>
                                        <li>Link to Key Fact Statement (KFS).</li>
                                    </ul>
                                    <p>Where multiple lenders are available, offers may be displayed in a neutral and comparable manner as required by RBI regulations.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="5">
                                <Accordion.Header><strong>6. Loan Application</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Submission of an application does not guarantee approval.</p>
                                    <p>The lender may independently:</p>
                                    <ul>
                                        <li>Verify identity;</li>
                                        <li>Verify employment;</li>
                                        <li>Verify income;</li>
                                        <li>Conduct bureau checks;</li>
                                        <li>Assess creditworthiness;</li>
                                        <li>Request additional documents.</li>
                                    </ul>
                                    <p>The lender may approve, modify, or reject applications without obligation to provide financing.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="6">
                                <Accordion.Header><strong>7. Key Fact Statement (KFS)</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Prior to loan execution, borrowers shall receive a Key Fact Statement issued by the lender.</p>
                                    <p>The KFS shall contain:</p>
                                    <ul>
                                        <li>Loan amount;</li>
                                        <li>Annual Percentage Rate (APR);</li>
                                        <li>Processing fees;</li>
                                        <li>Repayment schedule;</li>
                                        <li>Tenure;</li>
                                        <li>Recovery process;</li>
                                        <li>Cooling-off period;</li>
                                        <li>Grievance details.</li>
                                    </ul>
                                    <p>Borrowers are advised to carefully review the KFS before accepting any loan offer.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="7">
                                <Accordion.Header><strong>8. Consent and Credit Bureau Authorization</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>By using the Platform, you expressly authorize HealthEasy EMI and its lending partners to:</p>
                                    <ul>
                                        <li>Verify identity information;</li>
                                        <li>Conduct KYC checks;</li>
                                        <li>Obtain credit reports;</li>
                                        <li>Verify employment and income;</li>
                                        <li>Validate submitted information.</li>
                                    </ul>
                                    <p>Credit bureau inquiries may be conducted through:</p>
                                    <ul>
                                        <li>TransUnion CIBIL</li>
                                        <li>Experian</li>
                                        <li>Equifax</li>
                                        <li>CRIF High Mark</li>
                                    </ul>
                                    <p>as permitted by applicable law.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="8">
                                <Accordion.Header><strong>9. Healthcare Information</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>For financing healthcare services, users may voluntarily provide:</p>
                                    <ul>
                                        <li>Hospital information;</li>
                                        <li>Medical invoices;</li>
                                        <li>Treatment estimates;</li>
                                        <li>Diagnostic costs;</li>
                                        <li>Healthcare provider details.</li>
                                    </ul>
                                    <p>Such information shall be processed solely for loan evaluation, servicing, regulatory compliance, and related purposes.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="9">
                                <Accordion.Header><strong>10. Data Privacy</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI processes personal data in accordance with its Privacy Policy and applicable Indian laws.</p>
                                    <p>The Platform shall collect only information reasonably necessary for:</p>
                                    <ul>
                                        <li>Loan facilitation;</li>
                                        <li>KYC compliance;</li>
                                        <li>Fraud prevention;</li>
                                        <li>Customer support;</li>
                                        <li>Regulatory obligations.</li>
                                    </ul>
                                    <p>Users may withdraw consent for future processing, subject to applicable legal and contractual requirements.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="10">
                                <Accordion.Header><strong>11. Communications</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Users consent to receiving:</p>
                                    <ul>
                                        <li>Email communications;</li>
                                        <li>SMS notifications;</li>
                                        <li>WhatsApp messages;</li>
                                        <li>Phone calls;</li>
                                        <li>Push notifications.</li>
                                    </ul>
                                    <p>These communications may relate to:</p>
                                    <ul>
                                        <li>Loan applications;</li>
                                        <li>Verification;</li>
                                        <li>EMI reminders;</li>
                                        <li>Service updates;</li>
                                        <li>Regulatory disclosures.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="11">
                                <Accordion.Header><strong>12. User Obligations</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Users agree not to:</p>
                                    <ul>
                                        <li>Submit forged documents;</li>
                                        <li>Misrepresent identity;</li>
                                        <li>Provide false information;</li>
                                        <li>Use the Platform for unlawful purposes;</li>
                                        <li>Attempt unauthorized access to systems.</li>
                                    </ul>
                                    <p>Violation may result in account suspension, reporting to authorities, and legal action.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="12">
                                <Accordion.Header><strong>13. Disbursement and Repayment</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Loan disbursement and repayment shall occur directly between the borrower and the lender in accordance with applicable RBI requirements and lender policies. HealthEasy EMI is not responsible for repayment processing conducted by the lender.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="13">
                                <Accordion.Header><strong>14. Recovery and Collections</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>Recovery activities shall be undertaken only by authorized representatives of the lender and in accordance with applicable RBI regulations.</p>
                                    <p>HealthEasy EMI does not authorize harassment, intimidation, abusive communication, or unlawful recovery practices.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="14">
                                <Accordion.Header><strong>15. Limitation of Liability</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI shall not be liable for:</p>
                                    <ul>
                                        <li>Loan rejection;</li>
                                        <li>Interest rate determination;</li>
                                        <li>Credit assessment outcomes;</li>
                                        <li>Lender decisions;</li>
                                        <li>Hospital treatment outcomes;</li>
                                        <li>Delays caused by third parties;</li>
                                        <li>Borrower defaults.</li>
                                    </ul>
                                    <p>The Platform is provided on an "as available" basis.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="15">
                                <Accordion.Header><strong>16. Intellectual Property</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>All trademarks, trade names, logos, software, website content, graphics, and materials are the exclusive property of HealthEasy EMI unless otherwise stated.</p>
                                    <p>Unauthorized use is prohibited.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="16">
                                <Accordion.Header><strong>17. Suspension and Termination</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI may suspend or terminate user access for:</p>
                                    <ul>
                                        <li>Fraud;</li>
                                        <li>Misrepresentation;</li>
                                        <li>Regulatory reasons;</li>
                                        <li>Violation of these Terms;</li>
                                        <li>Security concerns.</li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="17">
                                <Accordion.Header><strong>18. Grievance Redressal</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI Grievance Officer<br />
                                    Email: healtheasyemi@gmail.com<br />
                                    Phone: +91 8855919195<br />
                                    Address: Office no.23, 3rd Floor, Aston Plaza, Narhe Ambegaon Rd, above Star Bazaar, Ambegaon Budruk, Pune, Maharashtra 411046</p>
                                    <p>Complaints may be submitted through email, website, or customer support channels.</p>
                                    <p>For loan-related matters, borrowers may also contact the respective lender's grievance officer.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="18">
                                <Accordion.Header><strong>19. Governing Law</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>These Terms shall be governed by the laws of India.</p>
                                    <p>Any disputes shall be subject to the exclusive jurisdiction of the courts at Pune, Maharashtra, unless otherwise required by applicable law.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                            <Accordion.Item eventKey="19">
                                <Accordion.Header><strong>20. Amendments</strong></Accordion.Header>
                                <Accordion.Body>
                                    <p>HealthEasy EMI reserves the right to amend these Terms at any time.</p>
                                    <p>Updated Terms shall be published on the Platform and become effective upon publication.</p>
                                </Accordion.Body>
                            </Accordion.Item>

                        </Accordion>

                        {/* BOTTOM DISCLAIMER NOTE */}
                        <div className="mt-4 p-3 bg-light border rounded small text-muted">
                            <p>HealthEasy EMI is a Lending Service Provider (LSP) and does not provide loans. All loans are offered and sanctioned solely by RBI-regulated Banks and/or NBFCs subject to eligibility, credit assessment, and lender policies. HealthEasy EMI does not guarantee loan approval. Please read the Key Fact Statement (KFS) and loan agreement carefully before accepting any loan offer.</p>
                        </div>

                    </div>
                </Container>
            </section>

            <FooterBar />
        </>
    );
}

export default FinanceTC;