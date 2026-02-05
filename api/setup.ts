// One-time database setup endpoint
// Visit /api/setup to create tables, then delete this file

export default async function handler(req: Request) {
  const mysql = await import("mysql2/promise");

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    return new Response(JSON.stringify({ error: "DATABASE_URL not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const connection = await mysql.createConnection(DATABASE_URL);

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id int AUTO_INCREMENT NOT NULL,
        openId varchar(64) NOT NULL,
        name text,
        email varchar(320),
        loginMethod varchar(64),
        role enum('user','admin') NOT NULL DEFAULT 'user',
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        lastSignedIn timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(id),
        UNIQUE(openId)
      )
    `);

    // Create audits table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS audits (
        id int AUTO_INCREMENT NOT NULL,
        businessName varchar(255) NOT NULL,
        websiteUrl varchar(512) NOT NULL,
        primaryLocation varchar(255) NOT NULL,
        primaryNiche varchar(100) NOT NULL,
        nicheDescription text,
        leadSources text,
        runsPaidAds varchar(20),
        hasLocalListing varchar(20),
        activeOnSocial varchar(20),
        usesAutomation varchar(20),
        hasCallCoverage varchar(20),
        monthlyVisitors int,
        monthlyLeads int,
        avgRevenuePerClient int,
        businessGoals text,
        painPoints text,
        gbpAuditResults text,
        seoAuditResults text,
        competitiveResults text,
        aeoResults text,
        leadCaptureResults text,
        followUpResults text,
        executiveSummary text,
        keyFindings text,
        recommendations text,
        status enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
        pdfUrl varchar(512),
        emailSent varchar(255),
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        gbpUrl varchar(512),
        overallGrade enum('A','B','C','D','F'),
        overallScore int,
        fullReportUnlocked int DEFAULT 0,
        geoGridData text,
        deepCompetitorAnalysis text,
        ghlContactId varchar(100),
        ghlWorkflowTriggered int DEFAULT 0,
        PRIMARY KEY(id)
      )
    `);

    // Create auditVisuals table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS auditVisuals (
        id int AUTO_INCREMENT NOT NULL,
        auditId int NOT NULL,
        visualType varchar(100) NOT NULL,
        imageUrl varchar(512) NOT NULL,
        s3Key varchar(512) NOT NULL,
        description text,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY(id)
      )
    `);

    await connection.end();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Database tables created successfully! You can now delete api/setup.ts"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "Failed to create tables",
        details: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
