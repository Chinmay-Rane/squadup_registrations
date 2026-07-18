// Configuration for direct Google Form submissions
// Replace these with your actual Google Form Action URL and Entry IDs.
// To find these:
// 1. Create your Google Form with the same fields.
// 2. View the published form and inspect the HTML source.
// 3. Search for '<form action="' to get the Action URL.
// 4. Search for 'name="entry.123456789"' to find the entry IDs for each field.

export const GOOGLE_FORM_CONFIG = {
  // Replace with your actual Google Form action URL (ends in /formResponse)
  actionUrl: "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfB1XQ5G_j6Zk8x8g_your_form_id_here/formResponse",
  
  // Replace these with your actual Google Form entry IDs mapped from your form
  fields: {
    name: "entry.2000001",
    whatsAppNumber: "entry.2000002",
    collegeEmail: "entry.2000003",
    prn: "entry.2000004",
    yearStudying: "entry.2000005",
    course: "entry.2000006",
    recommendedBy: "entry.2000007",
    department: "entry.2000008",
    pastExperience: "entry.2000009"
  }
};

// Retrieve custom Google Form mappings saved by the administrator, falling back to compile-time configuration
export const getActiveFormConfig = () => {
  const saved = localStorage.getItem('squadup_google_form_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved config", e);
    }
  }
  return GOOGLE_FORM_CONFIG;
};
