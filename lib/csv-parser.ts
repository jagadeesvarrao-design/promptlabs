export interface ParsedCSV {
  data: Record<string, string>[]
  errors: string[]
  meta: {
    fields: string[]
  }
}

/**
 * A robust, PapaParse-style CSV parser that handles:
 * - Commas inside quoted strings
 * - Newlines inside quoted strings
 * - Escaped quotes ("" inside "")
 */
export function parseCSV(csvText: string): ParsedCSV {
  const result: ParsedCSV = {
    data: [],
    errors: [],
    meta: { fields: [] },
  }

  if (!csvText.trim()) return result

  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false

  // Normalize newlines to \n to handle \r\n (Windows) properly
  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        currentField += '"'
        i++ // Skip the next quote
      } else if (char === '"') {
        // End of quoted string
        inQuotes = false
      } else {
        // Inside quotes, literal character (including commas and newlines)
        currentField += char
      }
    } else {
      if (char === '"') {
        // Start of quoted string
        inQuotes = true
      } else if (char === ',') {
        // End of field
        currentRow.push(currentField)
        currentField = ''
      } else if (char === '\n') {
        // End of row
        currentRow.push(currentField)
        rows.push(currentRow)
        currentRow = []
        currentField = ''
      } else {
        // Normal character
        currentField += char
      }
    }
  }

  // Push the last field and row if the file didn't end with a newline
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField)
    rows.push(currentRow)
  }

  // Filter out completely empty rows (like trailing newlines)
  const validRows = rows.filter((row) => row.some((field) => field.trim() !== ''))

  if (validRows.length === 0) return result

  // Extract headers
  const headers = validRows[0].map((h) => h.trim())
  result.meta.fields = headers

  // Extract data rows mapping to headers
  for (let i = 1; i < validRows.length; i++) {
    const row = validRows[i]
    const rowData: Record<string, string> = {}
    let hasData = false

    headers.forEach((header, index) => {
      const val = row[index] !== undefined ? row[index] : ''
      rowData[header] = val
      if (val.trim() !== '') hasData = true
    })

    if (hasData) {
      result.data.push(rowData)
    }
  }

  return result
}
