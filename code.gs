/***********************
 * CONFIG
 ***********************/
const SHEET_NAME = "project_intake";
// Set this if the Apps Script project is standalone (not bound to the sheet).
const SPREADSHEET_ID = "1g_cz68LE69sazCT_HR4EylbL5YcsJJorGKb4dJgIW7M";

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
    if (!e || (!e.postData && !e.parameter)) {
      return jsonResponse({ ok: false, error: "Missing POST body" });
    }

    let data = {};

    if (e.postData && e.postData.contents) {
      const contentType = (e.postData.type || "").toLowerCase();
      if (contentType.includes("application/json")) {
        data = JSON.parse(e.postData.contents);
      } else {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    // Validate required fields (Step 1 only)
    if (!data.full_name || !data.company_name || !data.role_title || !data.email || !data.phone_whatsapp) {
      return jsonResponse({
        ok: false,
        error: "Missing required fields in section 1"
      });
    }

    const sheet = getSheet();
    const row = buildRow(data);

    sheet.appendRow(row);

    return jsonResponse({
      ok: true,
      message: "Project request submitted successfully"
    });

  } catch (err) {
    return jsonResponse({
      ok: false,
      error: err.message || String(err)
    });
  }
}

/***********************
 * CORE LOGIC
 ***********************/
function getSheet() {
  const ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!ss) {
    throw new Error("Spreadsheet not found. Set SPREADSHEET_ID in code.gs.");
  }

  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAME}" not found`);
  }

  return sheet;
}

function buildRow(data) {
  const createdAt = nowISO();

  return [
    generateId(),                     // id
    data.full_name || "",              // full_name
    data.company_name || "",           // company_name
    data.role_title || "",             // role_title
    data.email || "",                  // email
    data.phone_whatsapp || "",         // phone_whatsapp
    joinArray(data.project_types),     // project_types
    data.project_goal || "",           // project_goal
    data.deliverables || "",            // deliverables
    joinArray(data.content_usage),     // content_usage
    data.timeline || "",               // timeline
    data.deadline || "",               // deadline
    data.shoot_location || "",          // shoot_location
    data.references || "",              // references
    data.creative_direction || "",      // creative_direction
    data.budget_range || "",            // budget_range
    data.project_summary || "",         // project_summary
    "new",                              // lead_status
    "",                                 // lead_score
    data.lead_source || "Website",      // lead_source
    data.client_type || "",             // client_type
    createdAt,                          // created_at
    createdAt,                          // updated_at
    data.form_version || "v1"           // form_version
  ];
}

function joinArray(value) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value || "";
}
