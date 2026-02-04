import axios from 'axios';

/**
 * Go High Level (GHL) Integration Service
 *
 * Handles:
 * 1. Creating/updating contacts in GHL
 * 2. Saving report links to contact custom fields
 * 3. Triggering workflows for follow-up sequences
 *
 * Required environment variables:
 * - GHL_API_KEY: Go High Level API key
 * - GHL_LOCATION_ID: GHL Location/Sub-account ID
 * - GHL_WORKFLOW_ID: Workflow ID for audit follow-up sequence
 * - GHL_REPORT_URL_FIELD: Custom field ID for storing report URL
 * - GHL_AUDIT_GRADE_FIELD: Custom field ID for storing audit grade
 */

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_WORKFLOW_ID = process.env.GHL_WORKFLOW_ID;
const GHL_REPORT_URL_FIELD = process.env.GHL_REPORT_URL_FIELD || 'report_url';
const GHL_AUDIT_GRADE_FIELD = process.env.GHL_AUDIT_GRADE_FIELD || 'audit_grade';

interface GHLContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  address1?: string;
  city?: string;
  state?: string;
  tags?: string[];
  customField?: Record<string, string>;
}

interface GHLContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  tags?: string[];
}

/**
 * Check if GHL integration is configured
 */
export function isGHLConfigured(): boolean {
  return Boolean(GHL_API_KEY && GHL_LOCATION_ID);
}

/**
 * Get auth headers for GHL API calls
 */
function getHeaders() {
  return {
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Content-Type': 'application/json',
    'Version': '2021-07-28',
  };
}

/**
 * Search for an existing contact by email
 */
