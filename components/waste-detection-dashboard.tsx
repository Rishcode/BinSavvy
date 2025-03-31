"use client"

import { useState } from "react"
import { Upload, Trash2, RefreshCw, ImageIcon, AlertCircle, Camera, DrillIcon as Drone } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import MediaUploader from "./media-uploader"
import DetectionResults from "./detection-results"
import DetectionHistory from "./detection-history"
import { ModelSelector } from "./model-selector"
import type { DetectionResult, MediaType, ModelInfo } from "@/types/detection"

// Available models
const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: "yolo",
    name: "Waste Segmentation",
    description: "Detects and classifies waste in images",
    type: "image",
    icon: "🗑️",
  },
  {
    id: "best2",
    name: "Drone Analysis",
    description: "Analyzes drone footage for objects and activities",
    type: "video",
    icon: "🚁",
  },
]

// Mock data for testing without a backend
const MOCK_RESULT: DetectionResult = {
  detections: [
    {
      box: [50, 50, 200, 150],
      class_name: "plastic",
      confidence: 0.92,
    },
    {
      box: [300, 100, 150, 200],
      class_name: "paper",
      confidence: 0.87,
    },
    {
      box: [150, 300, 100, 100],
      class_name: "glass",
      confidence: 0.76,
    },
  ],
  processing_time: 0.45,
  class_counts: {
    plastic: 1,
    paper: 1,
    glass: 1,
  },
}

const MOCK_VIDEO_RESULT: DetectionResult = {
  detections: [
    {
      box: [100, 100, 200, 150],
      class_name: "drone",
      confidence: 0.95,
    },
    {
      box: [400, 200, 100, 100],
      class_name: "person",
      confidence: 0.88,
    },
    {
      box: [250, 350, 150, 100],
      class_name: "vehicle",
      confidence: 0.82,
    },
  ],
  processing_time: 2.3,
  class_counts: {
    drone: 1,
    person: 1,
    vehicle: 1,
  },
  frame_count: 150,
  fps: 30,
}

