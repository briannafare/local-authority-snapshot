import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("audits.create", () => {
  it("creates an audit with valid input", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      businessName: "Test HVAC Company",
      websiteUrl: "https://test-hvac.com",
      primaryLocation: "Portland, OR",
      primaryNiche: "hvac",
      leadSources: ["Referrals", "Google Search"],
      runsPaidAds: "no",
      hasLocalListing: "yes",
      activeOnSocial: "no",
      usesAutomation: "no",
      hasCallCoverage: "inconsistent",
      monthlyVisitors: 500,
      monthlyLeads: 50,
      avgRevenuePerClient: 5000,
      businessGoals: ["More appointments", "Increase revenue"],
      painPoints: ["Missed calls", "Inconsistent lead flow"],
    };

    const result = await caller.audits.create(input);

    expect(result).toHaveProperty("auditId");
    expect(typeof result.auditId).toBe("number");
    expect(result.auditId).toBeGreaterThan(0);
  });

  it("creates an audit with minimal required fields", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      businessName: "Minimal Test Business",
      websiteUrl: "https://minimal-test.com",
      primaryLocation: "Seattle, WA",
      primaryNiche: "plumbing",
      leadSources: ["Referrals"],
      runsPaidAds: "unsure",
      hasLocalListing: "unsure",
      activeOnSocial: "no",
      usesAutomation: "unsure",
      hasCallCoverage: "no",
      businessGoals: ["More appointments"],
      painPoints: ["Missed calls"],
    };

    const result = await caller.audits.create(input);

    expect(result).toHaveProperty("auditId");
    expect(typeof result.auditId).toBe("number");
  });

  it("creates an audit with optional revenue fields", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      businessName: "Revenue Test Business",
      websiteUrl: "https://revenue-test.com",
      primaryLocation: "Austin, TX",
      primaryNiche: "roofing",
      leadSources: ["Google Search", "Paid Ads"],
      runsPaidAds: "yes",
      hasLocalListing: "yes",
      activeOnSocial: "yes",
      usesAutomation: "yes",
      hasCallCoverage: "yes",
      monthlyVisitors: 1000,
      monthlyLeads: 100,
      avgRevenuePerClient: 10000,
      businessGoals: ["More high-ticket jobs", "Expand service area"],
      painPoints: ["No-shows", "Low conversion rate"],
    };

    const result = await caller.audits.create(input);

    expect(result).toHaveProperty("auditId");
    expect(typeof result.auditId).toBe("number");
  });
});

describe("audits.getById", () => {
  let testAuditId: number;

  beforeAll(async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const input = {
      businessName: "Get By ID Test",
      websiteUrl: "https://getbyid-test.com",
      primaryLocation: "Denver, CO",
      primaryNiche: "electrician",
      leadSources: ["Referrals"],
      runsPaidAds: "no",
      hasLocalListing: "yes",
      activeOnSocial: "no",
      usesAutomation: "no",
      hasCallCoverage: "yes",
      businessGoals: ["More appointments"],
      painPoints: ["Inconsistent lead flow"],
    };

    const result = await caller.audits.create(input);
    testAuditId = result.auditId;
  });

  it("retrieves an audit by ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const audit = await caller.audits.getById({ id: testAuditId });

    expect(audit).toBeDefined();
    expect(audit?.id).toBe(testAuditId);
    expect(audit?.businessName).toBe("Get By ID Test");
    expect(audit?.websiteUrl).toBe("https://getbyid-test.com");
    expect(audit?.primaryLocation).toBe("Denver, CO");
    expect(audit?.primaryNiche).toBe("electrician");
    expect(audit?.status).toBe("processing");
  });

  it("returns undefined for non-existent audit ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const audit = await caller.audits.getById({ id: 999999 });

    expect(audit).toBeUndefined();
  });
});
