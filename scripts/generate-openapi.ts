import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { generateDocument } from '../src/lib/openapi'

const doc = generateDocument()
const outputPath = resolve(__dirname, '../docs/openapi.json')

writeFileSync(outputPath, JSON.stringify(doc, null, 2) + '\n')
console.log(`OpenAPI spec written to ${outputPath}`)
