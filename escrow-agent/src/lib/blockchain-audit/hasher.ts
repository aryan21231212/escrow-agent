import { execSync } from "child_process";
import path from "path";

export function generateAuditHash(payload: string): string {
  try {
    // Resolve path to the compiled C++ binary in your folder structure
    const binaryPath = path.join(process.cwd(), "src/cpp-microservice/audit_hasher");
    
    // Execute the binary with the payload argument
    const output = execSync(`"${binaryPath}" "${payload}"`).toString().trim();
    
    // Parse the JSON output returned by the C++ binary {"hash": "..."}
    const parsed = JSON.parse(output);
    return parsed.hash;
  } catch (error) {
    console.error("Failed to run C++ audit hasher binary:", error);
    throw new Error("Audit hashing failed");
  }
}