import baseOptions from '../../tsup.config'
import { defineConfig } from 'tsup'

export default defineConfig({
  ...baseOptions,
  entry: ['./index.ts'],
})
