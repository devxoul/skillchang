import { describe, expect, it, mock } from 'bun:test'
import { fireEvent, render, waitFor } from '@testing-library/react'
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/ui/dialog'

describe('Dialog', () => {
  it('renders convenience component with trigger', () => {
    const { getByRole } = render(
      <Dialog trigger="Open" title="Test Title" description="Test Description">
        <p>Content</p>
      </Dialog>,
    )

    expect(getByRole('button', { name: 'Open' })).toBeInTheDocument()
  })

  it('opens dialog when trigger is clicked', async () => {
    const { getByRole, getByText } = render(
      <Dialog trigger="Open" title="Test Title" description="Test Description">
        <p>Dialog Content</p>
      </Dialog>,
    )

    fireEvent.click(getByRole('button', { name: 'Open' }))

    await waitFor(() => {
      expect(getByRole('dialog')).toBeInTheDocument()
    })
    expect(getByText('Test Title')).toBeInTheDocument()
    expect(getByText('Test Description')).toBeInTheDocument()
    expect(getByText('Dialog Content')).toBeInTheDocument()
  })

  it('renders using composition pattern', async () => {
    const { getByRole, getByText } = render(
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

    expect(getByRole('button', { name: 'Open Dialog' })).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'Open Dialog' }))

    await waitFor(() => {
      expect(getByRole('dialog')).toBeInTheDocument()
    })
    expect(getByText('Composed Title')).toBeInTheDocument()
  })

  it('closes dialog when close button is clicked', async () => {
    const { getByRole, queryByRole } = render(
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

    fireEvent.click(getByRole('button', { name: 'Open' }))

    await waitFor(() => {
      expect(getByRole('dialog')).toBeInTheDocument()
    })

    fireEvent.click(getByRole('button', { name: 'Close' }))

    await waitFor(() => {
      expect(queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('supports controlled open state', () => {
    const onOpenChange = mock((_open: boolean) => {})

    const { getByRole } = render(
      <Dialog open={false} onOpenChange={onOpenChange} trigger="Open" title="Controlled">
        <p>Content</p>
      </Dialog>,
    )

    fireEvent.click(getByRole('button', { name: 'Open' }))
    expect(onOpenChange).toHaveBeenCalled()
    expect(onOpenChange.mock.calls[0][0]).toBe(true)
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
