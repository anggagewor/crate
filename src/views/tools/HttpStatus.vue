<script setup lang="ts">
import { ref, computed } from 'vue'
import ToolLayout from '@/components/ToolLayout.vue'
import { BaseCard } from '@purdia/ui'
import { Search } from 'lucide-vue-next'

const search = ref('')

interface StatusCode {
  code: number
  name: string
  description: string
}

const statusCodes: StatusCode[] = [
  { code: 100, name: 'Continue', description: 'The server has received the request headers and the client should proceed to send the request body.' },
  { code: 101, name: 'Switching Protocols', description: 'The server is switching protocols as requested by the client.' },
  { code: 200, name: 'OK', description: 'The request has succeeded.' },
  { code: 201, name: 'Created', description: 'The request has been fulfilled and resulted in a new resource being created.' },
  { code: 202, name: 'Accepted', description: 'The request has been accepted for processing, but processing has not been completed.' },
  { code: 204, name: 'No Content', description: 'The server has fulfilled the request but does not need to return a response body.' },
  { code: 206, name: 'Partial Content', description: 'The server is delivering only part of the resource due to a range header sent by the client.' },
  { code: 301, name: 'Moved Permanently', description: 'The resource has been permanently moved to a new URL.' },
  { code: 302, name: 'Found', description: 'The resource resides temporarily under a different URL.' },
  { code: 303, name: 'See Other', description: 'The response can be found under a different URL using GET method.' },
  { code: 304, name: 'Not Modified', description: 'The resource has not been modified since the last request.' },
  { code: 307, name: 'Temporary Redirect', description: 'The resource resides temporarily under a different URL. Method and body are not changed.' },
  { code: 308, name: 'Permanent Redirect', description: 'The resource has permanently moved. Method and body are not changed.' },
  { code: 400, name: 'Bad Request', description: 'The server cannot process the request due to a client error.' },
  { code: 401, name: 'Unauthorized', description: 'Authentication is required and has failed or has not yet been provided.' },
  { code: 403, name: 'Forbidden', description: 'The server understood the request but refuses to authorize it.' },
  { code: 404, name: 'Not Found', description: 'The requested resource could not be found.' },
  { code: 405, name: 'Method Not Allowed', description: 'The request method is not supported for the requested resource.' },
  { code: 406, name: 'Not Acceptable', description: 'The requested resource can only generate content not acceptable according to the Accept headers.' },
  { code: 408, name: 'Request Timeout', description: 'The server timed out waiting for the request.' },
  { code: 409, name: 'Conflict', description: 'The request could not be completed due to a conflict with the current state of the resource.' },
  { code: 410, name: 'Gone', description: 'The resource is no longer available and will not be available again.' },
  { code: 411, name: 'Length Required', description: 'The request did not specify the length of its content as required.' },
  { code: 412, name: 'Precondition Failed', description: 'The server does not meet one of the preconditions specified in the request.' },
  { code: 413, name: 'Payload Too Large', description: 'The request entity is larger than the server is willing to process.' },
  { code: 414, name: 'URI Too Long', description: 'The URI provided was too long for the server to process.' },
  { code: 415, name: 'Unsupported Media Type', description: 'The request entity has a media type which is not supported.' },
  { code: 416, name: 'Range Not Satisfiable', description: 'The range specified in the Range header cannot be fulfilled.' },
  { code: 418, name: "I'm a Teapot", description: 'The server refuses to brew coffee because it is a teapot (RFC 2324).' },
  { code: 422, name: 'Unprocessable Entity', description: 'The request was well-formed but was unable to be followed due to semantic errors.' },
  { code: 429, name: 'Too Many Requests', description: 'The user has sent too many requests in a given amount of time.' },
  { code: 451, name: 'Unavailable For Legal Reasons', description: 'The resource is unavailable due to legal demands.' },
  { code: 500, name: 'Internal Server Error', description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.' },
  { code: 501, name: 'Not Implemented', description: 'The server does not support the functionality required to fulfill the request.' },
  { code: 502, name: 'Bad Gateway', description: 'The server received an invalid response from the upstream server.' },
  { code: 503, name: 'Service Unavailable', description: 'The server is currently unable to handle the request due to maintenance or overload.' },
  { code: 504, name: 'Gateway Timeout', description: 'The upstream server failed to send a request in the time allowed.' },
  { code: 505, name: 'HTTP Version Not Supported', description: 'The server does not support the HTTP version used in the request.' },
]

const filtered = computed(() => {
  if (!search.value.trim()) return statusCodes
  const q = search.value.toLowerCase()
  return statusCodes.filter(
    (s) =>
      String(s.code).includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
  )
})

function getStatusColor(code: number): string {
  if (code < 200) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
  if (code < 300) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
  if (code < 400) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
  if (code < 500) return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
}
</script>

<template>
  <ToolLayout tool-id="http-status" title="HTTP Status Codes" description="Lookup HTTP status codes and meanings">
    <div class="mb-4">
      <div class="relative">
        <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          v-model="search"
          type="text"
          class="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          placeholder="Search by code, name, or description..."
        />
      </div>
    </div>

    <div class="space-y-2">
      <BaseCard v-for="status in filtered" :key="status.code" variant="bordered">
        <div class="flex items-start gap-3">
          <span
            class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold"
            :class="getStatusColor(status.code)"
          >
            {{ status.code }}
          </span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ status.name }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ status.description }}</p>
          </div>
        </div>
      </BaseCard>
    </div>

    <div v-if="filtered.length === 0" class="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
      No status codes match your search.
    </div>
  </ToolLayout>
</template>
