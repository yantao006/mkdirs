const blockedSuffixes = [
  ".localhost",
  ".local",
  ".internal",
  ".test",
  ".invalid",
];

export function publicResourceUrl(value: string): URL {
  const trimmed = value.trim();
  const candidate = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const url = new URL(candidate);
  const host = url.hostname.replace(/\.$/, "").toLowerCase();
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.port ||
    host === "localhost" ||
    !host.includes(".") ||
    host.includes(":") ||
    /^[\d.]+$/.test(host) ||
    blockedSuffixes.some((suffix) => host.endsWith(suffix))
  ) {
    throw new Error("Use a public HTTP(S) website hostname");
  }
  return url;
}

export function isPublicAddress(address: string): boolean {
  if (address.includes(":"))
    return (
      /^[23][0-9a-f]{3}:/i.test(address) &&
      !address.toLowerCase().startsWith("2001:db8:")
    );
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(address)) return false;
  const parts = address.split(".").map(Number);
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  )
    return false;
  const [a, b] = parts;
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 198 && (b === 18 || b === 19))
  );
}

async function checkPublicDns(hostname: string) {
  const addresses: string[] = [];
  for (const type of ["A", "AAAA"]) {
    const query = new URL("https://cloudflare-dns.com/dns-query");
    query.searchParams.set("name", hostname);
    query.searchParams.set("type", type);
    const response = await fetch(query, {
      headers: { accept: "application/dns-json" },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Could not verify the website hostname");
    const data = (await response.json()) as {
      Answer?: { type: number; data: string }[];
    };
    for (const answer of data.Answer || []) {
      if (
        (answer.type === 1 || answer.type === 28) &&
        typeof answer.data === "string"
      )
        addresses.push(answer.data);
    }
  }
  if (
    !addresses.length ||
    addresses.some((address) => !isPublicAddress(address))
  ) {
    throw new Error("The website must resolve only to public addresses");
  }
}

/** No cookies, authorization headers or arbitrary redirects are forwarded. */
export async function fetchPublicResource(
  value: string,
  maxBytes: number,
  options?: { truncate?: boolean },
): Promise<Response> {
  let url = publicResourceUrl(value);
  for (let redirects = 0; redirects <= 3; redirects++) {
    await checkPublicDns(url.hostname);
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) throw new Error("Invalid website redirect");
      url = publicResourceUrl(new URL(location, url).href);
      continue;
    }
    if (!response.ok || !response.body)
      throw new Error("Website request failed");
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    for (;;) {
      const { done, value: chunk } = await reader.read();
      if (done) break;
      if (length + chunk.byteLength > maxBytes) {
        if (!options?.truncate) {
          await reader.cancel();
          throw new Error("Website response is too large");
        }
        chunks.push(chunk.slice(0, maxBytes - length));
        length = maxBytes;
        await reader.cancel();
        break;
      }
      chunks.push(chunk);
      length += chunk.byteLength;
    }
    const body = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.length;
    }
    return new Response(body, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") || "application/octet-stream",
      },
    });
  }
  throw new Error("Too many website redirects");
}
