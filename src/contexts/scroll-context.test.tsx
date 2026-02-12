import { describe, expect, it } from 'bun:test'
import { render } from '@testing-library/react'
import { ScrollRestorationProvider, useScrollRestorationContext } from '@/contexts/scroll-context'

describe('ScrollRestorationContext', () => {
  it('provides scroll restoration context to children', () => {
    let contextValue: ReturnType<typeof useScrollRestorationContext> | undefined

    function TestComponent() {
      contextValue = useScrollRestorationContext()
      return <div>Test</div>
    }

    render(
      <ScrollRestorationProvider>
        <TestComponent />
      </ScrollRestorationProvider>,
    )

    expect(contextValue).toBeDefined()
    expect(typeof contextValue?.saveScrollPosition).toBe('function')
    expect(typeof contextValue?.getScrollPosition).toBe('function')
    expect(typeof contextValue?.clearScrollPosition).toBe('function')
  })

  it('throws error when useScrollRestorationContext is used outside provider', () => {
    function TestComponent() {
      useScrollRestorationContext()
      return <div>Test</div>
    }

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useScrollRestorationContext must be used within ScrollRestorationProvider')
  })

  it('saves and retrieves scroll position', () => {
    let contextValue: ReturnType<typeof useScrollRestorationContext> | undefined

    function TestComponent() {
      contextValue = useScrollRestorationContext()
      return <div>Test</div>
    }

    render(
      <ScrollRestorationProvider>
        <TestComponent />
      </ScrollRestorationProvider>,
    )

    contextValue?.saveScrollPosition('/test', 100)
    expect(contextValue?.getScrollPosition('/test')).toBe(100)
  })

  it('clears scroll position', () => {
    let contextValue: ReturnType<typeof useScrollRestorationContext> | undefined

    function TestComponent() {
      contextValue = useScrollRestorationContext()
      return <div>Test</div>
    }

    render(
      <ScrollRestorationProvider>
        <TestComponent />
      </ScrollRestorationProvider>,
    )

    contextValue?.saveScrollPosition('/test', 100)
    expect(contextValue?.getScrollPosition('/test')).toBe(100)

    contextValue?.clearScrollPosition('/test')
    expect(contextValue?.getScrollPosition('/test')).toBeUndefined()
  })

  it('stores multiple scroll positions', () => {
    let contextValue: ReturnType<typeof useScrollRestorationContext> | undefined

    function TestComponent() {
      contextValue = useScrollRestorationContext()
      return <div>Test</div>
    }

    render(
      <ScrollRestorationProvider>
        <TestComponent />
      </ScrollRestorationProvider>,
    )

    contextValue?.saveScrollPosition('/page1', 100)
    contextValue?.saveScrollPosition('/page2', 200)
    contextValue?.saveScrollPosition('/page3', 300)

    expect(contextValue?.getScrollPosition('/page1')).toBe(100)
    expect(contextValue?.getScrollPosition('/page2')).toBe(200)
    expect(contextValue?.getScrollPosition('/page3')).toBe(300)
  })
})
