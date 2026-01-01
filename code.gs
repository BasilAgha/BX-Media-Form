/***********************
 * CONFIG
 ***********************/
const SHEET_NAME = "project_intake";
const SPREADSHEET_ID = "1R5AFPwT2VCYRzOGnY3Y6d2eHDZCQZ4sA26jADMaPxKU";

/***********************
 * UTILITIES
 ***********************/
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function nowISO() {
  return new Date().toISOString();
}

function generateId() {
  return Utilities.getUuid();
}

function getValue(data, snake, camel) {
  return data[snake] || data[camel] || "";
}

/***********************
 * ENTRY POINTS
 ***********************/
function doGet() {
  return jsonResponse({
    ok: false,
    message: "GET not supported. Use POST."
  });
}

function doPost(e) {
  try {
    console.log("RAW EVENT:", e);

    if (!e || (!e.postData && !e.parameter)) {
      return jsonResponse({ ok: false, error: "Missing POST body" });
    }

    let data = {};

    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter || {};
    }

    console.log("PARSED DATA:", data);

    // Normalize required fields (all except references)
    const fullName = getValue(data, "full_name", "fullName");
    const company = getValue(data, "company_name", "companyName");
    const role = getValue(data, "role_title", "roleTitle");
    const email = data.email || "";
    const phone = getValue(data, "phone_whatsapp", "phoneWhatsapp");
    const projectTypes = getValue(data, "project_types", "projectTypes");
    const projectGoal = getValue(data, "project_goal", "projectGoal");
    const deliverables = data.deliverables || "";
    const contentUsage = getValue(data, "content_usage", "contentUsage");
    const timeline = data.timeline || "";
    const deadline = data.deadline || "";
    const shootLocation = getValue(data, "shoot_location", "shootLocation");
    const creativeDirection = getValue(data, "creative_direction", "creativeDirection");
    const budgetRange = getValue(data, "budget_range", "budgetRange");
    const projectSummary = getValue(data, "project_summary", "projectSummary");
    const createdAt = data.created_at || data.createdAt || "";
    const updatedAt = data.updated_at || data.updatedAt || "";

    if (
      !fullName ||
      !company ||
      !role ||
      !email ||
      !phone ||
      !projectTypes ||
      !projectGoal ||
      !deliverables ||
      !contentUsage ||
      !timeline ||
      (timeline === "Specific date" && !deadline) ||
      !shootLocation ||
      !creativeDirection ||
      !budgetRange ||
      !projectSummary ||
      !createdAt ||
      !updatedAt
    ) {
      return jsonResponse({
        ok: false,
        error: "Missing required fields"
      });
    }

    const sheet = getSheet();

    sheet.appendRow([
      data.id || generateId(),
      fullName,
      company,
      role,
      email,
      phone,
      projectTypes,
      projectGoal,
      deliverables,
      contentUsage,
      timeline,
      deadline,
      shootLocation,
      data.references || "",
      creativeDirection,
      budgetRange,
      projectSummary,
      createdAt || nowISO(),
      updatedAt || nowISO()
    ]);

    return jsonResponse({
      ok: true,
      message: "Project request submitted successfully"
    });

  } catch (err) {
    console.error("ERROR:", err);
    return jsonResponse({
      ok: false,
      error: err.message || String(err)
    });
  }
}

/***********************
 * CORE
 ***********************/
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAME}" not found`);
  }
  return sheet;
}

function joinArray(value) {
  if (Array.isArray(value)) return value.join(", ");
  return value || "";
}
