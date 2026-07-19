/**
 * File-based storage service using Tauri FS plugin.
 * All data is stored in $APPDATA/crate/ as JSON files.
 */

import {
  readTextFile,
  writeTextFile,
  exists,
  mkdir,
  BaseDirectory,
} from '@tauri-apps/plugin-fs'

const APP_DIR = 'crate'

async function ensureDir(): Promise<void> {
  const dirExists = await exists(APP_DIR, { baseDir: BaseDirectory.AppData })
  if (!dirExists) {
    await mkdir(APP_DIR, { baseDir: BaseDirectory.AppData, recursive: true })
  }
}

function filePath(filename: string): string {
  return `${APP_DIR}/${filename}`
}

export async function loadJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    await ensureDir()
    const path = filePath(filename)
    const fileExists = await exists(path, { baseDir: BaseDirectory.AppData })
    if (!fileExists) return fallback
    const content = await readTextFile(path, { baseDir: BaseDirectory.AppData })
    return JSON.parse(content) as T
  } catch {
    return fallback
  }
}

export async function saveJson<T>(filename: string, data: T): Promise<void> {
  await ensureDir()
  const path = filePath(filename)
  await writeTextFile(path, JSON.stringify(data, null, 2), {
    baseDir: BaseDirectory.AppData,
  })
}
