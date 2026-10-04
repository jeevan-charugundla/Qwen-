import { InferenceClient } from '@huggingface/inference'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const model = 'black-forest-labs/FLUX.1-schnell'
const assetsDirectory = path.resolve(process.cwd(), 'generated-assets')

export type GeneratedCampaignImage = {
  imageId: string
  imageUrl: string
  localPath: string
  prompt: string
}

export async function generateCampaignImage(prompt: string, options?: { width?: number; height?: number }): Promise<GeneratedCampaignImage> {
  const token = process.env.HF_TOKEN
  if (!token) throw new Error('Hugging Face is not configured. Add HF_TOKEN to the server environment.')

  const client = new InferenceClient(token)
  const image = await client.textToImage({
    model,
    inputs: prompt,
    parameters: {
      width: options?.width ?? 1024,
      height: options?.height ?? 1024,
    },
  }, { outputType: 'blob' })

  const imageId = randomUUID()
  const fileName = `${imageId}.png`
  await mkdir(assetsDirectory, { recursive: true })
  const filePath = path.join(assetsDirectory, fileName)
  await writeFile(filePath, Buffer.from(await image.arrayBuffer()))

  return {
    imageId,
    imageUrl: `/generated-assets/${fileName}`,
    localPath: filePath,
    prompt,
  }
}
