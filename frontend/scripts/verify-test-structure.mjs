/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const srcDir = path.join(projectRoot, 'src')
const integrationDir = path.join(srcDir, '__tests__', 'integration') + path.sep

function walkDirectory(startDir) {
  const files = []
  const stack = [startDir]
  while (stack.length) {
    const current = stack.pop()
    if (!current) continue
    const stat = fs.statSync(current)
    if (stat.isDirectory()) {
      const entries = fs.readdirSync(current)
      for (const entry of entries) {
        stack.push(path.join(current, entry))
      }
    } else {
      files.push(current)
    }
  }
  return files
}

function isAnyTestFile(filePath) {
  return /\.(test|spec)\.(t|j)sx?$/.test(filePath)
}

function isIntegrationTestFile(filePath) {
  return /\.integration\.test\.(t|j)sx?$/.test(filePath)
}

function main() {
  if (!fs.existsSync(srcDir)) {
    console.log('No src directory found, skipping verification.')
    return
  }

  const allFiles = walkDirectory(srcDir)
  const errors = []

  for (const file of allFiles) {
    const normalized = file

    if (isIntegrationTestFile(normalized)) {
      if (!normalized.startsWith(integrationDir)) {
        errors.push(
          `Integration test outside integration dir: ${path.relative(projectRoot, normalized)}`,
        )
      }
    }

    if (normalized.startsWith(integrationDir) && isAnyTestFile(normalized)) {
      if (!isIntegrationTestFile(normalized)) {
        errors.push(
          `Test in integration dir must be suffixed .integration.test.*: ${path.relative(
            projectRoot,
            normalized,
          )}`,
        )
      }
    }
  }

  if (errors.length > 0) {
    console.error('\nTest structure violations found:')
    for (const e of errors) console.error(`- ${e}`)
    console.error('\nFix the above issues to satisfy the test structure policy.')
    process.exit(1)
  } else {
    console.log('Test structure verified: OK')
  }
}

main()


