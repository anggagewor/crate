/**
 * Tool registry — all available tools with metadata.
 */

export interface Tool {
  id: string
  name: string
  description: string
  icon: string
  category: ToolCategory
  route: string
}

export type ToolCategory =
  | 'formatters'
  | 'generators'
  | 'datetime'
  | 'encoding'
  | 'data'
  | 'network'
  | 'devhelpers'

export interface CategoryMeta {
  id: ToolCategory
  label: string
  icon: string
}

export const categories: CategoryMeta[] = [
  { id: 'formatters', label: 'Formatters', icon: 'Braces' },
  { id: 'generators', label: 'Generators', icon: 'Sparkles' },
  { id: 'datetime', label: 'Date & Time', icon: 'RefreshCw' },
  { id: 'encoding', label: 'Encoding', icon: 'ArrowLeftRight' },
  { id: 'data', label: 'Data', icon: 'Lock' },
  { id: 'network', label: 'Network', icon: 'Wifi' },
  { id: 'devhelpers', label: 'Dev Helpers', icon: 'Type' },
]

export const tools: Tool[] = [
  // ── Formatters ──────────────────────────────────────────────
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format, validate, and minify JSON', icon: 'Braces', category: 'formatters', route: '/tools/json-formatter' },
  { id: 'xml-formatter', name: 'XML Formatter', description: 'Format and prettify XML', icon: 'Code', category: 'formatters', route: '/tools/xml-formatter' },
  { id: 'sql-formatter', name: 'SQL Formatter', description: 'Format SQL queries', icon: 'Database', category: 'formatters', route: '/tools/sql-formatter' },
  { id: 'html-formatter', name: 'HTML Formatter', description: 'Format and indent HTML', icon: 'FileCode', category: 'formatters', route: '/tools/html-formatter' },
  { id: 'css-formatter', name: 'CSS Formatter', description: 'Format and beautify CSS', icon: 'Paintbrush', category: 'formatters', route: '/tools/css-formatter' },
  { id: 'js-formatter', name: 'JS/TS Formatter', description: 'Format JavaScript and TypeScript', icon: 'FileJson', category: 'formatters', route: '/tools/js-formatter' },
  { id: 'yaml-formatter', name: 'YAML Formatter', description: 'Format and validate YAML', icon: 'FileText', category: 'formatters', route: '/tools/yaml-formatter' },
  { id: 'toml-formatter', name: 'TOML Formatter', description: 'Format TOML documents', icon: 'FileText', category: 'formatters', route: '/tools/toml-formatter' },

  // ── Generators ──────────────────────────────────────────────
  { id: 'uuid-generator', name: 'UUID Generator', description: 'Generate UUID v4 strings', icon: 'Fingerprint', category: 'generators', route: '/tools/uuid-generator' },
  { id: 'nanoid-generator', name: 'NanoID Generator', description: 'Generate compact unique IDs', icon: 'Fingerprint', category: 'generators', route: '/tools/nanoid-generator' },
  { id: 'password-generator', name: 'Password Generator', description: 'Generate secure random passwords', icon: 'KeyRound', category: 'generators', route: '/tools/password-generator' },
  { id: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode and inspect JWT tokens', icon: 'ShieldCheck', category: 'generators', route: '/tools/jwt-decoder' },
  { id: 'jwt-generator', name: 'JWT Generator', description: 'Generate unsigned JWT tokens for testing', icon: 'ShieldCheck', category: 'generators', route: '/tools/jwt-generator' },
  { id: 'hash-generator', name: 'Hash Generator', description: 'Generate SHA-1, SHA-256, SHA-512 hashes', icon: 'Lock', category: 'generators', route: '/tools/hash-generator' },
  { id: 'hmac-generator', name: 'HMAC Generator', description: 'Generate HMAC signatures', icon: 'Lock', category: 'generators', route: '/tools/hmac-generator' },
  { id: 'lorem-ipsum', name: 'Lorem Ipsum', description: 'Generate placeholder text', icon: 'TextCursorInput', category: 'generators', route: '/tools/lorem-ipsum' },
  { id: 'ulid-generator', name: 'ULID Generator', description: 'Generate sortable unique identifiers', icon: 'Fingerprint', category: 'generators', route: '/tools/ulid-generator' },
  { id: 'qr-code', name: 'QR Code', description: 'Generate and decode QR codes', icon: 'QrCode', category: 'generators', route: '/tools/qr-code' },

  // ── Date & Time ─────────────────────────────────────────────
  { id: 'timestamp', name: 'Timestamp Converter', description: 'Convert between Unix timestamps and dates', icon: 'Clock', category: 'datetime', route: '/tools/timestamp' },
  { id: 'timezone-converter', name: 'Timezone Converter', description: 'Convert time between timezones', icon: 'Globe', category: 'datetime', route: '/tools/timezone-converter' },
  { id: 'cron-parser', name: 'Cron Parser', description: 'Parse and explain cron expressions', icon: 'Timer', category: 'datetime', route: '/tools/cron-parser' },

  // ── Encoding ────────────────────────────────────────────────
  { id: 'base64', name: 'Base64', description: 'Encode and decode Base64 strings', icon: 'Binary', category: 'encoding', route: '/tools/base64' },
  { id: 'url-encoder', name: 'URL Encoder', description: 'Encode and decode URL components', icon: 'Link', category: 'encoding', route: '/tools/url-encoder' },
  { id: 'html-encoder', name: 'HTML Entities', description: 'Encode and decode HTML entities', icon: 'Code', category: 'encoding', route: '/tools/html-encoder' },
  { id: 'unicode-escape', name: 'Unicode Escape', description: 'Escape and unescape Unicode strings', icon: 'Languages', category: 'encoding', route: '/tools/unicode-escape' },

  // ── Data ────────────────────────────────────────────────────
  { id: 'json-yaml', name: 'JSON ↔ YAML', description: 'Convert between JSON and YAML', icon: 'ArrowLeftRight', category: 'data', route: '/tools/json-yaml' },
  { id: 'csv-json', name: 'CSV ↔ JSON', description: 'Convert between CSV and JSON', icon: 'ArrowLeftRight', category: 'data', route: '/tools/csv-json' },
  { id: 'json-diff', name: 'JSON Diff', description: 'Compare two JSON documents', icon: 'GitCompare', category: 'data', route: '/tools/json-diff' },
  { id: 'jsonpath-tester', name: 'JSON Path Tester', description: 'Test JSONPath expressions', icon: 'Search', category: 'data', route: '/tools/jsonpath-tester' },

  // ── Network ──────────────────────────────────────────────────
  { id: 'whois-lookup', name: 'WHOIS Lookup', description: 'Lookup WHOIS information for domains and IPs', icon: 'Globe', category: 'network', route: '/tools/whois-lookup' },
  { id: 'speed-test', name: 'Speed Test', description: 'Test your internet download and upload speed', icon: 'Gauge', category: 'network', route: '/tools/speed-test' },
  { id: 'ip-location', name: 'IP Location', description: 'Geolocate any IP address or find your own', icon: 'MapPin', category: 'network', route: '/tools/ip-location' },
  { id: 'network-info', name: 'Network Info', description: 'View your network connection and browser details', icon: 'Wifi', category: 'network', route: '/tools/network-info' },
  { id: 'dns-lookup', name: 'DNS Lookup', description: 'Query DNS records for any domain', icon: 'Globe', category: 'network', route: '/tools/dns-lookup' },
  { id: 'cert-decoder', name: 'Certificate Decoder', description: 'Decode and inspect X.509 PEM certificates', icon: 'ShieldCheck', category: 'network', route: '/tools/cert-decoder' },

  // ── Dev Helpers ─────────────────────────────────────────────
  { id: 'regex-tester', name: 'Regex Tester', description: 'Test regular expressions with live matching', icon: 'Regex', category: 'devhelpers', route: '/tools/regex-tester' },
  { id: 'http-status', name: 'HTTP Status Codes', description: 'Lookup HTTP status codes and meanings', icon: 'Globe', category: 'devhelpers', route: '/tools/http-status' },
  { id: 'mime-lookup', name: 'MIME Type Lookup', description: 'Search MIME types by extension', icon: 'File', category: 'devhelpers', route: '/tools/mime-lookup' },
  { id: 'color-converter', name: 'Color Converter', description: 'Convert between HEX, RGB, and HSL', icon: 'Palette', category: 'devhelpers', route: '/tools/color-converter' },
  { id: 'number-base', name: 'Number Base', description: 'Convert between decimal, hex, octal, binary', icon: 'Hash', category: 'devhelpers', route: '/tools/number-base' },
  { id: 'case-converter', name: 'Case Converter', description: 'Convert between camelCase, snake_case, kebab-case, PascalCase', icon: 'CaseSensitive', category: 'devhelpers', route: '/tools/case-converter' },
  { id: 'diff-checker', name: 'Diff Checker', description: 'Compare two texts and see differences', icon: 'GitCompare', category: 'devhelpers', route: '/tools/diff-checker' },
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, lines, and sentences', icon: 'LetterText', category: 'devhelpers', route: '/tools/word-counter' },
  { id: 'markdown-preview', name: 'Markdown Preview', description: 'Preview Markdown with live rendering', icon: 'FileText', category: 'devhelpers', route: '/tools/markdown-preview' },
  { id: 'snippets', name: 'Snippets Manager', description: 'Save and organize code snippets', icon: 'FileCode', category: 'devhelpers', route: '/tools/snippets' },
  { id: 'env-editor', name: 'Env Editor', description: 'Visual .env file editor', icon: 'FileText', category: 'devhelpers', route: '/tools/env-editor' },
  { id: 'placeholder-image', name: 'Placeholder Image', description: 'Generate placeholder SVG images', icon: 'Image', category: 'devhelpers', route: '/tools/placeholder-image' },
  { id: 'chmod-calculator', name: 'Chmod Calculator', description: 'Unix file permission calculator', icon: 'Shield', category: 'devhelpers', route: '/tools/chmod-calculator' },
  { id: 'curl-converter', name: 'cURL ↔ Code', description: 'Convert cURL commands to code in various languages', icon: 'Terminal', category: 'devhelpers', route: '/tools/curl-converter' },
  { id: 'ua-parser', name: 'User Agent Parser', description: 'Parse and analyze user agent strings', icon: 'Monitor', category: 'devhelpers', route: '/tools/ua-parser' },
  { id: 'cookie-parser', name: 'Cookie Parser', description: 'Parse and inspect HTTP cookie strings', icon: 'Cookie', category: 'devhelpers', route: '/tools/cookie-parser' },
  { id: 'color-palette', name: 'Color Palette', description: 'Generate Tailwind CSS color shades from any base color', icon: 'Palette', category: 'devhelpers', route: '/tools/color-palette' },
]

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((t) => t.category === category)
}

export function getToolById(id: string): Tool | undefined {
  return tools.find((t) => t.id === id)
}
