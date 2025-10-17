/**
 * Example: Asynchronous Rendering
 *
 * This example shows how to use the SDK in async mode (default).
 * Async mode queues the render and returns immediately, allowing you to poll for completion.
 */

const Qalib = require("./src/index");

async function main() {
  // Initialize Qalib in async mode (default)
  const qalib = new Qalib({
    apiKey: process.env.QALIB_API_KEY,
    baseURL: "http://localhost:3003/v1",
    // mode: 'async' is the default, so we can omit it
  });

  try {
    console.log("Creating asynchronous render...");

    // Create render (returns immediately with pending status)
    const render = await qalib.renderImage(process.env.TEMPLATE_ID, [
      {
        name: "title",
        text: "Hello from Qalib SDK!",
      },
      {
        name: "subtitle",
        text: "Asynchronous rendering example",
      },
    ]);

    console.log("Render queued!");
    console.log("Render ID:", render.id);
    console.log("Status:", render.status); // 'pending'
    console.log("Credits Used:", render.credits_deducted);

    // Poll for completion
    console.log("\nPolling for completion...");
    let completed = false;
    let attempts = 0;
    const maxAttempts = 30;

    while (!completed && attempts < maxAttempts) {
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      const status = await qalib.getRender(render.id);
      console.log(`  Attempt ${attempts}: ${status.status}`);

      if (status.status === "completed") {
        console.log("\nRender completed!");
        console.log("  Image URL:", status.image_url);
        console.log("  Render Time:", status.render_time_ms, "ms");
        completed = true;
      } else if (status.status === "failed") {
        console.error("\nRender failed:", status.error_message);
        break;
      }
    }

    if (!completed && attempts >= maxAttempts) {
      console.error("\nRender timed out after", maxAttempts, "attempts");
    }
  } catch (error) {
    if (error instanceof Qalib.ValidationError) {
      console.error("Validation error:", error.message);
    } else if (error instanceof Qalib.AuthenticationError) {
      console.error("Authentication failed:", error.message);
    } else {
      console.error("Error:", error.message);
    }
  }
}

main();
