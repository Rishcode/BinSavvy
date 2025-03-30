"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, Play, Pause, SkipBack, SkipForward } from "lucide-react"
import type { DetectionResult, MediaType } from "@/types/detection"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface DetectionResultsProps {
  results: DetectionResult | null
  media: string | null
  mediaType: MediaType
  isProcessing: boolean
}

export default function DetectionResults({ results, media, mediaType, isProcessing }: DetectionResultsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [totalFrames, setTotalFrames] = useState(0)

  // For images
  useEffect(() => {
    if (results && media && mediaType === "image" && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")

      if (!ctx) return

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        // Set canvas dimensions to match image
        canvas.width = img.width
        canvas.height = img.height

        // Draw the original image
        ctx.drawImage(img, 0, 0)

        // Draw bounding boxes
        results.detections.forEach((detection) => {
          const { box, class_name, confidence } = detection
          const [x, y, width, height] = box

          // Draw rectangle
          ctx.strokeStyle = getColorForClass(class_name)
          ctx.lineWidth = 2
          ctx.strokeRect(x, y, width, height)

          // Draw label background
          const label = `${class_name} ${Math.round(confidence * 100)}%`
          const textMetrics = ctx.measureText(label)
          const textHeight = 20
          ctx.fillStyle = getColorForClass(class_name)
          ctx.fillRect(x, y - textHeight, textMetrics.width + 10, textHeight)

          // Draw label text
          ctx.fillStyle = "#ffffff"
          ctx.font = "14px Arial"
          ctx.fillText(label, x + 5, y - 5)
        })
      }
      img.src = media
    }
  }, [results, media, mediaType])

  // For videos
  useEffect(() => {
    if (results && media && mediaType === "video" && videoRef.current) {
      const video = videoRef.current

      // Set up video event listeners
      video.onloadedmetadata = () => {
        setTotalFrames(Math.floor(video.duration * (results.fps || 30)))
      }

      video.onplay = () => setIsPlaying(true)
      video.onpause = () => setIsPlaying(false)
      video.onended = () => setIsPlaying(false)

      // Load the video
      video.src = media
      video.load()
    }
  }, [results, media, mediaType])

  // Video controls
  const togglePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const seekVideo = (frameIndex: number) => {
    if (!videoRef.current || !results?.fps) return

    const timeInSeconds = frameIndex / results.fps
    videoRef.current.currentTime = timeInSeconds
    setCurrentFrame(frameIndex)
  }

  const skipForward = () => {
    if (!videoRef.current || !results?.fps) return

    const newFrame = Math.min(currentFrame + 10, totalFrames - 1)
    seekVideo(newFrame)
  }

  const skipBackward = () => {
    if (!videoRef.current || !results?.fps) return

    const newFrame = Math.max(currentFrame - 10, 0)
    seekVideo(newFrame)
  }

  const getColorForClass = (className: string) => {
    // Map waste classes to colors
    const colorMap: Record<string, string> = {
      plastic: "#FF5733",
      paper: "#33A1FD",
      metal: "#B533FF",
      glass: "#33FF57",
      organic: "#FFD133",
      other: "#FF33A8",
      drone: "#38BDF8",
      person: "#F472B6",
      vehicle: "#FBBF24",
      building: "#FB923C",
      animal: "#A78BFA",
    }

    return colorMap[className.toLowerCase()] || "#FF5733"
  }

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Processing {mediaType}...</p>
      </div>
    )
  }

  if (!results && !media) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Upload and process a {mediaType} to see detection results</p>
      </div>
    )
  }

  if (!results && media) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>Click "Detect" to process this {mediaType}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="relative border rounded-md overflow-hidden">
        {mediaType === "image" ? (
          <canvas ref={canvasRef} className="max-w-full h-auto" />
        ) : (
          <div className="space-y-2">
            <video
              ref={videoRef}
              className="max-w-full h-auto rounded-md"
              onTimeUpdate={() => {
                if (videoRef.current && results?.fps) {
                  setCurrentFrame(Math.floor(videoRef.current.currentTime * results.fps))
                }
              }}
            />

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={skipBackward}>
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="icon" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button variant="outline" size="icon" onClick={skipForward}>
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="flex-1">
                <Slider
                  value={[currentFrame]}
                  min={0}
                  max={totalFrames - 1}
                  step={1}
                  onValueChange={(value) => seekVideo(value[0])}
                />
              </div>

              <div className="text-sm text-muted-foreground">
                {currentFrame}/{totalFrames}
              </div>
            </div>
          </div>
        )}
      </div>

      {results && (
        <div className="space-y-2">
          <h3 className="font-medium eco-gradient-text">Detection Summary</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gradient-to-r from-eco-green/10 to-eco-blue/10 p-4 rounded-md">
              <p className="text-sm font-medium">Objects Detected</p>
              <p className="text-2xl font-bold eco-gradient-text">{results.detections.length}</p>
            </div>
            <div className="bg-gradient-to-r from-eco-purple/10 to-eco-pink/10 p-4 rounded-md">
              <p className="text-sm font-medium">Processing Time</p>
              <p className="text-2xl font-bold eco-gradient-text-alt">{results.processing_time.toFixed(2)}s</p>
            </div>
          </div>

          <h3 className="font-medium eco-gradient-text mt-2">Detected Classes</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(results.class_counts).map(([className, count]) => (
              <div key={className} className="flex items-center bg-secondary/30 p-2 rounded-md">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getColorForClass(className) }} />
                <span className="text-sm">
                  {className}: {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

