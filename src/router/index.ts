import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/HomePage.vue') },

  // Formatters
  { path: '/tools/json-formatter', name: 'json-formatter', component: () => import('@/views/tools/JsonFormatter.vue') },
  { path: '/tools/xml-formatter', name: 'xml-formatter', component: () => import('@/views/tools/XmlFormatter.vue') },
  { path: '/tools/sql-formatter', name: 'sql-formatter', component: () => import('@/views/tools/SqlFormatter.vue') },
  { path: '/tools/html-formatter', name: 'html-formatter', component: () => import('@/views/tools/HtmlFormatter.vue') },
  { path: '/tools/css-formatter', name: 'css-formatter', component: () => import('@/views/tools/CssFormatter.vue') },
  { path: '/tools/js-formatter', name: 'js-formatter', component: () => import('@/views/tools/JsFormatter.vue') },
  { path: '/tools/yaml-formatter', name: 'yaml-formatter', component: () => import('@/views/tools/YamlFormatter.vue') },
  { path: '/tools/toml-formatter', name: 'toml-formatter', component: () => import('@/views/tools/TomlFormatter.vue') },

  // Generators
  { path: '/tools/uuid-generator', name: 'uuid-generator', component: () => import('@/views/tools/UuidGenerator.vue') },
  { path: '/tools/nanoid-generator', name: 'nanoid-generator', component: () => import('@/views/tools/NanoidGenerator.vue') },
  { path: '/tools/password-generator', name: 'password-generator', component: () => import('@/views/tools/PasswordGenerator.vue') },
  { path: '/tools/jwt-decoder', name: 'jwt-decoder', component: () => import('@/views/tools/JwtDecoder.vue') },
  { path: '/tools/jwt-generator', name: 'jwt-generator', component: () => import('@/views/tools/JwtGenerator.vue') },
  { path: '/tools/hash-generator', name: 'hash-generator', component: () => import('@/views/tools/HashGenerator.vue') },
  { path: '/tools/hmac-generator', name: 'hmac-generator', component: () => import('@/views/tools/HmacGenerator.vue') },
  { path: '/tools/lorem-ipsum', name: 'lorem-ipsum', component: () => import('@/views/tools/LoremIpsum.vue') },

  // Date & Time
  { path: '/tools/timestamp', name: 'timestamp', component: () => import('@/views/tools/TimestampConverter.vue') },
  { path: '/tools/timezone-converter', name: 'timezone-converter', component: () => import('@/views/tools/TimezoneConverter.vue') },
  { path: '/tools/cron-parser', name: 'cron-parser', component: () => import('@/views/tools/CronParser.vue') },

  // Encoding
  { path: '/tools/base64', name: 'base64', component: () => import('@/views/tools/Base64Tool.vue') },
  { path: '/tools/url-encoder', name: 'url-encoder', component: () => import('@/views/tools/UrlEncoder.vue') },
  { path: '/tools/html-encoder', name: 'html-encoder', component: () => import('@/views/tools/HtmlEncoder.vue') },
  { path: '/tools/unicode-escape', name: 'unicode-escape', component: () => import('@/views/tools/UnicodeEscape.vue') },

  // Data
  { path: '/tools/json-yaml', name: 'json-yaml', component: () => import('@/views/tools/JsonYaml.vue') },
  { path: '/tools/csv-json', name: 'csv-json', component: () => import('@/views/tools/CsvJson.vue') },
  { path: '/tools/json-diff', name: 'json-diff', component: () => import('@/views/tools/JsonDiff.vue') },
  { path: '/tools/jsonpath-tester', name: 'jsonpath-tester', component: () => import('@/views/tools/JsonPathTester.vue') },

  // Dev Helpers
  { path: '/tools/regex-tester', name: 'regex-tester', component: () => import('@/views/tools/RegexTester.vue') },
  { path: '/tools/http-status', name: 'http-status', component: () => import('@/views/tools/HttpStatus.vue') },
  { path: '/tools/mime-lookup', name: 'mime-lookup', component: () => import('@/views/tools/MimeLookup.vue') },
  { path: '/tools/color-converter', name: 'color-converter', component: () => import('@/views/tools/ColorConverter.vue') },
  { path: '/tools/number-base', name: 'number-base', component: () => import('@/views/tools/NumberBase.vue') },
  { path: '/tools/case-converter', name: 'case-converter', component: () => import('@/views/tools/CaseConverter.vue') },
  { path: '/tools/diff-checker', name: 'diff-checker', component: () => import('@/views/tools/DiffChecker.vue') },
  { path: '/tools/word-counter', name: 'word-counter', component: () => import('@/views/tools/WordCounter.vue') },
  { path: '/tools/markdown-preview', name: 'markdown-preview', component: () => import('@/views/tools/MarkdownPreview.vue') },
  { path: '/tools/snippets', name: 'snippets', component: () => import('@/views/tools/SnippetsManager.vue') },
  { path: '/tools/env-editor', name: 'env-editor', component: () => import('@/views/tools/EnvEditor.vue') },
  { path: '/tools/placeholder-image', name: 'placeholder-image', component: () => import('@/views/tools/PlaceholderImage.vue') },
  { path: '/tools/chmod-calculator', name: 'chmod-calculator', component: () => import('@/views/tools/ChmodCalculator.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