export default function WasteDetectionDashboard() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentMedia, setCurrentMedia] = useState<string | null>(null)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<MediaType>("image")
  const [results, setResults] = useState<DetectionResult | null>(null)
  const [history, setHistory] = useState<
    Array<{
      id: string
      media: string
      mediaType: MediaType
      timestamp: Date
      results: DetectionResult
      modelId: string
    }>
  >([])
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)
  const [apiUrl, setApiUrl] = useState("http://localhost:5000/detect")
  const [selectedModel, setSelectedModel] = useState<string>(AVAILABLE_MODELS[0].id)

  const handleMediaUpload = (mediaDataUrl: string, type: MediaType, file: File) => {
    setCurrentMedia(mediaDataUrl)
    setCurrentFile(file)
    setMediaType(type)
    setResults(null)
    setError(null)
  }

  const processMedia = async () => {
    if (!currentMedia || !currentFile) return

    setIsProcessing(true)
    setError(null)

    try {
      let data: DetectionResult

      if (useMockData) {
        // Use mock data for testing UI without backend
        await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API delay
        data = mediaType === "image" ? MOCK_RESULT : MOCK_VIDEO_RESULT
      } else {
        // Create form data to send to API
        const formData = new FormData()
        formData.append("file", currentFile)
        formData.append("model", selectedModel)
        formData.append("media_type", mediaType)

        console.log(`Sending request to: ${apiUrl}`)

        // Send to backend API
        const response = await fetch(apiUrl, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Server responded with status ${response.status}: ${errorText}`)
        }

        data = await response.json()
        console.log("API Response:", data)
      }

      setResults(data)

      // Add to history
      const newHistoryItem = {
        id: Date.now().toString(),
        media: currentMedia,
        mediaType: mediaType,
        timestamp: new Date(),
        results: data,
        modelId: selectedModel,
      }

      setHistory((prev) => [newHistoryItem, ...prev])
    } catch (error) {
      console.error("Error processing media:", error)
      setError(error instanceof Error ? error.message : "Failed to process media. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const clearCurrent = () => {
    setCurrentMedia(null)
    setCurrentFile(null)
    setResults(null)
    setError(null)
  }

  // Get the current model info
  const currentModelInfo = AVAILABLE_MODELS.find((model) => model.id === selectedModel) || AVAILABLE_MODELS[0]

  // Determine acceptable media types based on selected model
  const acceptedTypes =
    currentModelInfo.type === "image" ? "image/*" : currentModelInfo.type === "video" ? "video/*" : "image/*,video/*"

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-r from-eco-green to-eco-blue p-6 rounded-xl text-white">
        <h1 className="text-3xl font-bold">BinSavvy - Waste Detection App</h1>
        <p className="opacity-90 mt-2">
          Upload images or videos for detection and classification using our advanced AI models
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="bg-gradient-to-r from-eco-green/20 to-eco-blue/20">
          <TabsTrigger value="upload" className="data-[state=active]:bg-white">
            <Upload className="mr-2 h-4 w-4" />
            Upload & Detect
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white">
            <ImageIcon className="mr-2 h-4 w-4" />
            Detection History
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-white">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="eco-card">
              <CardHeader className="eco-card-header">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Upload {mediaType === "image" ? "Image" : "Video"}</CardTitle>
                    <CardDescription>
                      Upload {mediaType === "image" ? "an image" : "a video"} for detection
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-gradient-to-r from-eco-green/10 to-eco-blue/10">
                    {mediaType === "image" ? "Image" : "Video"} Mode
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Model</Label>
                    <ModelSelector
                      models={AVAILABLE_MODELS}
                      selectedModel={selectedModel}
                      onSelectModel={(modelId) => {
                        setSelectedModel(modelId)
                        const newModel = AVAILABLE_MODELS.find((m) => m.id === modelId)
                        if (newModel) {
                          if (newModel.type === "image") {
                            setMediaType("image")
                          } else if (newModel.type === "video") {
                            setMediaType("video")
                          }
                          // For 'both' type, keep current mediaType
                        }
                        clearCurrent()
                      }}
                    />
                  </div>

                  <MediaUploader
                    onMediaSelected={handleMediaUpload}
                    currentMedia={currentMedia}
                    mediaType={mediaType}
                    acceptedTypes={acceptedTypes}
                  />

                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-6 bg-gradient-to-r from-eco-green/5 to-eco-blue/5">
                <Button
                  variant="outline"
                  onClick={clearCurrent}
                  disabled={!currentMedia || isProcessing}
                  className="border-eco-green hover:bg-eco-green/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
                <Button
                  onClick={processMedia}
                  disabled={!currentMedia || isProcessing}
                  className="eco-button text-white"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {mediaType === "image" ? (
                        <>
                          <Camera className="mr-2 h-4 w-4" />
                          Detect Waste
                        </>
                      ) : (
                        <>
                          <Drone className="mr-2 h-4 w-4" />
                          Analyze Video
                        </>
                      )}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="eco-card">
              <CardHeader className="eco-card-header">
                <CardTitle>Detection Results</CardTitle>
                <CardDescription>View the detection results from the {currentModelInfo.name} model</CardDescription>
              </CardHeader>
              <CardContent className="p-6 min-h-[300px]">
                <DetectionResults
                  results={results}
                  media={currentMedia}
                  mediaType={mediaType}
                  isProcessing={isProcessing}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="eco-card">
            <CardHeader className="eco-card-header">
              <CardTitle>Detection History</CardTitle>
              <CardDescription>View your previous detection results</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <DetectionHistory history={history} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="eco-card">
            <CardHeader className="eco-card-header">
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure the detection dashboard</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mock-mode">Use Mock Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this to test the UI without a backend connection
                  </p>
                </div>
                <Switch id="mock-mode" checked={useMockData} onCheckedChange={setUseMockData} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-url">API Endpoint URL</Label>
                <div className="flex gap-2">
                  <input
                    id="api-url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="http://localhost:5000/detect"
                  />
                  <Button variant="outline" onClick={() => setApiUrl("http://localhost:5000/detect")}>
                    Reset
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">The URL where your Flask/FastAPI backend is running</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

