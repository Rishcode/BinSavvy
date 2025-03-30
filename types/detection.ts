export interface Detection {
  box: [number, number, number, number] // [x, y, width, height]
  class_name: string
  confidence: number
}

export interface DetectionResult {
  detections: Detection[]
  processing_time: number
  class_counts: Record<string, number>
  frame_count?: number // For videos
  fps?: number // For videos
}

export interface ModelInfo {
  id: string
  name: string
  description: string
  type: "image" | "video" | "both"
  icon: string
}

export type MediaType = "image" | "video"

