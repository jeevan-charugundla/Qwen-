export type SyncStatus = 'Not Synced' | 'Syncing' | 'Synced' | 'Sync Failed'

export type Brand = {
  company: string
  industry: string
  description: string
  audience: string
  personality: string
  cta: string
  primaryColor: string
  secondaryColor: string
}

export type ContentItem = {
  contentId?: string
  day: number
  platform: string
  format: string
  topic: string
  hook: string
  caption: string
  cta: string
  creativeBrief: string
  status: string
  creativeConcept?: string
  creativePrompt?: string
  visualStyle?: string
  composition?: string
  subject?: string
  lighting?: string
  colorDirection?: string
  aspectRatio?: '1:1' | '4:5' | '16:9'
  generatedImage?: GeneratedImage
}

export type GeneratedImage = {
  id: string
  url: string
  prompt: string
}

export type Campaign = {
  campaignId: string
  campaignName: string
  brand: string
  campaignTheme: string
  campaignObjective: string
  campaignSummary: string
  targetAudience: string
  duration: number
  contentPillars: { name: string; purpose: string }[]
  calendar: ContentItem[]
  miroSyncStatus: SyncStatus
  miroSyncedAt?: string
  generatedImages?: GeneratedImage[]
}

export type MiroSyncPayload = {
  campaignId: string
  boardUrl: string
  sectionKey: string
  campaignName: string
  brand: string
  campaignObjective: string
  targetAudience: string
  campaignDuration: number
  contentPillars: { name: string; purpose: string }[]
  calendar: ContentItem[]
}
