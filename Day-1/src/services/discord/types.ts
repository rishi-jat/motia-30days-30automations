import { z } from 'zod'

// Discord Embed Schema
export const discordEmbedSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  color: z.number().optional(),
  timestamp: z.string().optional(),
})

// Discord Message Schema
export const discordMessageSchema = z.object({
  content: z.string(),
  embeds: z.array(discordEmbedSchema).optional(),
})

// GitHub Release Schema (from webhook payload)
export const githubReleaseSchema = z.object({
  name: z.string(),
  body: z.string().nullable(),
  html_url: z.string().url(),
  tag_name: z.string(),
  published_at: z.string(),
  author: z
    .object({
      login: z.string(),
      avatar_url: z.string(),
    })
    .optional(),
})

// GitHub Webhook Payload Schema
export const githubWebhookSchema = z.object({
  action: z.string(),
  release: githubReleaseSchema,
  repository: z.object({
    name: z.string(),
    full_name: z.string(),
    html_url: z.string(),
  }),
})

export type DiscordEmbed = z.infer<typeof discordEmbedSchema>
export type DiscordMessage = z.infer<typeof discordMessageSchema>
export type GitHubRelease = z.infer<typeof githubReleaseSchema>
export type GitHubWebhook = z.infer<typeof githubWebhookSchema>
