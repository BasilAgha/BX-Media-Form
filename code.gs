/***********************
 * CONFIG
 ***********************/
const SHEET_NAME = "project_intake";

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
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: "Missing POST body" });
    }

    const data = JSON.parse(e.postData.contents);

    // Validate required fields
    if (!data.email || !data.budget_range) {
      return jsonResponse({
        ok: false,
        error: "Missing required fields: email or budget_range"
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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
