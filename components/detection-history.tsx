"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Video } from "lucide-react"
import type { DetectionResult, MediaType } from "@/types/detection"

interface HistoryItem {
  id: string
  media: string
  mediaType: MediaType
  timestamp: Date
  results: DetectionResult
  modelId: string
}

interface DetectionHistoryProps {
  history: HistoryItem[]
}

// Simple date formatter function
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default function DetectionHistory({ history }: DetectionHistoryProps) {
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <p>No detection history yet</p>
        <p className="text-sm">Process some images or videos to see your history here</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video relative">
              {item.mediaType === "image" ? (
                <img
                  src={item.media || "/placeholder.svg"}
                  alt={`Detection from ${formatDate(item.timestamp)}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <video src={item.media} className="object-cover w-full h-full" />
              )}
              <Badge
                className={`absolute top-2 right-2 ${
                  item.mediaType === "image" ? "bg-eco-green text-white" : "bg-eco-purple text-white"
                }`}
              >
                {item.mediaType === "image" ? (
                  <ImageIcon className="h-3 w-3 mr-1" />
                ) : (
                  <Video className="h-3 w-3 mr-1" />
                )}
                {item.mediaType}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">{formatDate(item.timestamp)}</p>
                  <p className="text-xs text-muted-foreground">{item.results.detections.length} objects detected</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItem(item)}
                  className="eco-button text-white"
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        {selectedItem && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="eco-gradient-text">
                Detection Results - {formatDate(selectedItem.timestamp)}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="border rounded-md overflow-hidden">
                {selectedItem.mediaType === "image" ? (
                  <img
                    src={selectedItem.media || "/placeholder.svg"}
                    alt="Detection result"
                    className="w-full h-auto"
                  />
                ) : (
                  <video src={selectedItem.media} controls className="w-full h-auto" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-r from-eco-green/10 to-eco-blue/10 p-3 rounded-md">
                  <p className="text-sm font-medium">Objects Detected</p>
                  <p className="text-2xl font-bold eco-gradient-text">{selectedItem.results.detections.length}</p>
                </div>
                <div className="bg-gradient-to-r from-eco-purple/10 to-eco-pink/10 p-3 rounded-md">
                  <p className="text-sm font-medium">Processing Time</p>
                  <p className="text-2xl font-bold eco-gradient-text-alt">
                    {selectedItem.results.processing_time.toFixed(2)}s
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2 eco-gradient-text">Detected Objects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedItem.results.detections.map((detection, index) => (
                    <div key={index} className="bg-secondary/30 p-2 rounded-md">
                      <div className="flex justify-between">
                        <span className="font-medium">{detection.class_name}</span>
                        <span>{Math.round(detection.confidence * 100)}%</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Box: [{detection.box.map((v) => Math.round(v)).join(", ")}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

