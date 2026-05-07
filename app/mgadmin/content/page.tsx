'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/hooks'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronDown } from 'lucide-react'

const contentSections = [
  { id: 'hero', enLabel: 'Hero Section', hiLabel: 'हीरो सेक्शन' },
  { id: 'services', enLabel: 'Services', hiLabel: 'सेवाएं' },
  { id: 'about', enLabel: 'About Us', hiLabel: 'हमारे बारे में' },
  { id: 'contact', enLabel: 'Contact Info', hiLabel: 'संपर्क जानकारी' },
]

export default function AdminContentPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [selectedSection, setSelectedSection] = useState('hero')
  const [content, setContent] = useState({
    en: '',
    hi: '',
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const employeeData = sessionStorage.getItem('employeeData');
    if (employeeData) {
      router.push('/mgadmin');
    }
  }, [router]);

  const handleSave = () => {
    // In a real app, this would save to Firebase
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--primary)' }}>
          Content Editor
        </h1>
        <p className="text-muted-foreground text-sm lg:text-base">Edit bilingual content</p>
      </div>

      {/* Mobile Section Selector */}
      <div className="block lg:hidden">
        <label className="block text-sm font-medium mb-2">Select Section</label>
        <Select value={selectedSection} onValueChange={setSelectedSection}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {contentSections.map((section) => (
              <SelectItem key={section.id} value={section.id}>
                {language === 'hi' ? section.hiLabel : section.enLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Desktop Section Selector */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground/70 mb-3">Sections</h3>
            {contentSections.map((section) => (
              <Button
                key={section.id}
                variant={selectedSection === section.id ? 'default' : 'outline'}
                className="w-full justify-start text-sm"
                onClick={() => setSelectedSection(section.id)}
              >
                {language === 'hi' ? section.hiLabel : section.enLabel}
              </Button>
            ))}
          </div>
        </div>

        {/* Content Editor */}
        <div className="lg:col-span-3">
          <Card className="p-4 lg:p-6 space-y-4 lg:space-y-6">
            <div className="border-b pb-4">
              <h2 className="text-lg lg:text-xl font-semibold text-primary mb-1">
                {contentSections.find(s => s.id === selectedSection)?.[language === 'hi' ? 'hiLabel' : 'enLabel']}
              </h2>
              <p className="text-sm text-foreground/70">Edit content for both English and Hindi</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">English Content</label>
                <Textarea
                  placeholder="Enter English content..."
                  value={content.en}
                  onChange={(e) => setContent({ ...content, en: e.target.value })}
                  className="min-h-32 lg:min-h-48 text-sm lg:text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">हिंदी Content</label>
                <Textarea
                  placeholder="हिंदी सामग्री दर्ज करें..."
                  value={content.hi}
                  onChange={(e) => setContent({ ...content, hi: e.target.value })}
                  className="min-h-32 lg:min-h-48 text-sm lg:text-base"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
              {saved && (
                <p className="text-green-600 text-sm flex items-center gap-2">
                  ✓ Saved successfully
                </p>
              )}
              <Button
                onClick={handleSave}
                className="w-full sm:w-auto"
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
