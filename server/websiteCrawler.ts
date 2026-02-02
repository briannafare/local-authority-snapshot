import axios from "axios";
import * as cheerio from "cheerio";

export interface WebsiteData {
  url: string;
  title: string | null;
  metaDescription: string | null;
  h1Tags: string[];
  h2Tags: string[];
  h3Tags: string[];
  schemaTypes: string[];
  schemaData: any[];
  napData: {
    name: string | null;
    address: string | null;
    phone: string | null;
  };
  ctaElements: {
    buttons: number;
    forms: number;
    phoneLinks: number;
    emailLinks: number;
  };
  internalLinks: number;
  externalLinks: number;
  images: number;
  hasChat: boolean;
  hasMobileViewport: boolean;
  openGraphData: {
    title: string | null;
    description: string | null;
    image: string | null;
  };
  error: string | null;
}

/**
 * Crawl a website and extract SEO-relevant data
 */
export async function crawlWebsite(url: string): Promise<WebsiteData> {
  const result: WebsiteData = {
    url,
    title: null,
    metaDescription: null,
    h1Tags: [],
    h2Tags: [],
    h3Tags: [],
    schemaTypes: [],
    schemaData: [],
    napData: {
      name: null,
      address: null,
      phone: null,
    },
    ctaElements: {
      buttons: 0,
      forms: 0,
      phoneLinks: 0,
      emailLinks: 0,
    },
    internalLinks: 0,
    externalLinks: 0,
    images: 0,
    hasChat: false,
    hasMobileViewport: false,
    openGraphData: {
      title: null,
      description: null,
      image: null,
    },
    error: null,
  };

  console.log(`[Website Crawler] Fetching ${url}...`);
  
  try {
    // Fetch the website HTML
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LocalAuthorityBot/1.0; +https://eighty5labs.com)",
      },
      maxRedirects: 5,
    });

    const html = response.data;
    const $ = cheerio.load(html);
    
    console.log(`[Website Crawler] Successfully fetched ${url}, HTML length: ${html.length}`);

    // Extract title
    result.title = $("title").first().text().trim() || null;

    // Extract meta description
    result.metaDescription =
      $('meta[name="description"]').attr("content")?.trim() || null;

    // Extract headings
    $("h1").each((_, el) => {
      const text = $(el).text().trim();
      if (text) result.h1Tags.push(text);
    });

    $("h2").each((_, el) => {
      const text = $(el).text().trim();
      if (text) result.h2Tags.push(text);
    });

    $("h3").each((_, el) => {
      const text = $(el).text().trim();
      if (text) result.h3Tags.push(text);
    });

    // Extract schema.org structured data
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const schemaText = $(el).html();
        if (schemaText) {
          const schemaObj = JSON.parse(schemaText);
          result.schemaData.push(schemaObj);

          // Extract schema types
          if (schemaObj["@type"]) {
            const types = Array.isArray(schemaObj["@type"])
              ? schemaObj["@type"]
              : [schemaObj["@type"]];
            result.schemaTypes.push(...types);
          }

          // Extract NAP from LocalBusiness schema
          if (
            schemaObj["@type"] === "LocalBusiness" ||
            schemaObj["@type"]?.includes?.("LocalBusiness")
          ) {
            if (schemaObj.name) result.napData.name = schemaObj.name;
            if (schemaObj.address?.streetAddress || schemaObj.address) {
              result.napData.address =
                typeof schemaObj.address === "string"
                  ? schemaObj.address
                  : `${schemaObj.address.streetAddress || ""} ${schemaObj.address.addressLocality || ""} ${schemaObj.address.addressRegion || ""} ${schemaObj.address.postalCode || ""}`.trim();
            }
            if (schemaObj.telephone) result.napData.phone = schemaObj.telephone;
          }
        }
      } catch (e) {
        // Invalid JSON in schema, skip
      }
    });

    // Extract NAP from page content if not found in schema
    if (!result.napData.phone) {
      const phoneRegex = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
      const bodyText = $("body").text();
      const phoneMatches = bodyText.match(phoneRegex);
      if (phoneMatches && phoneMatches.length > 0) {
        result.napData.phone = phoneMatches[0];
      }
    }

    // Count CTA elements
    $("button, input[type='submit'], a.btn, a.button, .cta").each(() => {
      result.ctaElements.buttons++;
    });

    $("form").each(() => {
      result.ctaElements.forms++;
    });

    $('a[href^="tel:"]').each(() => {
      result.ctaElements.phoneLinks++;
    });

    $('a[href^="mailto:"]').each(() => {
      result.ctaElements.emailLinks++;
    });

    // Count links
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        if (href.startsWith("http") && !href.includes(new URL(url).hostname)) {
          result.externalLinks++;
        } else if (!href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
          result.internalLinks++;
        }
      }
    });

    // Count images
    result.images = $("img").length;

    // Check for chat widgets (enhanced detection)
    const chatSelectors = [
      // Popular chat platforms
      "#tawk-bubble", ".tawk-button", "[id*='tawk']",
      ".intercom-launcher", "#intercom-container", "[id*='intercom']",
      "#drift-widget", ".drift-controller", "[id*='drift']",
      ".crisp-client", "#crisp-chatbox", "[id*='crisp']",
      "#hubspot-messages-iframe-container", "[id*='hubspot']",
      "#tidio-chat", "[id*='tidio']",
      ".zendesk-chat", "[id*='zendesk']",
      "#livechat-widget", "[id*='livechat']",
      "#olark-box", "[id*='olark']",
      ".freshchat-widget", "[id*='freshchat']",
      // Generic patterns
      "[id*='chat']", "[class*='chat']",
      "[id*='messenger']", "[class*='messenger']",
      "[id*='support']", "[class*='live-support']",
      "iframe[src*='chat']", "iframe[src*='messenger']",
    ];
    
    // Check DOM elements
    const hasChatElement = chatSelectors.some((selector) => $(selector).length > 0);
    
    // Check for chat scripts in HTML
    const scriptTags = $("script").map((_, el) => $(el).html() || $(el).attr("src") || "").get().join(" ");
    const chatScriptPatterns = [
      /tawk\.to/i,
      /intercom/i,
      /drift/i,
      /crisp\.chat/i,
      /hubspot.*chat/i,
      /tidio/i,
      /zendesk.*chat/i,
      /livechat/i,
      /olark/i,
      /freshchat/i,
      /messenger.*widget/i,
    ];
    const hasChatScript = chatScriptPatterns.some((pattern) => pattern.test(scriptTags));
    
    result.hasChat = hasChatElement || hasChatScript;

    // Check for mobile viewport
    const viewport = $('meta[name="viewport"]').attr("content");
    result.hasMobileViewport = viewport?.includes("width=device-width") || false;

    // Extract Open Graph data
    result.openGraphData.title = $('meta[property="og:title"]').attr("content")?.trim() || null;
    result.openGraphData.description =
      $('meta[property="og:description"]').attr("content")?.trim() || null;
    result.openGraphData.image = $('meta[property="og:image"]').attr("content")?.trim() || null;

    console.log(`[Website Crawler] Extracted data from ${url}:`, {
      title: result.title,
      h1Count: result.h1Tags.length,
      h2Count: result.h2Tags.length,
      schemaCount: result.schemaTypes.length,
      hasChat: result.hasChat,
      ctaButtons: result.ctaElements.buttons,
    });
    
    return result;
  } catch (error: any) {
    console.error(`[Website Crawler] Error fetching ${url}:`, error.message);
    result.error = error.message || "Failed to crawl website";
    return result;
  }
}

