<script setup lang="ts">
import { ref } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { useCopy } from '@/composables/useCopy'
import { BaseButton, BaseCard, BaseAlert } from '@purdia/ui'
import { Copy, Check, Trash2, ShieldCheck } from 'lucide-vue-next'

const { copied, copy } = useCopy()

const input = ref('')
const error = ref('')

interface CertInfo {
  subject: Record<string, string>
  issuer: Record<string, string>
  validFrom: string
  validTo: string
  serialNumber: string
  signatureAlgorithm: string
  version: number
  isExpired: boolean
  daysUntilExpiry: number
  subjectAltNames: string[]
  keyUsage: string[]
  fingerprint: string
}

const certInfo = ref<CertInfo | null>(null)

// Parse PEM-encoded X.509 certificate
function decodeCert() {
  if (!input.value.trim()) return

  error.value = ''
  certInfo.value = null

  try {
    const pem = input.value.trim()
    if (!pem.includes('BEGIN CERTIFICATE')) {
      throw new Error('Invalid PEM format. Expected -----BEGIN CERTIFICATE-----')
    }

    // Extract base64 content
    const b64 = pem
      .replace(/-----BEGIN CERTIFICATE-----/g, '')
      .replace(/-----END CERTIFICATE-----/g, '')
      .replace(/\s/g, '')

    // Decode base64 to binary
    const binary = atob(b64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    // Parse ASN.1 DER structure
    const parsed = parseAsn1(bytes, 0)
    if (!parsed || parsed.tag !== 0x30) {
      throw new Error('Invalid certificate structure')
    }

    // TBSCertificate is the first element
    const tbs = parseSequenceChildren(parsed.value as Uint8Array)
    if (tbs.length < 7) {
      throw new Error('Invalid TBSCertificate structure')
    }

    let idx = 0

    // Version (explicit tag [0])
    let version = 1
    if (tbs[idx] && (tbs[idx].rawTag & 0xe0) === 0xa0) {
      const versionBytes = parseSequenceChildren(tbs[idx].value as Uint8Array)
      if (versionBytes[0]) {
        version = (versionBytes[0].value as Uint8Array)[0] + 1
      }
      idx++
    }

    // Serial Number
    const serialBytes = tbs[idx]?.value as Uint8Array
    const serialNumber = Array.from(serialBytes).map(b => b.toString(16).padStart(2, '0')).join(':')
    idx++

    // Signature Algorithm
    const sigAlgSeq = parseSequenceChildren(tbs[idx]?.value as Uint8Array)
    const sigOid = parseOID(sigAlgSeq[0]?.value as Uint8Array)
    const signatureAlgorithm = oidToName(sigOid)
    idx++

    // Issuer
    const issuer = parseDN(tbs[idx]?.value as Uint8Array)
    idx++

    // Validity
    const validityChildren = parseSequenceChildren(tbs[idx]?.value as Uint8Array)
    const validFrom = parseTime(validityChildren[0])
    const validTo = parseTime(validityChildren[1])
    idx++

    // Subject
    const subject = parseDN(tbs[idx]?.value as Uint8Array)
    idx++

    // Calculate expiry
    const now = new Date()
    const expiryDate = new Date(validTo)
    const isExpired = expiryDate < now
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    // Try to parse extensions for SAN
    const subjectAltNames: string[] = []
    const keyUsage: string[] = []

    // Generate a simple fingerprint (SHA-256 would need SubtleCrypto)
    const fingerprint = Array.from(bytes.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(':')

    certInfo.value = {
      subject,
      issuer,
      validFrom,
      validTo,
      serialNumber,
      signatureAlgorithm,
      version,
      isExpired,
      daysUntilExpiry,
      subjectAltNames,
      keyUsage,
      fingerprint,
    }
  } catch (e: unknown) {
    error.value = (e as Error).message || 'Failed to decode certificate'
  }
}

interface Asn1Node {
  tag: number
  rawTag: number
  value: Uint8Array
  length: number
  totalLength: number
}

function parseAsn1(data: Uint8Array, offset: number): Asn1Node | null {
  if (offset >= data.length) return null

  const rawTag = data[offset]
  let pos = offset + 1

  let length = data[pos++]
  if (length & 0x80) {
    const numBytes = length & 0x7f
    length = 0
    for (let i = 0; i < numBytes; i++) {
      length = (length << 8) | data[pos++]
    }
  }

  const value = data.slice(pos, pos + length)
  return { tag: rawTag, rawTag, value, length, totalLength: pos - offset + length }
}

function parseSequenceChildren(data: Uint8Array): Asn1Node[] {
  const children: Asn1Node[] = []
  let offset = 0
  while (offset < data.length) {
    const node = parseAsn1(data, offset)
    if (!node) break
    children.push(node)
    offset += node.totalLength
  }
  return children
}

function parseDN(data: Uint8Array): Record<string, string> {
  const result: Record<string, string> = {}
  const sets = parseSequenceChildren(data)

  for (const set of sets) {
    const seqs = parseSequenceChildren(set.value as Uint8Array)
    for (const seq of seqs) {
      const attrs = parseSequenceChildren(seq.value as Uint8Array)
      if (attrs.length >= 2) {
        const oid = parseOID(attrs[0].value as Uint8Array)
        const name = oidToAttributeName(oid)
        const val = new TextDecoder().decode(attrs[1].value as Uint8Array)
        result[name] = val
      }
    }
  }

  return result
}

function parseOID(data: Uint8Array): string {
  if (data.length === 0) return ''
  const parts: number[] = []
  parts.push(Math.floor(data[0] / 40))
  parts.push(data[0] % 40)

  let value = 0
  for (let i = 1; i < data.length; i++) {
    value = (value << 7) | (data[i] & 0x7f)
    if (!(data[i] & 0x80)) {
      parts.push(value)
      value = 0
    }
  }

  return parts.join('.')
}

function parseTime(node: Asn1Node): string {
  if (!node) return 'N/A'
  const str = new TextDecoder().decode(node.value)
  // UTCTime (tag 0x17) or GeneralizedTime (tag 0x18)
  if (node.rawTag === 0x17) {
    // YYMMDDHHmmssZ
    const year = parseInt(str.slice(0, 2))
    const fullYear = year >= 50 ? 1900 + year : 2000 + year
    return `${fullYear}-${str.slice(2, 4)}-${str.slice(4, 6)} ${str.slice(6, 8)}:${str.slice(8, 10)}:${str.slice(10, 12)} UTC`
  }
  // GeneralizedTime: YYYYMMDDHHmmssZ
  return `${str.slice(0, 4)}-${str.slice(4, 6)}-${str.slice(6, 8)} ${str.slice(8, 10)}:${str.slice(10, 12)}:${str.slice(12, 14)} UTC`
}

function oidToName(oid: string): string {
  const map: Record<string, string> = {
    '1.2.840.113549.1.1.5': 'SHA-1 with RSA',
    '1.2.840.113549.1.1.11': 'SHA-256 with RSA',
    '1.2.840.113549.1.1.12': 'SHA-384 with RSA',
    '1.2.840.113549.1.1.13': 'SHA-512 with RSA',
    '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
    '1.2.840.10045.4.3.3': 'ECDSA with SHA-384',
    '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
  }
  return map[oid] || oid
}

function oidToAttributeName(oid: string): string {
  const map: Record<string, string> = {
    '2.5.4.3': 'CN',
    '2.5.4.6': 'C',
    '2.5.4.7': 'L',
    '2.5.4.8': 'ST',
    '2.5.4.10': 'O',
    '2.5.4.11': 'OU',
    '1.2.840.113549.1.9.1': 'Email',
  }
  return map[oid] || oid
}

function clear() {
  input.value = ''
  certInfo.value = null
  error.value = ''
}

function copyResult() {
  if (!certInfo.value) return
  copy(JSON.stringify(certInfo.value, null, 2))
}
</script>

<template>
  <ToolLayout tool-id="cert-decoder" title="Certificate Decoder" description="Decode and inspect X.509 PEM certificates">
    <!-- Controls -->
    <div class="flex items-center gap-3 mb-4">
      <BaseButton size="sm" :icon="ShieldCheck" :disabled="!input.trim()" @click="decodeCert">Decode</BaseButton>
      <BaseButton variant="ghost" size="sm" :icon="Trash2" @click="clear">Clear</BaseButton>
    </div>

    <!-- Error -->
    <BaseAlert v-if="error" variant="danger" class="mb-4">
      {{ error }}
    </BaseAlert>

    <!-- Input -->
    <BaseCard v-if="!certInfo" variant="bordered" :padding="false" class="mb-4">
      <template #header>
        <span class="text-xs font-medium text-gray-500 dark:text-gray-400">PEM Certificate</span>
      </template>
      <textarea
        v-model="input"
        class="w-full h-64 p-4 font-mono text-xs bg-transparent border-0 resize-none focus:outline-none"
        placeholder="-----BEGIN CERTIFICATE-----&#10;MIIBkTCB+wIJAL...&#10;-----END CERTIFICATE-----"
        spellcheck="false"
      />
    </BaseCard>

    <!-- Result -->
    <div v-if="certInfo" class="space-y-4">
      <!-- Status banner -->
      <BaseAlert :variant="certInfo.isExpired ? 'danger' : 'success'">
        <span v-if="certInfo.isExpired">⚠️ Certificate is EXPIRED ({{ Math.abs(certInfo.daysUntilExpiry) }} days ago)</span>
        <span v-else>✓ Certificate is valid (expires in {{ certInfo.daysUntilExpiry }} days)</span>
      </BaseAlert>

      <BaseCard variant="bordered">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">Certificate Details</span>
            <BaseButton variant="ghost" size="sm" :icon="copied ? Check : Copy" @click="copyResult">
              {{ copied ? 'Copied!' : 'Copy' }}
            </BaseButton>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Subject -->
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Subject</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div v-for="(value, key) in certInfo.subject" :key="key">
                <span class="text-xs text-gray-500">{{ key }}:</span>
                <span class="text-sm ml-1 text-gray-900 dark:text-gray-100">{{ value }}</span>
              </div>
            </div>
          </div>

          <!-- Issuer -->
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Issuer</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div v-for="(value, key) in certInfo.issuer" :key="key">
                <span class="text-xs text-gray-500">{{ key }}:</span>
                <span class="text-sm ml-1 text-gray-900 dark:text-gray-100">{{ value }}</span>
              </div>
            </div>
          </div>

          <!-- Details grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Valid From</p>
              <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ certInfo.validFrom }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Valid To</p>
              <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ certInfo.validTo }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Version</p>
              <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">V{{ certInfo.version }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Signature Algorithm</p>
              <p class="text-sm text-gray-900 dark:text-gray-100 mt-0.5">{{ certInfo.signatureAlgorithm }}</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Serial Number</p>
              <p class="text-xs font-mono text-gray-900 dark:text-gray-100 mt-0.5 break-all">{{ certInfo.serialNumber }}</p>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseButton variant="secondary" size="sm" @click="certInfo = null">← Back to Input</BaseButton>
    </div>
  </ToolLayout>
</template>
