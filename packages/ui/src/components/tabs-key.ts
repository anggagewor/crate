import type { InjectionKey, Ref } from 'vue'

export const TAB_ACTIVE_KEY = Symbol('tab-active') as InjectionKey<Ref<string>>
