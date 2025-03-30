"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ImageIcon } from "lucide-react"

interface ImageUploaderProps {
  onImageSelected: (imageDataUrl: string) => void
  currentImage: string | null
}

export default function ImageUploader({ onImageSelected, currentImage }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (!file.type.match("image.*")) {
      alert("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelected(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        {currentImage ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={currentImage || "/placeholder.svg"}
              alt="Uploaded waste"
              className="max-h-[200px] max-w-full object-contain rounded-md"
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="bg-secondary/50 p-3 rounded-full">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Drag & drop image here or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports: JPG, PNG, WEBP (Max 10MB)</p>
              </div>
            </div>
          </>
        )}
      </div>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
    </div>
  )
}

