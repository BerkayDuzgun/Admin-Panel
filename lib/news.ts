export interface NewsPost {
  id: string
  title: string
  content: string
  excerpt: string
  bannerImage?: string
  images?: string[]
  author: string
  authorId: string
  publishedAt: Date
  updatedAt: Date
  status: "draft" | "published"
}

// Mock news database - in a real app, this would be in a database
const mockNews: NewsPost[] = [
  {
    id: "1",
    title: "Company Achieves Major Milestone",
    content:
      "We are excited to announce that our company has reached a significant milestone this quarter. Our team's dedication and hard work have led to unprecedented growth and success.\n\nThis achievement wouldn't have been possible without the collaborative efforts of every team member. We look forward to continuing this momentum and reaching even greater heights in the coming months.\n\nThank you to everyone who has contributed to this success!",
    excerpt: "Our company has reached a significant milestone this quarter through team dedication and hard work.",
    bannerImage: "/corporate-milestone.png",
    images: ["/team-celebration.png", "/office-achievement.png"],
    author: "Super Administrator",
    authorId: "1",
    publishedAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    status: "published",
  },
  {
    id: "2",
    title: "New Product Launch Coming Soon",
    content:
      "We're thrilled to give you a sneak peek at our upcoming product launch. After months of development and testing, we're almost ready to unveil something truly special.\n\nOur development team has been working tirelessly to create a solution that addresses the key challenges our customers face. The new product features cutting-edge technology and an intuitive user interface.\n\nStay tuned for more details and the official launch date!",
    excerpt: "Get ready for our exciting new product launch featuring cutting-edge technology and intuitive design.",
    bannerImage: "/product-launch.png",
    author: "Super Administrator",
    authorId: "1",
    publishedAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-12"),
    status: "published",
  },
]

export function getAllNews(): NewsPost[] {
  return mockNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
}

export function getNewsById(id: string): NewsPost | null {
  return mockNews.find((post) => post.id === id) || null
}

export function createNews(newsData: Omit<NewsPost, "id" | "publishedAt" | "updatedAt">): NewsPost {
  const newPost: NewsPost = {
    ...newsData,
    id: Date.now().toString(),
    publishedAt: new Date(),
    updatedAt: new Date(),
  }
  mockNews.push(newPost)
  return newPost
}

export function updateNews(id: string, updates: Partial<Omit<NewsPost, "id" | "publishedAt">>): NewsPost | null {
  const postIndex = mockNews.findIndex((post) => post.id === id)
  if (postIndex === -1) return null

  mockNews[postIndex] = {
    ...mockNews[postIndex],
    ...updates,
    updatedAt: new Date(),
  }
  return mockNews[postIndex]
}

export function deleteNews(id: string): boolean {
  const postIndex = mockNews.findIndex((post) => post.id === id)
  if (postIndex === -1) return false

  mockNews.splice(postIndex, 1)
  return true
}
