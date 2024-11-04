import { nextTestSetup } from 'e2e-utils'
import { getRedboxSource, waitForAndOpenRuntimeError } from 'next-test-utils'

async function getStackFramesContent(browser) {
  const stackFrameElements = await browser.elementsByCss(
    '[data-nextjs-call-stack-frame]'
  )
  const stackFramesContent = (
    await Promise.all(
      stackFrameElements.map(async (frame) => {
        const functionNameEl = await frame.$('[data-nextjs-frame-expanded]')
        const sourceEl = await frame.$('[data-has-source]')
        const functionName = functionNameEl
          ? await functionNameEl.innerText()
          : ''
        const source = sourceEl ? await sourceEl.innerText() : ''

        if (!functionName) {
          return ''
        }
        return `at ${functionName} (${source})`
      })
    )
  )
    .filter(Boolean)
    .join('\n')

  return stackFramesContent
}

describe('owner-stack-react-missing-key-prop', () => {
  const { next } = nextTestSetup({
    files: __dirname,
  })

  it('should catch invalid element from on rsc component', async () => {
    const browser = await next.browser('/rsc')
    await waitForAndOpenRuntimeError(browser)

    const stackFramesContent = await getStackFramesContent(browser)
    const source = await getRedboxSource(browser)

    if (process.env.TURBOPACK) {
      expect(stackFramesContent).toMatchInlineSnapshot(
        `"at Page (app/rsc/page.tsx (6:13))"`
      )
      expect(source).toMatchInlineSnapshot(`
        "app/rsc/page.tsx (7:9) @ <anonymous>

           5 |     <div>
           6 |       {list.map((item, index) => (
        >  7 |         <span>{item}</span>
             |         ^
           8 |       ))}
           9 |     </div>
          10 |   )"
      `)
    } else {
      expect(stackFramesContent).toMatchInlineSnapshot(
        `"at map (app/rsc/page.tsx (6:13))"`
      )
      expect(source).toMatchInlineSnapshot(`
        "app/rsc/page.tsx (7:10) @ span

           5 |     <div>
           6 |       {list.map((item, index) => (
        >  7 |         <span>{item}</span>
             |          ^
           8 |       ))}
           9 |     </div>
          10 |   )"
      `)
    }
  })

  it('should catch invalid element from on ssr client component', async () => {
    const browser = await next.browser('/ssr')
    await waitForAndOpenRuntimeError(browser)

    const stackFramesContent = await getStackFramesContent(browser)
    const source = await getRedboxSource(browser)
    if (process.env.TURBOPACK) {
      expect(stackFramesContent).toMatchInlineSnapshot(
        `"at Page (app/ssr/page.tsx (8:13))"`
      )
      expect(source).toMatchInlineSnapshot(`
        "app/ssr/page.tsx (9:9) @ <unknown>

           7 |     <div>
           8 |       {list.map((item, index) => (
        >  9 |         <p>{item}</p>
             |         ^
          10 |       ))}
          11 |     </div>
          12 |   )"
      `)
    } else {
      expect(stackFramesContent).toMatchInlineSnapshot(
        `"at map (app/ssr/page.tsx (8:13))"`
      )
      expect(source).toMatchInlineSnapshot(`
        "app/ssr/page.tsx (9:10) @ p

           7 |     <div>
           8 |       {list.map((item, index) => (
        >  9 |         <p>{item}</p>
             |          ^
          10 |       ))}
          11 |     </div>
          12 |   )"
      `)
    }
  })
})
