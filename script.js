// 1) SET YOUR BACKEND ENDPOINT (Google Apps Script Web App URL)
const BACKEND_ENDPOINT = "https://script.google.com/macros/s/AKfycby4tVeuqaJU0MZi_iMDD5R1VBV4P_WK1qHK7HIIuGL290wEAtAND31GLsd1a0I_-oip/exec";

// Elements
const form = document.getElementById("bxForm");
const formCard = document.getElementById("formCard");
const successCard = document.getElementById("successCard");

const driveInput = document.getElementById("drive_link");
const driveError = document.getElementById("driveError");

const langButtons = document.querySelectorAll(".pill");
const newSubmissionBtn = document.getElementById("newSubmissionBtn");

// Translation map
const T = {
  en: {
    title: "Project Brief Submission",
    subtitle: "Share your project details so we can prepare a tailored proposal.",
    company_label: "Company Name",
    event_label: "Event / Project Name",
    brief_label: "Event / Project Brief",
    req_label: "Requirement in Brief",
    req_hint:
      "Tell us the required output (photos, videos, or both). Include quantity, style, and references if available.",
    drive_label: "Reference Files (Google Drive Link)",
    drive_hint:
      "Upload your references to Google Drive and set access to “Anyone with the link (Viewer)”, then paste the link here.",
    submit: "Submit Project Brief",
    success_title: "Submitted successfully",
    success_body:
      "Thank you. Your project brief has been received. We’ll review it and get back to you shortly.",
    again: "Submit another brief",
    invalid_drive: "Please paste a valid Google Drive link (drive.google.com).",
    required_backend:
      "Backend endpoint is not set. Add your Google Apps Script Web App URL in script.js."
  },
  ar: {
    title: "إرسال ملخص المشروع",
    subtitle: "يرجى تعبئة التفاصيل التالية لمساعدتنا في إعداد عرض سعر مناسب.",
    company_label: "اسم الشركة",
    event_label: "اسم الفعالية / المشروع",
    brief_label: "وصف الفعالية / المشروع",
    req_label: "المتطلبات باختصار",
    req_hint:
      "اذكر المخرجات المطلوبة (صور، فيديو، أو الاثنين معاً)، مع العدد والطابع/الأسلوب وأي مراجع إن وجدت.",
    drive_label: "رابط الملفات (Google Drive)",
    drive_hint:
      "قم برفع المراجع على Google Drive ثم اضبط المشاركة على “أي شخص لديه الرابط (عرض)” والصق الرابط هنا.",
    submit: "إرسال الطلب",
    success_title: "تم الإرسال بنجاح",
    success_body:
      "شكراً لك. تم استلام ملخص المشروع وسنقوم بمراجعته والرد عليك قريباً.",
    again: "إرسال طلب جديد",
    invalid_drive: "يرجى إدخال رابط Google Drive صحيح (drive.google.com).",
    required_backend:
      "لم يتم ضبط رابط الاستقبال. ضع رابط Google Apps Script Web App داخل script.js."
  }
};

let currentLang = "en";

// Apply language text + direction
function applyLang(lang) {
  currentLang = lang;

  // Direction
  document.documentElement.lang = lang;
  document.body.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

  // Toggle active button
  langButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  // Text nodes
  document.getElementById("t_title").innerText = T[lang].title;
  document.getElementById("t_subtitle").innerText = T[lang].subtitle;

  document.querySelector('label[for="company_name"]').innerText = T[lang].company_label;
  document.querySelector('label[for="event_name"]').innerText = T[lang].event_label;
  document.querySelector('label[for="project_brief"]').innerText = T[lang].brief_label;

  document.querySelector('label[for="requirements"]').innerText = T[lang].req_label;
  document.getElementById("t_req_hint").innerText = T[lang].req_hint;

  document.querySelector('label[for="drive_link"]').innerText = T[lang].drive_label;
  document.getElementById("t_drive_hint").innerText = T[lang].drive_hint;

  document.getElementById("t_submit").innerText = T[lang].submit;

  document.getElementById("t_success_title").innerText = T[lang].success_title;
  document.getElementById("t_success_body").innerText = T[lang].success_body;
  newSubmissionBtn.innerText = T[lang].again;

  // Clear errors
  driveError.innerText = "";
}

// Basic drive link validation
function isValidDriveLink(url) {
  if (!url) return true; // optional field
  try {
    const u = new URL(url);
    return u.hostname.includes("drive.google.com");
  } catch {
    return false;
  }
}

// Language switch
langButtons.forEach(btn => {
  btn.addEventListener("click", () => applyLang(btn.dataset.lang));
});

// Reset to new submission
newSubmissionBtn.addEventListener("click", () => {
  form.reset();
  successCard.classList.add("hidden");
  formCard.classList.remove("hidden");
  driveError.innerText = "";
});

// Submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate drive link (optional)
  const driveVal = driveInput.value.trim();
  if (!isValidDriveLink(driveVal)) {
    driveError.innerText = T[currentLang].invalid_drive;
    driveInput.focus();
    return;
  }

  // Backend check
  if (!BACKEND_ENDPOINT || BACKEND_ENDPOINT.includes("YOUR_GOOGLE")) {
    alert(T[currentLang].required_backend);
    return;
  }

  // Build payload
  const fd = new FormData(form);
  // send language as well (useful for your sheet)
  fd.append("lang", currentLang);

  try {
    await fetch(BACKEND_ENDPOINT, {
      method: "POST",
      body: fd
    });

    // Show success
    formCard.classList.add("hidden");
    successCard.classList.remove("hidden");
  } catch (err) {
    alert("Error submitting form. Please try again.");
  }
});

const logoBar = document.getElementById("logoBar");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  // Sticky behavior
  if (scrollY > 40) {
    logoBar.classList.add("sticky");
  } else {
    logoBar.classList.remove("sticky");
  }

  // Subtle parallax (very light)
  const parallaxOffset = Math.min(scrollY * 0.08, 6);
  logoBar.style.transform = `translateY(${parallaxOffset}px)`;
});


// Init
applyLang("en");
