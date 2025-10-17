/**
 * Example: Synchronous Rendering
 *
 * This example shows how to use the SDK in sync mode to render images immediately.
 * Sync mode waits for the render to complete before returning the result.
 */

const Qalib = require("./src/index");

async function main() {
  // Initialize Qalib in sync mode
  const qalib = new Qalib({
    apiKey: process.env.QALIB_API_KEY || "qk_live_your_api_key",
    mode: "sync", // Sync mode
  });

  try {
    console.log("Creating synchronous render...");

    // Render image with variables
    const render = await qalib.renderImage("tmp_your_template_id", [
      {
        name: "title",
        text: "Hello from Qalib SDK!",
        color: "#1e40af", // Optional: custom text color
      },
      {
        name: "subtitle",
        text: "Synchronous rendering example",
      },
      {
        name: "logo",
        image_url: "https://example.com/logo.png",
      },
      {
        name: "rating",
        rating: 4.5,
      },
    ]);

    console.log("Render completed!");
    console.log("Status:", render.status); // 'completed'
    console.log("Image URL:", render.image_url);
    console.log("Render Time:", render.render_time_ms, "ms");
    console.log("Credits Used:", render.credits_deducted);
    console.log("Remaining Credits:", render.remaining_credits);
  } catch (error) {
    if (error instanceof Qalib.InsufficientCreditsError) {
      console.error("Not enough credits:", error.details);
    } else if (error instanceof Qalib.ValidationError) {
      console.error("Invalid request:", error.message);
    } else {
      console.error("Error:", error.message);
    }
  }
}

main();
