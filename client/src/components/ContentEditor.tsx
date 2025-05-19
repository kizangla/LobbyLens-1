import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentSection } from './GuideDetail';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, X, Image, FileText, Video, Menu, Phone } from 'lucide-react';

interface ContentEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export default function ContentEditor({ initialContent, onChange }: ContentEditorProps) {
  // Try to parse initialContent as JSON array of content sections
  const [sections, setSections] = useState<ContentSection[]>(() => {
    try {
      const parsed = JSON.parse(initialContent);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      // If not an array, create a single text section
      return [{ id: '1', type: 'text', content: initialContent }];
    } catch (error) {
      // If not valid JSON, create a single text section
      return [{ id: '1', type: 'text', content: initialContent || '' }];
    }
  });

  // Update the parent component with JSON string of sections
  const updateContent = (newSections: ContentSection[]) => {
    setSections(newSections);
    onChange(JSON.stringify(newSections));
  };

  // Add a new section
  const addSection = (type: ContentSection['type']) => {
    const newId = Date.now().toString();
    const newSection: ContentSection = {
      id: newId,
      type,
      content: '',
      title: type === 'text' ? 'New Section' : ''
    };
    updateContent([...sections, newSection]);
  };

  // Delete a section
  const deleteSection = (id: string) => {
    const newSections = sections.filter(section => section.id !== id);
    updateContent(newSections);
  };

  // Update a section's content
  const updateSection = (id: string, field: keyof ContentSection, value: string) => {
    const newSections = sections.map(section => {
      if (section.id === id) {
        return { ...section, [field]: value };
      }
      return section;
    });
    updateContent(newSections);
  };

  // Get icon for section type
  const getSectionIcon = (type: ContentSection['type']) => {
    switch (type) {
      case 'text':
        return <FileText className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'menu':
        return <Menu className="h-5 w-5" />;
      case 'contact':
        return <Phone className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="content-editor space-y-6">
      <Tabs defaultValue="visual" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="visual">Visual Editor</TabsTrigger>
          <TabsTrigger value="json">JSON Source</TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-4">
          {/* Section List */}
          {sections.map((section, index) => (
            <Card key={section.id} className="overflow-hidden border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between p-4 bg-muted/20">
                <CardTitle className="text-md flex items-center gap-2">
                  {getSectionIcon(section.type)}
                  {section.type.charAt(0).toUpperCase() + section.type.slice(1)} Section {index + 1}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteSection(section.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Title field for all section types */}
                <div className="grid w-full items-center gap-2">
                  <label htmlFor={`title-${section.id}`} className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id={`title-${section.id}`}
                    value={section.title || ''}
                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                    placeholder="Section Title (optional)"
                  />
                </div>

                {/* Content fields based on section type */}
                {section.type === 'text' && (
                  <div className="grid w-full items-center gap-2">
                    <label htmlFor={`content-${section.id}`} className="text-sm font-medium">
                      Text Content
                    </label>
                    <Textarea
                      id={`content-${section.id}`}
                      value={section.content}
                      onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                      placeholder="Enter text content here..."
                      rows={6}
                      className="resize-y"
                    />
                    <p className="text-xs text-muted-foreground">
                      HTML is supported for rich formatting.
                    </p>
                  </div>
                )}

                {section.type === 'image' && (
                  <div className="grid w-full items-center gap-4">
                    <label htmlFor={`content-${section.id}`} className="text-sm font-medium">
                      Image URL
                    </label>
                    <Input
                      id={`content-${section.id}`}
                      value={section.content}
                      onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                      placeholder="Enter image URL"
                    />
                    {section.content && (
                      <div className="mt-2 aspect-video bg-muted rounded-md overflow-hidden">
                        <img 
                          src={section.content} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Invalid+Image+URL';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {section.type === 'video' && (
                  <div className="grid w-full items-center gap-2">
                    <label htmlFor={`content-${section.id}`} className="text-sm font-medium">
                      Video URL
                    </label>
                    <Input
                      id={`content-${section.id}`}
                      value={section.content}
                      onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                      placeholder="Enter video URL"
                    />
                  </div>
                )}

                {section.type === 'menu' && (
                  <div className="grid w-full items-center gap-2">
                    <label htmlFor={`content-${section.id}`} className="text-sm font-medium">
                      Menu Content
                    </label>
                    <Textarea
                      id={`content-${section.id}`}
                      value={section.content}
                      onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                      placeholder="Enter menu content here (HTML supported)"
                      rows={8}
                      className="resize-y"
                    />
                    <p className="text-xs text-muted-foreground">
                      HTML is supported. Use &lt;ul&gt;, &lt;li&gt; for lists, and &lt;h3&gt; for headings.
                    </p>
                  </div>
                )}

                {section.type === 'contact' && (
                  <div className="grid w-full items-center gap-2">
                    <label htmlFor={`content-${section.id}`} className="text-sm font-medium">
                      Contact Information
                    </label>
                    <Textarea
                      id={`content-${section.id}`}
                      value={section.content}
                      onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                      placeholder="Enter contact details (HTML supported)"
                      rows={6}
                      className="resize-y"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Add Section Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => addSection('text')}
              className="flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Add Text
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => addSection('image')}
              className="flex items-center gap-1"
            >
              <Image className="h-4 w-4" />
              Add Image
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => addSection('video')}
              className="flex items-center gap-1"
            >
              <Video className="h-4 w-4" />
              Add Video
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => addSection('menu')}
              className="flex items-center gap-1"
            >
              <Menu className="h-4 w-4" />
              Add Menu
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => addSection('contact')}
              className="flex items-center gap-1"
            >
              <Phone className="h-4 w-4" />
              Add Contact
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="json">
          <Textarea
            value={JSON.stringify(sections, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateContent(parsed);
              } catch (error) {
                // Don't update if JSON is invalid
              }
            }}
            placeholder="JSON content"
            rows={15}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Edit the JSON directly for advanced customization.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}