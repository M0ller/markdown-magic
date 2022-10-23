const fs = require('fs')
const path = require('path')
const { test } = require('uvu') 
const assert = require('uvu/assert')
const { markdownMagic } = require('../lib')
const {
  FIXTURE_DIR,
  MARKDOWN_FIXTURE_DIR,
  OUTPUT_DIR
} = require('./config')

/**
 * Test Built in transforms
 */
test('<!-- AUTO-GENERATED-CONTENT:START (CODE)-->', async () => {
  const fileName = 'transform-code.md'
  const filePath = path.join(MARKDOWN_FIXTURE_DIR, fileName)
  const newFilePath = path.join(OUTPUT_DIR, fileName)

  const api = await markdownMagic(filePath, {
    open: 'AUTO-GENERATED-CONTENT:START',
    close: 'AUTO-GENERATED-CONTENT:END',
    outputDir: OUTPUT_DIR 
  })
  // console.log('api', api)

  const newContent = fs.readFileSync(newFilePath, 'utf8')
  // console.log('newContent', newContent)

  // check local code
  const localCode = newContent.match(/module\.exports\.run/g)
  assert.ok(localCode, 'local code snippet inserted')
  assert.is(localCode.length, 2, 'correct amount localCode')

  // check local code with range lines
  const ranges = newContent.match(/```js\n  const baz = 'foobar'\n  console\.log\(`Hello \${baz}`\)\n```/g)
  assert.ok(ranges, 'local code snippet with range lines inserted')
  assert.is(ranges.length, 2, 'correct amount ranges')
  
  // check remotely fetched code
  const remote = newContent.match(/require\('markdown-magic'\)/g)
  assert.ok(remote, 'remote code snippet inserted')
  assert.is(remote.length, 2, 'correct amount remote')

  // check remotely fetched code with range lines
  const remoteWithRange = newContent.match(/```json\n  "private": true,\n  "version": "1.0.0",\n```/g)
  console.log('remoteWithRange', remoteWithRange)
  assert.ok(remoteWithRange, 'remote code snippet with range lines inserted')
  assert.is(remoteWithRange.length, 2, 'correct amount remoteWithRange')

})

test.only('<!-- AUTO-GENERATED-CONTENT:START (FILE)-->', async () => {
  const fileName = 'transform-file.md'
  const filePath = path.join(MARKDOWN_FIXTURE_DIR, fileName)
  const newFilePath = path.join(OUTPUT_DIR, fileName)

  const api = await markdownMagic(filePath, {
    open: 'AUTO-GENERATED-CONTENT:START',
    close: 'AUTO-GENERATED-CONTENT:END',
    outputDir: OUTPUT_DIR 
  })
  console.log('api', api)

  const newContent = fs.readFileSync(newFilePath, 'utf8')
  // check local code
  assert.ok(newContent.match(/module\.exports\.run/), 'local code snippet inserted')
  // check local code with range lines
  const matches = newContent.match(/const baz = 'foobar'/g)
  assert.ok(matches, 'local code snippet with range lines inserted')
  assert.is(matches.length, 4, 'Inserted correct amount')

})

test('<!-- AUTO-GENERATED-CONTENT:START wordCount -->', async () => {
  const fileName = 'transform-wordCount.md'
  const filePath = path.join(MARKDOWN_FIXTURE_DIR, fileName)
  const newFilePath = path.join(OUTPUT_DIR, fileName)

  await markdownMagic(filePath, {
    open: 'AUTO-GENERATED-CONTENT:START',
    close: 'AUTO-GENERATED-CONTENT:END',
    outputDir: OUTPUT_DIR 
  })

  const newContent = fs.readFileSync(newFilePath, 'utf8')
  assert.ok(newContent.match(/41/), 'Count added')
})

test('<!-- AUTO-GENERATED-CONTENT:START remote -->', async () => {
  const fileName = 'transform-remote.md'
  const filePath = path.join(MARKDOWN_FIXTURE_DIR, fileName)
  const newFilePath = path.join(OUTPUT_DIR, fileName)

  const api = await markdownMagic(filePath, {
    open: 'doc-gen',
    close: 'end-doc-gen',
    outputDir: OUTPUT_DIR 
  })
  // console.log('api', api)

  const newContent = fs.readFileSync(newFilePath, 'utf8')
  assert.ok(newContent.match(/Markdown Magic/), 'word "Markdown Magic" not found in remote block')
  assert.ok(newContent.match(/Because analytics has a large number of packages/), 'word "Markdown Magic" not found in remote block')
})

test('Verify single line comments remain inline', async () => {
  const fileName = 'format-inline.md'
  const filePath = path.join(MARKDOWN_FIXTURE_DIR, fileName)
  const config = { 
    outputDir: OUTPUT_DIR,
    open: 'AUTO-GENERATED-CONTENT:START',
    close: 'AUTO-GENERATED-CONTENT:END',
    transforms: {
      INLINE() {
        return `inlinecontent`
      },
      OTHER() {
        return `other-content`
      }
    }
  }
  await markdownMagic(filePath, config)
  const newFilePath = path.join(OUTPUT_DIR, fileName)
  const newContent = fs.readFileSync(newFilePath, 'utf8')
  assert.equal(newContent.match(/inlinecontent/gim).length, 2)
  assert.equal(newContent.match(/other-content/gim).length, 1)
})

test('Mixed transforms <!-- AUTO-GENERATED-CONTENT:START wordCount -->', async () => {
  const fileName = 'mixed.md'
  const filePath = path.join(MARKDOWN_FIXTURE_DIR, fileName)

  const { data } = await markdownMagic(filePath, {
    open: 'docs-start',
    close: 'docs-end',
    outputDir: OUTPUT_DIR 
  })

  assert.ok(data, 'Mixed match words dont time out')
})

test.run()