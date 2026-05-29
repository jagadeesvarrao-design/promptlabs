/** Replace {variable} placeholders in a template string */
export function fillTemplate(template: string, variables: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }
  return result
}

/** Extract unique variable names from {variable} placeholders */
export function extractVariables(template: string): string[] {
  const matches = template.match(/\{([^}]+)\}/g) || []
  return [...new Set(matches.map((m) => m.slice(1, -1)))]
}
