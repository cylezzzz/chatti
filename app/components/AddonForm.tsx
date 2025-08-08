'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Addon, AddonField } from '@/app/types';
import { Upload, X, Image, Video, FileText } from 'lucide-react';

interface AddonFormProps {
  addon: Addon;
  onSubmit: (data: Record<string, any>) => void;
  isLoading?: boolean;
}

export default function AddonForm({ addon, onSubmit, isLoading }: AddonFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleFileUpload = async (file: File, fieldName: string) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const fileData = await response.json();
        handleFieldChange(fieldName, fileData.url);
        setUploadedFiles(prev => [...prev, file]);
      }
    } catch (error) {
      console.error('File upload failed:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field: AddonField) => {
    const commonProps = {
      id: field.name,
      required: field.required,
    };

    switch (field.type) {
      case 'text':
        return (
          <Input
            {...commonProps}
            type="text"
            placeholder={field.placeholder}
            value={formData[field.name] || field.defaultValue || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );
      
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            placeholder={field.placeholder}
            value={formData[field.name] || field.defaultValue || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            rows={4}
          />
        );
      
      case 'select':
        return (
          <Select 
            value={formData[field.name] || field.defaultValue || ''} 
            onValueChange={(value) => handleFieldChange(field.name, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            min={field.min}
            max={field.max}
            step={field.step}
            placeholder={field.placeholder}
            value={formData[field.name] || field.defaultValue || ''}
            onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
          />
        );
      
      case 'range':
        return (
          <div className="space-y-2">
            <Slider
              value={[formData[field.name] || field.defaultValue || field.min || 0]}
              onValueChange={([value]) => handleFieldChange(field.name, value)}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              className="w-full"
            />
            <div className="text-center text-sm text-muted-foreground">
              {formData[field.name] || field.defaultValue || field.min || 0}
            </div>
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              {...commonProps}
              checked={formData[field.name] || field.defaultValue || false}
              onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            />
            <Label htmlFor={field.name} className="text-sm">
              {field.label}
            </Label>
          </div>
        );
      
      case 'file':
        return (
          <div className="space-y-2">
            <Input
              {...commonProps}
              type="file"
              accept={field.accept}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file, field.name);
                }
              }}
              className="hidden"
            />
            <Label htmlFor={field.name}>
              <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-md cursor-pointer hover:border-muted-foreground/50 transition-colors">
                <div className="text-center">
                  {field.accept?.includes('image') && <Image className="mx-auto h-8 w-8 text-muted-foreground mb-2" />}
                  {field.accept?.includes('video') && <Video className="mx-auto h-8 w-8 text-muted-foreground mb-2" />}
                  {!field.accept?.includes('image') && !field.accept?.includes('video') && <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />}
                  <p className="text-sm text-muted-foreground">
                    {field.accept?.includes('image') && 'Bild hochladen'}
                    {field.accept?.includes('video') && 'Video hochladen'}
                    {!field.accept?.includes('image') && !field.accept?.includes('video') && `${field.accept || 'Datei'} hochladen`}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Klicken oder Datei hierher ziehen
                  </p>
                </div>
              </div>
            </Label>
            {formData[field.name] && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm truncate flex-1">
                  Datei erfolgreich hochgeladen
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFieldChange(field.name, null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {addon.name}
        </CardTitle>
        <CardDescription>
          {addon.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {addon.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              {field.type !== 'checkbox' && (
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              )}
              {renderField(field)}
              {field.description && (
                <p className="text-xs text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
          ))}
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Generate'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}