/**
 * Example: Working with Templates
 *
 * This example shows how to list and retrieve template information.
 */

const Qalib = require("./src/index");

async function main() {
  const qalib = new Qalib({
    apiKey: process.env.QALIB_API_KEY || "qk_live_your_api_key",
  });

  try {
    // List templates with pagination
    console.log("Fetching templates...\n");

    const response = await qalib.listTemplates({
      limit: 10,
      offset: 0,
    });

    console.log(`Found ${response.data.length} templates:`);
    console.log("Pagination:", response.pagination);
    console.log();

    // Display each template
    for (const template of response.data) {
      console.log(`Template: ${template.name}`);
      console.log(`  ID: ${template.id}`);
      console.log(`  Description: ${template.description || "No description"}`);
      console.log(`  Dimensions: ${template.width}x${template.height}`);
      console.log(
        `  Created: ${new Date(template.created_at).toLocaleDateString()}`
      );
      console.log();
    }

    // Get a specific template
    if (response.data.length > 0) {
      const firstTemplate = response.data[0];
      console.log(`\nFetching details for "${firstTemplate.name}"...`);

      const template = await qalib.getTemplate(firstTemplate.id);
      console.log("Template Details:");
      console.log(JSON.stringify(template, null, 2));
    }

    // Fetch all templates (auto-pagination)
    console.log("\n\nFetching ALL templates...");
    const allTemplates = await qalib.listAllTemplates({
      maxResults: 100, // Optional: limit total results
    });

    console.log(`Total templates found: ${allTemplates.length}`);

    // Group templates by size
    const sizes = {};
    for (const template of allTemplates) {
      const size = `${template.width}x${template.height}`;
      sizes[size] = (sizes[size] || 0) + 1;
    }

    console.log("\nTemplates by size:");
    for (const [size, count] of Object.entries(sizes)) {
      console.log(`  ${size}: ${count} template(s)`);
    }
  } catch (error) {
    if (error instanceof Qalib.NotFoundError) {
      console.error("Template not found:", error.message);
    } else if (error instanceof Qalib.AuthenticationError) {
      console.error("Authentication failed:", error.message);
    } else {
      console.error("Error:", error.message);
    }
  }
}

main();
