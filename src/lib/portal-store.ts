// src/lib/portal-store.ts
// Persistent post storage for the Portal (localStorage)

const KEY = 'organa_portal_posts'

export type PostType = 'post' | 'achievement'

export interface PortalPost {
  id: string
  authorId: string | null     // agent.id — null for system/anonymous
  authorName: string
  authorRole: string
  authorDept: string
  content: string
  type: PostType
  achievementEmoji?: string   // shown as accent if type === 'achievement'
  timestamp: string           // ISO
}

function load(): PortalPost[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]') } catch { return [] }
}

function save(posts: PortalPost[]) {
  localStorage.setItem(KEY, JSON.stringify(posts))
}

export const portalStore = {
  getPosts(): PortalPost[] {
    return load().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },

  addPost(post: Omit<PortalPost, 'id'>): PortalPost {
    const full: PortalPost = { ...post, id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
    const posts = load()
    posts.unshift(full)
    save(posts)
    return full
  },

  deletePost(id: string): void {
    save(load().filter(p => p.id !== id))
  },
}
