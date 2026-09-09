import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Public content is read on demand. No persistent cache services are required.
export default defineCloudflareConfig();
