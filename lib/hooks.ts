import { useContext } from 'react'
import { LanguageContext } from './language-context'

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export function useText(enKey: string, hiKey: string) {
  const { language } = useLanguage()
  return language === 'hi' ? hiKey : enKey
}
