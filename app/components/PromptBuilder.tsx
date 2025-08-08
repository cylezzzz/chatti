'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectItem } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

type Field =
  | { label: string; type: 'text' | 'textarea'; key: string; placeholder?: string }
  | { label: string; type: 'select'; key: string; options: string[] }
  | { label: string; type: 'slider'; key: string; min: number; max: number; default?: number }

type PromptConfig = {
  title: string
  fields: Field[]
}

type Props = {
  jsonPath: string
  onPromptGenerated: (prompt: string) => void
}

export default function PromptBuilder({ jsonPath, onPromptGenerated }: Props) {
  const [config, setConfig] = useState<PromptConfig | null>(null)
  const [values, setValues] = useState<Record<string, any>>({})

  useEffect(() => {
    fetch(jsonPath)
      .then(res => res.json())
      .then(setConfig)
  }, [jsonPath])

  const update = (key: string, value: any) => {
    setValues(prev => ({ ...prev, [key]: value }))
  }

  const generatePrompt = () => {
    const parts = config?.fields.map(field => `${field.label}: ${values[field.key]}`) || []
    const fullPrompt = parts.join(', ')
    onPromptGenerated(fullPrompt)
  }

  if (!config) return null

  return (
    <div className="p-4 border rounded-xl bg-gray-950 mb-4">
      <h2 className="text-lg font-semibold mb-2">{config.title}</h2>

      {config.fields.map(field => (
        <div key={field.key} className="mb-3">
          <label className="block text-sm font-medium mb-1">{field.label}</label>

          {field.type === 'text' && (
            <Input
              placeholder={field.placeholder}
              onChange={e => update(field.key, e.target.value)}
            />
          )}

          {field.type === 'textarea' && (
            <Textarea
              placeholder={field.placeholder}
              onChange={e => update(field.key, e.target.value)}
            />
          )}

          {field.type === 'select' && (
            <Select onValueChange={value => update(field.key, value)}>
              {field.options.map(opt => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </Select>
          )}

          {field.type === 'slider' && (
            <Slider
              min={field.min}
              max={field.max}
              defaultValue={[field.default || field.min]}
              onValueChange={([val]) => update(field.key, val)}
            />
          )}
        </div>
      ))}

      <Button onClick={generatePrompt}>Prompt absenden</Button>
    </div>
  )
}
