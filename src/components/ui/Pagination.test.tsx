import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '@/test/test-utils';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('shows the visible range and the page count', () => {
    render(<Pagination page={2} pageSize={10} total={25} onPageChange={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Showing 11\u201320 of 25 \u00b7 Page 2 of 3',
    );
  });

  it('clamps the end of the range on the last page', () => {
    render(<Pagination page={3} pageSize={10} total={25} onPageChange={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 21\u201325 of 25');
  });

  it('handles an empty result set', () => {
    render(<Pagination page={1} pageSize={10} total={0} onPageChange={() => {}} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Showing 0\u20130 of 0 \u00b7 Page 1 of 1',
    );
  });

  it('disables Previous on the first page', () => {
    render(<Pagination page={1} pageSize={10} total={25} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('disables Next on the last page', () => {
    render(<Pagination page={3} pageSize={10} total={25} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
  });

  it('requests the next and previous pages', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={2} pageSize={10} total={25} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);

    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });

  it('is a labelled navigation landmark with no accessibility violations', async () => {
    const { container } = render(
      <Pagination page={2} pageSize={10} total={25} onPageChange={() => {}} />,
    );
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
