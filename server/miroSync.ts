export const MIRO_BOARD_URL = 'https://miro.com/app/board/uXjVEervLkQ=/'

export type SyncContentItem = {
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
  aspectRatio?: string
  generatedImage?: { id: string; url: string; prompt: string }
}

export type SyncCampaign = {
  campaignId: string
  campaignName: string
  brand: string
  campaignObjective: string
  targetAudience: string
  duration: number
  contentPillars: { name: string; purpose: string }[]
  calendar: SyncContentItem[]
  generatedImages?: { id: string; url: string; prompt: string }[]
}

export type MiroSyncPayload = SyncCampaign & {
  boardUrl: string
  sectionKey: string
  workspace: {
    sections: string[]
    journeyStages: string[]
    messageFlow: string[]
    productionStages: string[]
  }
}

export class MiroSyncService {
  buildPayload(campaign: SyncCampaign): MiroSyncPayload {
    return {
      ...campaign,
      boardUrl: MIRO_BOARD_URL,
      sectionKey: `social-os-campaign-${campaign.campaignId}`,
      workspace: {
        sections: [
          'Campaign Overview',
          'Campaign Objective',
          'Target Audience',
          'Big Campaign Idea',
          'Content Pillars',
          'Message Map',
          '7-Day Content Journey',
          'Content Studio',
          'Creative Studio',
          'Production Pipeline',
          'Distribution Kit',
          'AI Strategist Notes',
        ],
        journeyStages: ['Awareness', 'Education', 'Engagement', 'Trust', 'Value', 'Conversion', 'Action'],
        messageFlow: ['Hook', 'Problem', 'Insight', 'Solution', 'Proof', 'CTA'],
        productionStages: ['Idea', 'Draft', 'Design', 'Review', 'Approved', 'Published'],
      },
    }
  }
}

export const miroSyncService = new MiroSyncService()
export const createMiroSyncPayload = (campaign: SyncCampaign) => miroSyncService.buildPayload(campaign)
