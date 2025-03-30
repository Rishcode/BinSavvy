"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { ModelInfo } from "@/types/detection"

interface ModelSelectorProps {
  models: ModelInfo[]
  selectedModel: string
  onSelectModel: (modelId: string) => void
}

export function ModelSelector({ models, selectedModel, onSelectModel }: ModelSelectorProps) {
  const [open, setOpen] = useState(false)

  const currentModel = models.find((model) => model.id === selectedModel)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          <div className="flex items-center gap-2">
            {currentModel?.icon && (
              <span className="text-lg" aria-hidden="true">
                {currentModel.icon}
              </span>
            )}
            <span>{currentModel?.name || "Select model..."}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={() => {
                    onSelectModel(model.id)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedModel === model.id ? "opacity-100" : "opacity-0")} />
                  <div className="flex items-center gap-2">
                    {model.icon && (
                      <span className="text-lg" aria-hidden="true">
                        {model.icon}
                      </span>
                    )}
                    <div>
                      <p>{model.name}</p>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

