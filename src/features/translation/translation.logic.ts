export const SUPPORTED_LANGUAGES: Record<string, string> = {
  English: 'en',
  Spanish: 'es',
  French: 'fr',
  German: 'de',
  Italian: 'it',
  Portuguese: 'pt',
  Dutch: 'nl',
  Russian: 'ru',
  Japanese: 'ja',
  Chinese: 'zh',
  Korean: 'ko',
  Arabic: 'ar',
  Hindi: 'hi',
  Turkish: 'tr',
  Polish: 'pl',
  Swedish: 'sv'
}

export const mapToCode = (languageName: string): string | null => {
  const normalized = languageName.trim().toLowerCase()
  if (normalized === 'auto') return 'auto'
  
  // If it's already a valid ISO code (one of the values in SUPPORTED_LANGUAGES)
  const isSupportedCode = Object.values(SUPPORTED_LANGUAGES).includes(normalized)
  if (isSupportedCode) {
    return normalized
  }

  // Otherwise check if normalized languageName matches a key (case-insensitively)
  const matchingKey = Object.keys(SUPPORTED_LANGUAGES).find(
    (key) => key.toLowerCase() === normalized
  )
  return matchingKey ? SUPPORTED_LANGUAGES[matchingKey] : null
}

export const validateLanguage = (langName: string, isSource = false): string => {
  const code = mapToCode(langName)
  if (!code) throw new Error(`Unsupported language: ${langName}`)
  return code
}

export const validateTranslationRequest = (text: string, fromLang: string, toLang: string) => {
  if (!text || text.trim() === '') throw new Error('Text to translate cannot be empty')
  if (fromLang === toLang) throw new Error('Source and target languages must be different')
}
