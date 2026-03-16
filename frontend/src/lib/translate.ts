/**
 * Translation helper: returns the English or default (French) field value.
 */
export function translate(item: any, field: string, lang: 'fr' | 'en'): string {
    if (!item) return ''
    if (lang === 'en') {
        return item[`${field}_en`] || item[field]
    }
    return item[field]
}
