// 1) SET YOUR BACKEND ENDPOINT (Google Apps Script Web App URL)
const BACKEND_ENDPOINT = "https://script.google.com/macros/s/AKfycbwsDZyeqDnUVq1IyC1t9yakxpG6pkrtu-oWWwE2K3fDgJ4lMiq6gcSoUBaK3XFfVFvm/execc";

// Translation map (keep as provided)
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
      "Upload your references to Google Drive and set access to ƒ?oAnyone with the link (Viewer)ƒ??, then paste the link here.",
    submit: "Submit Project Brief",
    success_title: "Submitted successfully",
    success_body:
      "Thank you. Your project brief has been received. Weƒ?Tll review it and get back to you shortly.",
    again: "Submit another brief",
    invalid_drive: "Please paste a valid Google Drive link (drive.google.com).",
    required_backend:
      "Backend endpoint is not set. Add your Google Apps Script Web App URL in script.js."
  },
  ar: {
    title: "OOñO3OU, U.U,OrOæ OU,U.O'OñU^O1",
    subtitle: "USOñOªU% O¦O1O\"OÝOc OU,O¦U?OOæUSU, OU,O¦OU,USOc U,U.O3OO1O_O¦U+O U?US OO1O_OO_ O1OñO O3O1Oñ U.U+OO3O\".",
    company_label: "OO3U. OU,O'OñUŸOc",
    event_label: "OO3U. OU,U?O1OU,USOc / OU,U.O'OñU^O1",
    brief_label: "U^OæU? OU,U?O1OU,USOc / OU,U.O'OñU^O1",
    req_label: "OU,U.O¦OúU,O\"OO¦ O\"OOrO¦OæOOñ",
    req_hint:
      "OOøUŸOñ OU,U.OrOñOªOO¦ OU,U.OúU,U^O\"Oc (OæU^OñOO U?USO_USU^OO OœU^ OU,OO®U+USU+ U.O1OU<)OO U.O1 OU,O1O_O_ U^OU,OúOO\"O1/OU,OœO3U,U^O\" U^OœUS U.OñOOªO1 OU+ U^OªO_O¦.",
    drive_label: "OñOO\"Oú OU,U.U,U?OO¦ (Google Drive)",
    drive_hint:
      "U,U. O\"OñU?O1 OU,U.OñOOªO1 O1U,U% Google Drive O®U. OOO\"Oú OU,U.O'OOñUŸOc O1U,U% ƒ?oOœUS O'OrOæ U,O_USUØ OU,OñOO\"Oú (O1OñO)ƒ?? U^OU,OæU, OU,OñOO\"Oú UØU+O.",
    submit: "OOñO3OU, OU,OúU,O\"",
    success_title: "O¦U. OU,OOñO3OU, O\"U+OªOO-",
    success_body:
      "O'UŸOñOU< U,UŸ. O¦U. OO3O¦U,OU. U.U,OrOæ OU,U.O'OñU^O1 U^O3U+U,U^U. O\"U.OñOOªO1O¦UØ U^OU,OñO_ O1U,USUŸ U,OñUSO\"OU<.",
    again: "OOñO3OU, OúU,O\" OªO_USO_",
    invalid_drive: "USOñOªU% OO_OrOU, OñOO\"Oú Google Drive OæO-USO- (drive.google.com).",
    required_backend:
      "U,U. USO¦U. OO\"Oú OñOO\"Oú OU,OO3O¦U,O\"OU,. OO1 OñOO\"Oú Google Apps Script Web App O_OOrU, script.js."
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bxForm");
  const formCard = document.getElementById("formCard");
  const successCard = document.getElementById("successCard");

  const driveInput = document.getElementById("drive_link");
  const driveError = document.getElementById("driveError");

  const langButtons = document.querySelectorAll(".pill");
  const newSubmissionBtn = document.getElementById("newSubmissionBtn");
  const logoBar = document.getElementById("logoBar");

  const textTargets = {
    title: document.getElementById("t_title"),
    subtitle: document.getElementById("t_subtitle"),
    company: document.querySelector('label[for="company_name"]'),
    event: document.querySelector('label[for="event_name"]'),
    brief: document.querySelector('label[for="project_brief"]'),
    req: document.querySelector('label[for="requirements"]'),
    reqHint: document.getElementById("t_req_hint"),
    drive: document.querySelector('label[for="drive_link"]'),
    driveHint: document.getElementById("t_drive_hint"),
    submit: document.getElementById("t_submit"),
    successTitle: document.getElementById("t_success_title"),
    successBody: document.getElementById("t_success_body")
  };

  if (!form || !formCard) {
    console.warn("BX form: expected form elements not found; script skipped.");
    return;
  }

  let currentLang = "en";

  const setText = (el, text) => {
    if (el) el.innerText = text;
  };

  // Apply language text + direction (safe against missing nodes)
  function applyLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    document.body.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    langButtons.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    setText(textTargets.title, T[lang].title);
    setText(textTargets.subtitle, T[lang].subtitle);
    setText(textTargets.company, T[lang].company_label);
    setText(textTargets.event, T[lang].event_label);
    setText(textTargets.brief, T[lang].brief_label);
    setText(textTargets.req, T[lang].req_label);
    setText(textTargets.reqHint, T[lang].req_hint);
    setText(textTargets.drive, T[lang].drive_label);
    setText(textTargets.driveHint, T[lang].drive_hint);
    setText(textTargets.submit, T[lang].submit);
    setText(textTargets.successTitle, T[lang].success_title);
    setText(textTargets.successBody, T[lang].success_body);
    if (newSubmissionBtn) newSubmissionBtn.innerText = T[lang].again;

    if (driveError) driveError.innerText = "";
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
  if (newSubmissionBtn) {
    newSubmissionBtn.addEventListener("click", () => {
      form.reset();
      if (successCard) successCard.classList.add("hidden");
      formCard.classList.remove("hidden");
      if (driveError) driveError.innerText = "";
    });
  }

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate drive link (optional)
    const driveVal = driveInput ? driveInput.value.trim() : "";
    if (driveInput && driveError && !isValidDriveLink(driveVal)) {
      driveError.innerText = T[currentLang].invalid_drive;
      driveInput.focus();
      return;
    } else if (driveError) {
      driveError.innerText = "";
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
      if (successCard) {
        successCard.classList.remove("hidden");
      } else {
        alert("Submitted successfully.");
        formCard.classList.remove("hidden");
      }
    } catch (err) {
      alert("Error submitting form. Please try again.");
    }
  });

  // Logo behavior
  if (logoBar) {
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
  }

  // Init
  applyLang("en");
});
