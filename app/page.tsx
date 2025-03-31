import type { Metadata } from "next"
import WasteDetectionDashboard from "@/components/waste-detection-dashboard"

export const metadata: Metadata = {
  title: "BinSavvy - Waste Detection",
  description: "Upload waste images for detection using YOLO model",
}

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <WasteDetectionDashboard />
    </div>
  )
}

