import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { z } from 'zod'
import { generateCampaignImage } from './imageGenerationService'
import { createMiroSyncPayload, MIRO_BOARD_URL, type SyncCampaign } from './miroSync'

const app = express()
const port = Number(process.env.PORT ?? 8787)
type StoredCampaign = SyncCampaign & { campaignTheme: string; campaignSummary: string; miroSyncStatus: 'Not Synced' | 'Syncing' | 'Synced' | 'Sync Failed'; miroSyncedAt?: string }
const campaignStore = new Map<string, StoredCampaign>()
app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use('/generated-assets', express.static('generated-assets'))

const requestSchema = z.object({
  brand: z.object({
    company: z.string().min(1),
    industry: z.string().min(1),
    description: z.string().min(1),
    audience: z.string().min(1),
    personality: z.string().min(1),
    cta: z.string().min(1),
    primaryColor: z.string(),
  }),
  campaign: z.object({
    name: z.string().min(1),
    objective: z.string().min(1),
    duration: z.number(),
    platforms: z.array(z.string()).min(1),
    tone: z.string().min(1),
  }),
})

function demoCampaign(input: z.infer<typeof requestSchema>): StoredCampaign {
  const { brand, campaign } = input
  const topics = [
    ['The signal your audience is waiting for', 'Reel', 'A sharp, human introduction to the problem your brand solves.'],
    ['Three things your audience should know', 'Carousel', 'Turn expertise into a saveable, easy-to-scan checklist.'],
    ['A point of view worth sharing', 'LinkedIn post', 'Lead with a clear opinion and invite a thoughtful response.'],
    ['Behind the scenes of the promise', 'Story', 'Show the people and process behind the product.'],
    ['The customer question we hear most', 'Carousel', 'Answer one objection with proof and practical guidance.'],
    ['A small win worth celebrating', 'Static post', 'Build momentum by making progress visible and relatable.'],
    ['Your next step', 'Reel', 'Close the week with a simple, specific invitation to act.'],
  ]
  return {
    campaignId: crypto.randomUUID(),
    campaignName: campaign.name,
    campaignTheme: 'Make the next move feel obvious',
    campaignObjective: campaign.objective,
    campaignSummary: `${brand.company} earns attention by translating ${brand.industry.toLowerCase()} expertise into useful, human moments for ${brand.audience.toLowerCase()}.`,
    targetAudience: brand.audience,
    contentPillars: [
      { name: 'Clarity', purpose: 'Make the problem and the next step easy to understand.' },
      { name: 'Proof', purpose: 'Build trust with practical, grounded insight.' },
      { name: 'Momentum', purpose: 'Turn interest into a confident action.' },
    ],
    brand: brand.company,
    duration: campaign.duration,
    miroSyncStatus: 'Not Synced' as const,
    calendar: topics.map(([topic, format, brief], index) => ({
      contentId: `${campaign.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${index + 1}`,
      day: index + 1,
      platform: campaign.platforms[index % campaign.platforms.length],
      format,
      topic,
      hook: `${topic} — a practical perspective from ${brand.company}.`,
      caption: `${topic}. Here is what matters: ${brief} ${brand.cta}.`,
      cta: brand.cta,
      creativeBrief: brief,
      creativeConcept: `${brand.company} turns ${topic.toLowerCase()} into a clear next step.`,
      creativePrompt: `${brand.company}, ${campaign.objective}, for ${brand.audience}: ${topic}. ${brief} Premium editorial social media creative, minimal text, ${campaign.platforms[index % campaign.platforms.length]} format.`,
      visualStyle: 'Premium editorial photography',
      composition: 'Subject positioned to leave negative space for copy',
      subject: topic,
      lighting: 'Soft natural studio lighting',
      colorDirection: `Clean neutral tones with ${brand.primaryColor} accent`,
      aspectRatio: '1:1',
      status: 'Draft',
    })),
  }
}

app.post('/api/campaign/generate', (req, res) => {
  const parsed = requestSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Please complete the brand and campaign fields.' })
  const campaign = demoCampaign(parsed.data)
  campaignStore.set(campaign.campaignId, campaign)
  return res.json({ mode: 'demo', campaign })
})

app.post('/api/content/generate', (req, res) => res.json({ mode: 'demo', message: 'Content regenerated in demo mode.' }))
app.post('/api/creative/generate', (req, res) => res.json({ mode: 'demo', message: 'Creative generated in demo mode.' }))

const imageRequestSchema = z.object({
  campaignId: z.string().min(1),
  contentId: z.string().min(1),
  prompt: z.string().min(10).max(4000),
  aspectRatio: z.enum(['1:1', '4:5', '16:9']).default('1:1'),
})

app.post('/api/images/generate', async (req, res) => {
  const parsed = imageRequestSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ success: false, error: 'campaignId, contentId, aspectRatio, and a descriptive prompt are required.' })

  const dimensions = parsed.data.aspectRatio === '4:5'
    ? { width: 1024, height: 1280 }
    : parsed.data.aspectRatio === '16:9'
      ? { width: 1344, height: 768 }
      : { width: 1024, height: 1024 }

  try {
    const campaign = campaignStore.get(parsed.data.campaignId)
    if (!campaign) return res.status(404).json({ success: false, error: 'Campaign not found.' })
    if (!campaign.calendar.some((item) => item.contentId === parsed.data.contentId)) {
      return res.status(404).json({ success: false, error: 'Content item not found in campaign.' })
    }
    const image = await generateCampaignImage(parsed.data.prompt, dimensions)
    const calendar = campaign.calendar.map((item) => item.contentId === parsed.data.contentId
      ? { ...item, generatedImage: { id: image.imageId, url: image.imageUrl, prompt: image.prompt } }
      : item)
    campaignStore.set(parsed.data.campaignId, {
      ...campaign,
      calendar,
      generatedImages: [...(campaign.generatedImages ?? []).filter((item) => item.id !== image.imageId), { id: image.imageId, url: image.imageUrl, prompt: image.prompt }],
    })
    return res.json({
      success: true,
      image: { id: image.imageId, url: image.imageUrl, prompt: image.prompt },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Image generation failed.'
    console.error(`Image generation failed for campaign ${parsed.data.campaignId}, content ${parsed.data.contentId}: ${message}`)
    return res.status(502).json({ success: false, error: message })
  }
})

app.get('/api/miro/test', (_req, res) => {
  return res.json({ connected: true, mode: 'mcp', boardUrl: MIRO_BOARD_URL, message: 'Miro MCP board is linked.' })
})

app.get('/api/campaigns/:campaignId/miro-payload', (req, res) => {
  const campaign = campaignStore.get(req.params.campaignId)
  if (!campaign) return res.status(404).json({ error: 'Campaign not found.' })
  return res.json(createMiroSyncPayload(campaign as SyncCampaign))
})

app.post('/api/miro/sync', (req, res) => {
  if (!req.body) return res.status(400).json({ synced: false, error: 'Campaign data is required.' })
  const payload = createMiroSyncPayload(req.body as SyncCampaign)
  const stored = campaignStore.get(payload.campaignId)
  if (stored) campaignStore.set(payload.campaignId, { ...stored, miroSyncStatus: 'Syncing' })
  return res.json({ synced: false, status: 'Syncing', mode: 'mcp', payload, message: 'Payload prepared for the connected Miro MCP workflow.' })
})

app.listen(port, () => console.log(`SOCIAL OS API running on http://localhost:${port}`))
