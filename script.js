// 1) SET YOUR BACKEND ENDPOINT (Google Apps Script Web App URL)
const BACKEND_ENDPOINT = "https://script.google.com/macros/s/AKfycbzTqASZLBRj9ofNJQEum5NstALONdse7yDlb_2QPNL7jwMm5rLtDUMu17dS7j9Dw0uk/exec";

const STORAGE_KEY = "bx_media_intake_v1";
const FORM_VERSION = "v1";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("bxForm");
  const formCard = document.getElementById("formCard");
  const successCard = document.getElementById("successCard");

  const stepLabel = document.getElementById("stepLabel");
  const stepTitle = document.getElementById("stepTitle");
  const progressFill = document.getElementById("progressFill");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const submitBtn = document.getElementById("submitBtn");
  const newSubmissionBtn = document.getElementById("newSubmissionBtn");

  const deadlineWrap = document.getElementById("deadlineWrap");
  const deadlineInput = document.getElementById("deadline");
  const projectTypesOther = document.getElementById("project_types_other");
  const shootLocationOther = document.getElementById("shoot_location_other");
  const logoBar = document.getElementById("logoBar");

  const steps = Array.from(document.querySelectorAll(".form-step"));
  const totalSteps = steps.length;
  let currentStep = 0;

  if (!form || !formCard || !successCard || steps.length === 0) {
    console.warn("BX form: expected form elements not found; script skipped.");
    return;
  }

  function generateId() {
    if (window.crypto && crypto.randomUUID) {
      return `proj_${crypto.randomUUID()}`;
    }
    const random = Math.random().toString(36).slice(2, 8);
    return `proj_${Date.now()}_${random}`;
  }

  function normalizeLeadSource(value) {
    if (!value) return "Website";
    const lowered = value.toLowerCase();
    if (lowered.includes("insta") || lowered === "ig") return "Instagram";
    if (lowered.includes("refer")) return "Referral";
    if (lowered.includes("web")) return "Website";
    return "Website";
  }

  function detectLeadSource() {
    const params = new URLSearchParams(window.location.search);
    const manual = params.get("lead_source") || params.get("source") || params.get("utm_source");
    if (manual) return normalizeLeadSource(manual);
    const ref = document.referrer.toLowerCase();
    if (ref.includes("instagram.com")) return "Instagram";
    return "Website";
  }

  function detectClientType() {
    const params = new URLSearchParams(window.location.search);
    return params.get("client_type") || "";
  }

  function toggleInline(el, shouldShow) {
    if (!el) return;
    el.classList.toggle("is-visible", shouldShow);
  }

  function updateInlineFields() {
    const timelineValue = form.querySelector("input[name=\"timeline\"]:checked")?.value || "";
    toggleInline(deadlineWrap, timelineValue === "Specific date");
    if (timelineValue !== "Specific date" && deadlineInput) {
      deadlineInput.value = "";
    }

    const shootLocationValue = form.querySelector("input[name=\"shoot_location\"]:checked")?.value || "";
    toggleInline(shootLocationOther, shootLocationValue === "Other city");
    if (shootLocationValue !== "Other city" && shootLocationOther) {
      shootLocationOther.value = "";
    }

    const otherProjectType = form.querySelector("input[name=\"project_types\"][value=\"Other\"]");
    const showProjectOther = otherProjectType ? otherProjectType.checked : false;
    toggleInline(projectTypesOther, showProjectOther);
    if (!showProjectOther && projectTypesOther) {
      projectTypesOther.value = "";
    }
  }

  function showStep(index) {
    steps.forEach((step, idx) => {
      step.classList.toggle("active", idx === index);
    });

    const stepNumber = index + 1;
    const title = steps[index].dataset.title || "";
    if (stepLabel) stepLabel.textContent = `Step ${stepNumber} of ${totalSteps}`;
    if (stepTitle) stepTitle.textContent = title;
    if (progressFill) {
      const percent = Math.round((stepNumber / totalSteps) * 100);
      progressFill.style.width = `${percent}%`;
    }

    if (prevBtn) prevBtn.style.display = index === 0 ? "none" : "inline-flex";
    if (nextBtn) nextBtn.style.display = index === totalSteps - 1 ? "none" : "inline-flex";
    if (submitBtn) submitBtn.style.display = index === totalSteps - 1 ? "inline-flex" : "none";

    updateInlineFields();
  }

  function collectMultiValues(name, otherInput) {
    const checked = Array.from(form.querySelectorAll(`input[name=\"${name}\"]:checked`));
    const values = checked.map((input) => input.value);

    if (name === "project_types") {
      const otherIndex = values.indexOf("Other");
      const otherValue = (otherInput?.value || "").trim();
      if (otherIndex >= 0 && otherValue) {
        values[otherIndex] = `Other: ${otherValue}`;
      }
    }

    return values.join(", ");
  }

  function buildPayload() {
    const now = new Date().toISOString();
    const shootLocationValue = form.querySelector("input[name=\"shoot_location\"]:checked")?.value || "";
    const shootLocationOtherValue = (shootLocationOther?.value || "").trim();
    const finalShootLocation =
      shootLocationValue === "Other city" && shootLocationOtherValue
        ? `Other city: ${shootLocationOtherValue}`
        : shootLocationValue;

    const timelineValue = form.querySelector("input[name=\"timeline\"]:checked")?.value || "";
    const deadlineValue = timelineValue === "Specific date" ? (deadlineInput?.value || "") : "";

    return {
      id: generateId(),
      full_name: form.querySelector("#full_name")?.value.trim() || "",
      company_name: form.querySelector("#company_name")?.value.trim() || "",
      role_title: form.querySelector("#role_title")?.value.trim() || "",
      email: form.querySelector("#email")?.value.trim() || "",
      phone_whatsapp: form.querySelector("#phone_whatsapp")?.value.trim() || "",
      project_types: collectMultiValues("project_types", projectTypesOther),
      project_goal: form.querySelector("input[name=\"project_goal\"]:checked")?.value || "",
      deliverables: form.querySelector("#deliverables")?.value.trim() || "",
      content_usage: collectMultiValues("content_usage"),
      timeline: timelineValue,
      deadline: deadlineValue,
      shoot_location: finalShootLocation,
      references: form.querySelector("#references")?.value.trim() || "",
      creative_direction: form.querySelector("input[name=\"creative_direction\"]:checked")?.value || "",
      budget_range: form.querySelector("input[name=\"budget_range\"]:checked")?.value || "",
      project_summary: form.querySelector("#project_summary")?.value.trim() || "",
      lead_status: "new",
      lead_score: "",
      lead_source: detectLeadSource(),
      client_type: detectClientType(),
      created_at: now,
      updated_at: now,
      form_version: FORM_VERSION
    };
  }

  function saveDraft() {
    const formData = new FormData(form);
    const data = {};

    formData.forEach((value, key) => {
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });

    data.currentStep = currentStep;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function loadDraft() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      Object.keys(data).forEach((key) => {
        if (key === "currentStep") return;
        const value = data[key];

        const field = form.elements[key];
        if (!field) return;

        if (field instanceof RadioNodeList) {
          const values = Array.isArray(value) ? value : [value];
          values.forEach((val) => {
            const input = form.querySelector(`input[name=\"${key}\"][value=\"${val}\"]`);
            if (input) input.checked = true;
          });
        } else if (field.type === "checkbox") {
          field.checked = true;
        } else {
          field.value = value;
        }
      });

      currentStep = 0;
    } catch (err) {
      console.warn("Draft restore failed.");
    }
  }

  function getStepHint(stepEl) {
    if (!stepEl) return null;
    return stepEl.querySelector(".step-hint");
  }

  function setStepHint(stepEl, isVisible, message) {
    const hint = getStepHint(stepEl);
    if (!hint) return;
    hint.classList.toggle("hidden", !isVisible);
    if (message) {
      hint.textContent = message;
    }
  }

  function validateStep(stepIndex) {
    const stepEl = steps[stepIndex];
    if (!stepEl) return false;

    const inputs = Array.from(stepEl.querySelectorAll("input, textarea"));
    const names = new Set();
    const missingLabels = [];
    let firstInvalid = null;
    let anyFilled = false;

    inputs.forEach((input) => {
      if (!input.name) return;
      names.add(input.name);
      if (input.type === "radio" || input.type === "checkbox") {
        if (input.checked) anyFilled = true;
      } else if (input.value.trim()) {
        anyFilled = true;
      }
    });

    for (const name of names) {
      const groupInputs = Array.from(stepEl.querySelectorAll(`input[name=\"${name}\"]`));
      const textInputs = groupInputs.filter((input) => input.type !== "radio" && input.type !== "checkbox");
      const hasChoiceInputs = groupInputs.some((input) => input.type === "radio" || input.type === "checkbox");

      if (textInputs.length > 0) {
        for (const input of textInputs) {
          if (!input.value.trim()) {
            firstInvalid = input;
            const label = stepEl.querySelector(`label[for=\"${input.id}\"]`);
            if (label) missingLabels.push(label.textContent.replace("Required", "").trim());
            break;
          }
          if (input.type === "email" && !input.checkValidity()) {
            firstInvalid = input;
            break;
          }
        }
      } else if (hasChoiceInputs) {
        const anyChecked = groupInputs.some((input) => input.checked);
        if (!anyChecked) {
          firstInvalid = groupInputs[0];
          const fieldLabel = groupInputs[0].closest(".field")?.querySelector(".group-title");
          if (fieldLabel) missingLabels.push(fieldLabel.textContent.replace("Required", "").trim());
        }
      }

      if (firstInvalid) break;
    }

    const timelineValue = form.querySelector("input[name=\"timeline\"]:checked")?.value || "";
    if (!firstInvalid && timelineValue === "Specific date" && deadlineInput && !deadlineInput.value) {
      firstInvalid = deadlineInput;
      const label = stepEl.querySelector("label[for=\"deadline\"]");
      if (label) missingLabels.push(label.textContent.replace("Required", "").trim());
    }

    const shootLocationValue = form.querySelector("input[name=\"shoot_location\"]:checked")?.value || "";
    if (!firstInvalid && shootLocationValue === "Other city" && shootLocationOther && !shootLocationOther.value.trim()) {
      firstInvalid = shootLocationOther;
      const label = stepEl.querySelector("label[for=\"shoot_location_other\"]");
      if (label) missingLabels.push(label.textContent.replace("Required", "").trim());
    }

    const projectOtherChecked = form.querySelector("input[name=\"project_types\"][value=\"Other\"]")?.checked;
    if (!firstInvalid && projectOtherChecked && projectTypesOther && !projectTypesOther.value.trim()) {
      firstInvalid = projectTypesOther;
      const label = stepEl.querySelector("label.group-title");
      if (label && !missingLabels.includes(label.textContent.replace("Required", "").trim())) {
        missingLabels.push(label.textContent.replace("Required", "").trim());
      }
    }

    if (firstInvalid) {
      const baseMessage = anyFilled
        ? `Please complete: ${missingLabels.join(", ") || "all required fields"}.`
        : "Please fill all fields in this section.";
      setStepHint(stepEl, true, baseMessage);
      firstInvalid.focus();
      return false;
    }

    setStepHint(stepEl, false);
    return true;
  }

  function setLoading(isLoading) {
    if (!submitBtn || !nextBtn || !prevBtn) return;

    submitBtn.disabled = isLoading;
    nextBtn.disabled = isLoading;
    prevBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? "Submitting..." : "Submit Project Request";
  }

  form.addEventListener("input", () => {
    saveDraft();
    updateInlineFields();
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentStep === 0) return;
      saveDraft();
      currentStep -= 1;
      showStep(currentStep);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentStep >= totalSteps - 1) return;
      if (!validateStep(currentStep)) return;
      saveDraft();
      currentStep += 1;
      showStep(currentStep);
    });
  }

  if (newSubmissionBtn) {
    newSubmissionBtn.addEventListener("click", () => {
      form.reset();
      localStorage.removeItem(STORAGE_KEY);
      currentStep = 0;
      updateInlineFields();
      showStep(currentStep);
      successCard.classList.add("hidden");
      formCard.classList.remove("hidden");
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    for (let i = 0; i < totalSteps; i += 1) {
      if (!validateStep(i)) {
        currentStep = i;
        showStep(currentStep);
        return;
      }
    }

    if (!BACKEND_ENDPOINT || BACKEND_ENDPOINT.includes("YOUR_GOOGLE")) {
      alert("Backend endpoint is not set. Add your Google Apps Script Web App URL in script.js.");
      return;
    }

    const payload = buildPayload();
    const orderedKeys = [
      "id",
      "full_name",
      "company_name",
      "role_title",
      "email",
      "phone_whatsapp",
      "project_types",
      "project_goal",
      "deliverables",
      "content_usage",
      "timeline",
      "deadline",
      "shoot_location",
      "references",
      "creative_direction",
      "budget_range",
      "project_summary",
      "lead_status",
      "lead_score",
      "lead_source",
      "client_type",
      "created_at",
      "updated_at",
      "form_version"
    ];

    const formData = new FormData();
    orderedKeys.forEach((key) => {
      formData.append(key, payload[key] || "");
    });

    setLoading(true);

    try {
      await fetch(BACKEND_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: formData
      });

      form.reset();
      localStorage.removeItem(STORAGE_KEY);
      currentStep = 0;
      showStep(currentStep);
      updateInlineFields();
      formCard.classList.add("hidden");
      successCard.classList.remove("hidden");
    } catch (err) {
      alert("Error submitting form. Please try again.");
    } finally {
      setLoading(false);
    }
  });

  form.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const target = e.target;
    if (!target || target.tagName === "TEXTAREA") return;

    if (currentStep < totalSteps - 1) {
      e.preventDefault();
      if (!validateStep(currentStep)) return;
      saveDraft();
      currentStep += 1;
      showStep(currentStep);
    }
  });

  if (logoBar) {
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      if (scrollY > 40) {
        logoBar.classList.add("sticky");
      } else {
        logoBar.classList.remove("sticky");
      }

      const parallaxOffset = Math.min(scrollY * 0.08, 6);
      logoBar.style.transform = `translateY(${parallaxOffset}px)`;
    });
  }

  loadDraft();
  updateInlineFields();
  showStep(currentStep);
});
