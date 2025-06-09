import { discoverTools } from "../lib/tools.js";

export function registerToolsCommand(program) {
  program
    .command("tools")
    .description("List all available API tools")
    .action(async () => {
      const tools = await discoverTools();
      if (tools.length === 0) {
        console.log("No tools found. Tools should be located in 'tools/'.\n");
        return;
      }

      console.log("\nAvailable Tools:\n");

      tools.forEach(
        ({
          definition: {
            function: { name, description, parameters },
          },
        }) => {
          const friendlyName = name.replace(/_/g, " ");
          console.log(`  ${friendlyName} (technical name: ${name})`);
          console.log(
            `    Description: ${description || "No description provided"}`
          );
          if (parameters?.properties) {
            console.log("    Parameters:");
            Object.entries(parameters.properties).forEach(
              ([name, details]) => {
                console.log(
                  `      - ${name}: ${details.description || "No description"}`
                );
              }
            );
          }
          console.log("");
        }
      );
    });
}