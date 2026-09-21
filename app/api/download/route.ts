import fs from "node:fs/promises";
import JSZip from "jszip";
import { getLabs, resolveLabPath } from "@/lib/labs";

// Reads query params and the filesystem, so it must run per-request.
export const dynamic = "force-dynamic";

function pad(day: number): string {
  return String(day).padStart(2, "0");
}

/** RFC 5987 content-disposition so names with spaces and "&" survive. */
function attachment(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "'");
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  // Single lab: /api/download?file=Day%2012%20Lab%20-%20Life%20of%20a%20Packet.pkt
  const file = params.get("file");
  if (file) {
    const filePath = resolveLabPath(file);
    if (!filePath) {
      return new Response("Lab not found", { status: 404 });
    }
    const body = await fs.readFile(filePath);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": attachment(file),
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // Everything up to a day: /api/download?day=24
  const day = Number(params.get("day"));
  if (!Number.isInteger(day) || day < 1) {
    return new Response("Expected ?day=<n> or ?file=<name>", { status: 400 });
  }

  const labs = getLabs().filter((lab) => lab.day <= day);
  if (labs.length === 0) {
    return new Response("No labs on or before that day", { status: 404 });
  }

  const zip = new JSZip();
  for (const lab of labs) {
    zip.file(lab.file, await fs.readFile(resolveLabPath(lab.file)!));
  }

  const archive = await zip.generateAsync({
    type: "arraybuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const name =
    labs.length === 1
      ? `jitl-lab-day-${pad(day)}.zip`
      : `jitl-labs-day-01-to-${pad(day)}.zip`;

  return new Response(archive, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": attachment(name),
      "Content-Length": String(archive.byteLength),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
