import { API_BASE_URL } from '../config';
import { buildHealthBotSystemPrompt } from './chatbotSystemPrompt';

const MAX_DOCTORS_IN_PROMPT = 40;
const MAX_SURGERIES_IN_PROMPT = 30;
const MAX_BLOGS_IN_PROMPT = 8;
const MAX_HOSPITALS_IN_PROMPT = 35;

async function postJson(url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = token;
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok && !(data.Status === 200 || data.IsSuccess)) {
    return null;
  }
  return data.Data ?? null;
}

function normalizeKey(str = '') {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

function extractHospitalsFromDoctors(doctorsList) {
  const map = new Map();
  doctorsList.forEach((doc) => {
    (doc.hospitals || []).forEach((h) => {
      if (!h?.name) return;
      const key = `${normalizeKey(h.name)}_${normalizeKey(h.city || '')}`;
      if (!map.has(key)) {
        map.set(key, {
          name: h.name,
          city: h.city || '',
          address: h.address || h.location || '',
          state: h.state || '',
        });
      }
    });
  });
  return Array.from(map.values());
}

function summarizeDoctor(doc) {
  const consult = doc.consultationsDetails || {};
  const hospitals = (doc.hospitals || []).map((h) => h.name).filter(Boolean).join('; ') || 'N/A';
  const surgeryNames = (doc.surgeriesDetails || [])
    .map((s) => s.name || s.surgerytypeid?.surgerytypename)
    .filter(Boolean)
    .slice(0, 5)
    .join(', ');

  return {
    id: doc._id,
    name: doc.name,
    specialty: doc.specialty || doc.specialization || 'General',
    subSpecialty: doc.sub_specialty || '',
    city: doc.city || '',
    rating: doc.averageRating ?? 0,
    experience: doc.experience || '',
    hospitals,
    fees: {
      clinic: consult.clinic_visit_price,
      home: consult.home_visit_price,
      eopd: consult.eopd_price,
    },
    surgeries: surgeryNames || 'none listed',
    profilePath: `/doctorprofile/${doc._id}`,
  };
}

function serializeContextPayload(payload) {
  const { doctors, hospitals, surgeries, blogs, meta } = payload;

  const doctorLines = doctors.slice(0, MAX_DOCTORS_IN_PROMPT).map((d) => (
    `DR|${d.id}|${d.name}|${d.specialty}|${d.city}|Hospitals:${d.hospitals}|Fees:Clinic ₹${d.fees.clinic ?? '-'}, Home ₹${d.fees.home ?? '-'}, E-OPD ₹${d.fees.eopd ?? '-'}|Rating:${d.rating}|Surgeries:${d.surgeries}|Link:${d.profilePath}`
  ));

  const hospitalLines = hospitals.slice(0, MAX_HOSPITALS_IN_PROMPT).map((h) => (
    `HOSP|${h.name}|${h.city}|${h.address || ''}`
  ));

  const surgeryLines = surgeries.slice(0, MAX_SURGERIES_IN_PROMPT).map((s) => (
    `SURG|${s.name}|Type:${s.type}|From ₹${s.price ?? '—'}|Doctor:${s.doctorName || '—'}`
  ));

  const blogLines = blogs.slice(0, MAX_BLOGS_IN_PROMPT).map((b) => (
    `BLOG|${b.id}|${b.title}|By ${b.author}|/blog/${b.id}`
  ));

  return [
    `=== META ===`,
    `Total doctors: ${meta.totalDoctors}, hospitals: ${meta.totalHospitals}, surgeries: ${meta.totalSurgeries}, blogs: ${meta.totalBlogs}`,
    `Fetched at: ${meta.fetchedAt}`,
    `=== DOCTORS (${doctorLines.length} shown) ===`,
    ...doctorLines,
    meta.totalDoctors > MAX_DOCTORS_IN_PROMPT ? `...and ${meta.totalDoctors - MAX_DOCTORS_IN_PROMPT} more doctors — use [Find Doctors](/doctorfind)` : '',
    `=== HOSPITALS (${hospitalLines.length} shown) ===`,
    ...hospitalLines,
    `=== SURGERY PROCEDURES (${surgeryLines.length} shown) ===`,
    ...surgeryLines,
    `=== BLOGS ===`,
    ...blogLines,
  ].filter(Boolean).join('\n');
}

/**
 * @param {object} userSession from getUserData()
 */
export function buildUserContextBlock(userSession) {
  if (!userSession?.token || !userSession?.name) {
    return 'Guest visitor — not logged in. Suggest [Patient Login](/patient) for appointments and EMI status.';
  }
  return `Logged-in ${userSession.role}: ${userSession.name}, mobile: ${userSession.mobile || 'on file'}. Personalized booking available via chat quick actions.`;
}

/**
 * Fetch live site data for HealthBot's context.
 * @param {string|null} authToken Bearer token optional (for blogs)
 */
export async function fetchSiteContextPayload(authToken = null) {
  const [doctorsRaw, surgeriesRaw, blogsRaw] = await Promise.all([
    postJson(`${API_BASE_URL}/user/doctors/list`, { search: '' }),
    postJson(`${API_BASE_URL}/user/surgeries/list`, { search: '' }),
    postJson(`${API_BASE_URL}/user/blogs`, { search: '', page: 1, limit: 10 }, authToken),
  ]);

  const doctorsList = Array.isArray(doctorsRaw) ? doctorsRaw : [];
  const surgeriesList = Array.isArray(surgeriesRaw) ? surgeriesRaw : [];
  const blogsList = blogsRaw?.docs || (Array.isArray(blogsRaw) ? blogsRaw : []);

  const doctors = doctorsList.map(summarizeDoctor);
  const hospitals = extractHospitalsFromDoctors(doctorsList);

  const doctorNameById = new Map(doctorsList.map((d) => [d._id, d.name]));

  const surgeries = surgeriesList.map((s) => ({
    id: s._id,
    name: s.name,
    type: s.surgerytype || s.surgerytypeid?.surgerytypename || '',
    price: s.price || s.general_price,
    doctorName: doctorNameById.get(s.doctorid) || s.doctorid,
  }));

  const blogs = blogsList.map((b) => ({
    id: b._id,
    title: b.title,
    author: b.createdBy?.name || 'Doctor',
  }));

  const payload = {
    doctors,
    hospitals,
    surgeries,
    blogs,
    meta: {
      totalDoctors: doctors.length,
      totalHospitals: hospitals.length,
      totalSurgeries: surgeries.length,
      totalBlogs: blogs.length,
      fetchedAt: new Date().toISOString(),
    },
  };

  return {
    payload,
    contextText: serializeContextPayload(payload),
  };
}

export async function loadChatbotContext(userSession) {
  const token = userSession?.token || null;
  const { payload, contextText } = await fetchSiteContextPayload(token);
  const userContextBlock = buildUserContextBlock(userSession);
  const systemPrompt = buildHealthBotSystemPrompt({ siteContextBlock: contextText, userContextBlock });
  return { payload, contextText, userContextBlock, systemPrompt };
}

/**
 * Context-aware offline/demo replies using live payload.
 */
export function generateDemoReply(text, payload, userSession) {
  const lower = text.toLowerCase();
  const name = userSession?.name;

  if (lower.includes('hello') || lower.includes('hi ') || lower === 'hi' || lower.includes('hey')) {
    return name
      ? `Hello ${name}! I am HealthBot from Healtheasy EMI. I have ${payload?.meta?.totalDoctors ?? 0} doctors and ${payload?.meta?.totalHospitals ?? 0} hospitals on file. How can I help?`
      : `Hello! I am HealthBot from Healtheasy EMI. Ask about doctors, hospitals, surgeries, or use a quick-reply button below.`;
  }

  if (lower.includes('emi status') || lower.includes('check emi')) {
    return 'I am checking your Bill EMI status for you now... [TRIGGER_EMI]';
  }

  if (lower.includes('loan') || lower.includes('emi apply') || lower.includes('upload')) {
    return 'I will start the Medical Loan application for you right away. [TRIGGER_LOAN]';
  }

  if (lower.includes('ambulance')) {
    return 'I am initiating the emergency Ambulance booking sequence. Please hold on. [TRIGGER_AMBULANCE]';
  }

  if (lower.includes('book surgery') || lower.includes('surgery appointment')) {
    return 'Let me pull up the Surgery Appointment booking wizard for you. [TRIGGER_SURGERY]';
  }

  if (lower.includes('appointment') || lower.includes('eopd') || lower.includes('clinic')) {
    return 'I will open the Doctor Appointment booking screen for you. [TRIGGER_DOCTOR]';
  }

  if (lower.includes('hospital') || lower.includes('find doctor') || lower.includes('doctor near')) {
    const matchedDocs = searchDoctors(text, payload?.doctors || []).slice(0, 3);
    const matchedHosp = searchHospitals(text, payload?.hospitals || []).slice(0, 3);
    if (matchedDocs.length || matchedHosp.length) {
      let reply = 'Here are some matches from our network:\n';
      matchedHosp.forEach((h) => { reply += `Hospital: ${h.name} (${h.city}) — [Hospitals](/hospitallist)\n`; });
      matchedDocs.forEach((d) => { reply += `Dr. ${d.name} (${d.specialty}, ${d.city}) — [View profile](${d.profilePath})\n`; });
      reply += 'Let me show you the full discovery panel. [TRIGGER_FIND]';
      return reply.trim();
    }
    return `We have ${payload?.meta?.totalHospitals ?? 0} hospitals and ${payload?.meta?.totalDoctors ?? 0} doctors. Let me open the search tool for you. [TRIGGER_FIND]`;
  }

  if (lower.includes('surgery') && payload?.surgeries?.length) {
    const hits = searchSurgeries(text, payload.surgeries).slice(0, 4);
    if (hits.length) {
      return `Surgeries: ${hits.map((s) => `${s.name} (${s.type}, from ₹${s.price ?? '—'})`).join('; ')}. Details on [Surgery & EMI](/surgerypage). Book via "Book Surgery Appointment".`;
    }
  }

  if (lower.includes('blog')) {
    const b = payload?.blogs?.[0];
    return b
      ? `Latest: "${b.title}" by ${b.author} — [Read Blog](/blog/${b.id}). More at [Blog](/blog).`
      : 'Read health articles at [Blog](/blog).';
  }

  if (lower.includes('contact') || lower.includes('expert') || lower.includes('support')) {
    return 'I will connect you with a human expert right now. [TRIGGER_EXPERT]';
  }

  const docMatch = searchDoctors(text, payload?.doctors || []);
  if (docMatch.length === 1) {
    const d = docMatch[0];
    return `Dr. ${d.name} — ${d.specialty} in ${d.city}. Hospitals: ${d.hospitals}. Fees: Clinic ₹${d.fees.clinic ?? '-'}, E-OPD ₹${d.fees.eopd ?? '-'}. [Book via chat](${d.profilePath}) or type "Book Appointment with Doctor".`;
  }

  return `I am in Demo Mode (add REACT_APP_DEEPSEEK_API_KEY for full AI). We have ${payload?.meta?.totalDoctors ?? 0} doctors on the platform. Try "Find Hospital / Doctor", [FAQ](/faq), or [Contact](/contact).`;
}

function searchDoctors(query, doctors) {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (!terms.length) return doctors.slice(0, 5);
  return doctors.filter((d) => {
    const blob = `${d.name} ${d.specialty} ${d.city} ${d.hospitals}`.toLowerCase();
    return terms.some((t) => blob.includes(t));
  });
}

function searchHospitals(query, hospitals) {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (!terms.length) return hospitals.slice(0, 5);
  return hospitals.filter((h) => {
    const blob = `${h.name} ${h.city}`.toLowerCase();
    return terms.some((t) => blob.includes(t));
  });
}

function searchSurgeries(query, surgeries) {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  return surgeries.filter((s) => {
    const blob = `${s.name} ${s.type}`.toLowerCase();
    return terms.some((t) => blob.includes(t));
  });
}

export { buildHealthBotSystemPrompt };
