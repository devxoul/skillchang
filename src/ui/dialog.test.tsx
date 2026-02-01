import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  Dialog,
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogBackdrop,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/ui/dialog'

describe('Dialog', () => {
  it('renders convenience component with trigger', () => {
    render(
      <Dialog trigger="Open" title="Test Title" description="Test Description">
        <p>Content</p>
      </Dialog>,
    )

    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
  })

  it('opens dialog when trigger is clicked', async () => {
    render(
      <Dialog trigger="Open" title="Test Title" description="Test Description">
        <p>Dialog Content</p>
      </Dialog>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open' }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('Dialog Content')).toBeInTheDocument()
  })

  it('renders using composition pattern', async () => {
    render(
      <DialogRoot>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogPortal>
          <DialogBackdrop />
          <DialogContent>
            <DialogTitle>Composed Title</DialogTitle>
            <DialogDescription>Composed Description</DialogDescription>
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>,
    )

    expect(screen.getByRole('button', { name: 'Open Dialog' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Open Dialog' }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
    expect(screen.getByText('Composed Title')).toBeInTheDocument()
  })

  it('closes dialog when close button is clicked', async () => {
    render(
      <DialogRoot>
        <DialogTrigger>Open</DialogTrigger>
        <DialogPortal>
          <DialogBackdrop />
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogClose>Close</DialogClose>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open' }))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('supports controlled open state', () => {
    const onOpenChange = vi.fn()

    render(
      <Dialog open={false} onOpenChange={onOpenChange} trigger="Open" title="Controlled">
        <p>Content</p>
      </Dialog>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    expect(onOpenChange).toHaveBeenCalled()
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(true)
  })

  it('applies custom className to dialog components', () => {
    render(
      <DialogRoot defaultOpen>
        <DialogPortal>
          <DialogBackdrop className="custom-backdrop" />
          <DialogContent className="custom-content">
            <DialogTitle className="custom-title">Title</DialogTitle>
            <DialogDescription className="custom-description">Desc</DialogDescription>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>,
    )

    expect(document.querySelector('.custom-backdrop')).toBeInTheDocument()
    expect(document.querySelector('.custom-content')).toBeInTheDocument()
    expect(document.querySelector('.custom-title')).toBeInTheDocument()
    expect(document.querySelector('.custom-description')).toBeInTheDocument()
  })
})