export async function findContactByEmail(email: string): Promise<GHLContact | null> {
  if (!isGHLConfigured()) {
    console.warn('[GHL] Integration not configured');
    return null;
  }

  try {
    const response = await axios.get(
      `${GHL_API_BASE}/contacts/search/duplicate`,
      {
        headers: getHeaders(),
        params: {
          locationId: GHL_LOCATION_ID,
          email,
        },
      }
    );

    const contact = response.data?.contact;
    if (contact) {
      return {
        id: contact.id,
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        companyName: contact.companyName,
        tags: contact.tags,
      };
    }

    return null;
  } catch (error: any) {
    console.error('[GHL] Error finding contact:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Create or update a contact in GHL
 */
export async function upsertContact(data: GHLContactData): Promise<string | null> {
  if (!isGHLConfigured()) {
    console.warn('[GHL] Integration not configured, skipping contact upsert');
    return null;
  }

  try {
    // Check if contact already exists
    const existing = await findContactByEmail(data.email);

    if (existing) {
      // Update existing contact
      console.log(`[GHL] Updating existing contact: ${existing.id}`);

      await axios.put(
        `${GHL_API_BASE}/contacts/${existing.id}`,
        {
          ...data,
          locationId: GHL_LOCATION_ID,
        },
        { headers: getHeaders() }
      );

      return existing.id;
    } else {
      // Create new contact
      console.log(`[GHL] Creating new contact for: ${data.email}`);

      const response = await axios.post(
        `${GHL_API_BASE}/contacts/`,
        {
          ...data,
          locationId: GHL_LOCATION_ID,
        },
        { headers: getHeaders() }
      );

      const contactId = response.data?.contact?.id;
      console.log(`[GHL] Created contact: ${contactId}`);
      return contactId;
    }
  } catch (error: any) {
    console.error('[GHL] Error upserting contact:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Add tags to a contact
 */
export async function addContactTags(contactId: string, tags: string[]): Promise<boolean> {
  if (!isGHLConfigured()) return false;

  try {
    await axios.post(
      `${GHL_API_BASE}/contacts/${contactId}/tags`,
      { tags },
      { headers: getHeaders() }
    );

    console.log(`[GHL] Added tags to contact ${contactId}: ${tags.join(', ')}`);
    return true;
  } catch (error: any) {
    console.error('[GHL] Error adding tags:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Update a contact's custom field values
 */
export async function updateContactCustomFields(
  contactId: string,
  customFields: Record<string, string>
): Promise<boolean> {
  if (!isGHLConfigured()) return false;

  try {
    // Convert custom fields to GHL's format
    const customFieldArray = Object.entries(customFields).map(([key, value]) => ({
      id: key,
      field_value: value,
    }));

    await axios.put(
      `${GHL_API_BASE}/contacts/${contactId}`,
      {
        customFields: customFieldArray,
      },
      { headers: getHeaders() }
    );

    console.log(`[GHL] Updated custom fields for contact ${contactId}`);
    return true;
  } catch (error: any) {
    console.error('[GHL] Error updating custom fields:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Trigger a workflow for a contact
 */
export async function triggerWorkflow(
  contactId: string,
  workflowId?: string
): Promise<boolean> {
  if (!isGHLConfigured()) {
    console.warn('[GHL] Integration not configured, skipping workflow trigger');
    return false;
  }

  const wfId = workflowId || GHL_WORKFLOW_ID;
  if (!wfId) {
    console.warn('[GHL] No workflow ID configured');
    return false;
  }

  try {
    await axios.post(
      `${GHL_API_BASE}/contacts/${contactId}/workflow/${wfId}`,
      {},
      { headers: getHeaders() }
    );

    console.log(`[GHL] Triggered workflow ${wfId} for contact ${contactId}`);
    return true;
  } catch (error: any) {
    console.error('[GHL] Error triggering workflow:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Add a note to a contact (stores audit findings)
 */
export async function addContactNote(
  contactId: string,
  body: string
): Promise<boolean> {
  if (!isGHLConfigured()) return false;

  try {
    await axios.post(
      `${GHL_API_BASE}/contacts/${contactId}/notes`,
      { body },
      { headers: getHeaders() }
    );

    console.log(`[GHL] Added note to contact ${contactId}`);
    return true;
  } catch (error: any) {
    console.error('[GHL] Error adding note:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Complete GHL integration for an audit submission
 *
 * This is the main entry point that handles:
 * 1. Creating/updating the contact
 * 2. Saving the report URL and grade
 * 3. Adding audit tags
 * 4. Adding a summary note
 * 5. Triggering the follow-up workflow
 */
export async function processAuditForGHL(params: {
  email: string;
  businessName: string;
  location: string;
  niche: string;
  auditId: number;
  reportUrl: string;
  overallGrade: string;
  overallScore: number;
  keyFindings: string[];
}): Promise<{
  contactId: string | null;
  workflowTriggered: boolean;
}> {
  if (!isGHLConfigured()) {
    console.log('[GHL] Integration not configured, skipping');
    return { contactId: null, workflowTriggered: false };
  }

  console.log(`[GHL] Processing audit ${params.auditId} for ${params.businessName}`);

  // 1. Create/update contact
  const contactId = await upsertContact({
    email: params.email,
    companyName: params.businessName,
    tags: [
      'audit-lead',
      `niche-${params.niche.toLowerCase().replace(/\s+/g, '-')}`,
      `grade-${params.overallGrade}`,
    ],
  });

  if (!contactId) {
    console.error('[GHL] Failed to create/update contact');
    return { contactId: null, workflowTriggered: false };
  }

  // 2. Save report URL and grade to custom fields
  await updateContactCustomFields(contactId, {
    [GHL_REPORT_URL_FIELD]: params.reportUrl,
    [GHL_AUDIT_GRADE_FIELD]: `${params.overallGrade} (${params.overallScore}/100)`,
  });

  // 3. Add a summary note with key findings
  const noteBody = [
    `## Local Authority Snapshot - ${params.businessName}`,
    `**Grade:** ${params.overallGrade} (${params.overallScore}/100)`,
    `**Location:** ${params.location}`,
    `**Niche:** ${params.niche}`,
    `**Report:** ${params.reportUrl}`,
    '',
    '### Key Findings:',
    ...params.keyFindings.map((f, i) => `${i + 1}. ${f}`),
    '',
    `_Generated on ${new Date().toLocaleDateString()}_`,
  ].join('\n');

  await addContactNote(contactId, noteBody);

  // 4. Trigger follow-up workflow
  const workflowTriggered = await triggerWorkflow(contactId);

  console.log(`[GHL] Audit processing complete. Contact: ${contactId}, Workflow: ${workflowTriggered}`);

  return { contactId, workflowTriggered };
}