/**
 * Analyze website data and generate SEO insights
 */
export function analyzeWebsiteData(data: WebsiteData): {
  issues: string[];
  strengths: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const strengths: string[] = [];
  const recommendations: string[] = [];

  if (data.error) {
    issues.push(`Website is inaccessible: ${data.error}`);
    recommendations.push("Ensure website is online and accessible to crawlers");
    return { issues, strengths, recommendations };
  }

  // Title analysis
  if (!data.title) {
    issues.push("Missing page title");
    recommendations.push("Add a descriptive title tag with primary keywords and location");
  } else if (data.title.length < 30) {
    issues.push("Page title is too short (under 30 characters)");
    recommendations.push("Expand title to 50-60 characters including location and services");
  } else if (data.title.length > 60) {
    issues.push("Page title may be truncated in search results (over 60 characters)");
    recommendations.push("Shorten title to 50-60 characters for optimal display");
  } else {
    strengths.push("Page title length is optimal");
  }

  // Meta description analysis
  if (!data.metaDescription) {
    issues.push("Missing meta description");
    recommendations.push("Add a compelling 150-160 character meta description with location and CTA");
  } else if (data.metaDescription.length < 120) {
    issues.push("Meta description is too short");
    recommendations.push("Expand meta description to 150-160 characters");
  } else if (data.metaDescription.length > 160) {
    issues.push("Meta description may be truncated in search results");
    recommendations.push("Shorten meta description to 150-160 characters");
  } else {
    strengths.push("Meta description length is optimal");
  }

  // Heading analysis
  if (data.h1Tags.length === 0) {
    issues.push("No H1 heading found");
    recommendations.push("Add a single H1 heading with primary keyword and location");
  } else if (data.h1Tags.length > 1) {
    issues.push(`Multiple H1 tags found (${data.h1Tags.length})`);
    recommendations.push("Use only one H1 per page for better SEO structure");
  } else {
    strengths.push("Single H1 heading present");
  }

  if (data.h2Tags.length === 0) {
    issues.push("No H2 subheadings found");
    recommendations.push("Add H2 subheadings to organize content and target secondary keywords");
  } else {
    strengths.push(`${data.h2Tags.length} H2 subheadings for content structure`);
  }

  // Schema markup analysis
  if (data.schemaTypes.length === 0) {
    issues.push("No structured data (schema.org) found");
    recommendations.push(
      "Add LocalBusiness schema with NAP, hours, services, and review aggregate"
    );
  } else {
    strengths.push(`Schema.org markup present: ${data.schemaTypes.join(", ")}`);

    if (!data.schemaTypes.includes("LocalBusiness")) {
      recommendations.push("Add LocalBusiness schema for better local search visibility");
    }
  }

  // NAP consistency
  if (!data.napData.name && !data.napData.address && !data.napData.phone) {
    issues.push("NAP (Name, Address, Phone) not found on website");
    recommendations.push("Display NAP prominently in footer and contact page");
  } else {
    if (data.napData.name) strengths.push("Business name found on website");
    if (data.napData.phone) strengths.push("Phone number found on website");
    if (!data.napData.address) {
      issues.push("Business address not clearly displayed");
      recommendations.push("Add full address to website footer and contact page");
    }
  }

  // CTA analysis
  const totalCTAs =
    data.ctaElements.buttons +
    data.ctaElements.forms +
    data.ctaElements.phoneLinks +
    data.ctaElements.emailLinks;

  if (totalCTAs === 0) {
    issues.push("No clear calls-to-action found");
    recommendations.push("Add prominent CTA buttons (Call Now, Book Appointment, Get Quote)");
  } else if (totalCTAs < 3) {
    issues.push("Limited calls-to-action");
    recommendations.push("Add multiple CTAs throughout the page (hero, mid-page, footer)");
  } else {
    strengths.push(`${totalCTAs} calls-to-action found`);
  }

  if (data.ctaElements.phoneLinks === 0) {
    recommendations.push("Add click-to-call phone links for mobile users");
  }

  if (data.ctaElements.forms === 0) {
    recommendations.push("Add a contact form for lead capture");
  }

  // Mobile optimization
  if (!data.hasMobileViewport) {
    issues.push("Missing mobile viewport meta tag");
    recommendations.push("Add viewport meta tag for mobile responsiveness");
  } else {
    strengths.push("Mobile viewport configured");
  }

  // Chat widget
  if (!data.hasChat) {
    recommendations.push("Consider adding live chat or AI chatbot for instant engagement");
  } else {
    strengths.push("Live chat widget detected");
  }

  // Images
  if (data.images < 3) {
    issues.push("Very few images on homepage");
    recommendations.push("Add photos of work, team, and facility to build trust");
  } else {
    strengths.push(`${data.images} images found`);
  }

  return { issues, strengths, recommendations };
}
