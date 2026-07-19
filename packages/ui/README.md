# @purdia/ui

Reusable Vue 3 UI component library for Purdia ecosystem.

## Installation

```bash
npm install @purdia/ui
```

## Usage

```vue
<script setup lang="ts">
import { BaseButton, BaseCard, BaseInput } from '@purdia/ui'
</script>

<template>
  <BaseCard>
    <BaseInput label="Name" placeholder="Enter name..." />
    <BaseButton variant="primary">Submit</BaseButton>
  </BaseCard>
</template>
```

## Components

| Component               | Description                        |
| ----------------------- | ---------------------------------- |
| `BaseAlert`             | Alert/notification banners         |
| `BaseAvatar`            | User avatar with initials fallback |
| `BaseBadge`             | Status badges and labels           |
| `BaseBreadcrumb`        | Navigation breadcrumbs             |
| `BaseButton`            | Buttons with variants and sizes    |
| `BaseCard`              | Content card container             |
| `BaseDatePicker`        | Date, time, and range picker       |
| `BaseEditor`            | Rich text editor (Tiptap)          |
| `BaseFileUpload`        | File upload with drag & drop       |
| `BaseInput`             | Text input fields                  |
| `BaseModal`             | Dialog/modal windows               |
| `BasePagination`        | Pagination controls                |
| `BaseProgress`          | Progress bars                      |
| `BaseSelect`            | Dropdown select with search        |
| `BaseSkeleton`          | Loading skeleton placeholders      |
| `BaseTable`             | Data table with sort & search      |
| `BaseTabs` / `TabPanel` | Tab navigation                     |
| `BaseToggle`            | Toggle/switch control              |
| `ButtonGroup`           | Grouped buttons                    |
| `DropdownButton`        | Button with dropdown menu          |
| `StatCard`              | Statistics display card            |

## Peer Dependencies

- `vue` ^3.5.0
- `vue-router` ^5.0.0 (for BaseBreadcrumb)

## Development

```bash
# Build the package
npm run build -w packages/ui

# Watch mode
npm run dev -w packages/ui
```
