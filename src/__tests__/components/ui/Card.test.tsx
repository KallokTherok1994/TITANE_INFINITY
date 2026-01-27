/**
 * Tests pour Card Component
 * Coverage: Structure, Header, Footer, Content
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card Component', () => {
  describe('Rendering', () => {
    it('should render card with content', () => {
      render(
        <Card>
          <CardContent>Card content</CardContent>
        </Card>
      );
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render card with header', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description')).toBeInTheDocument();
    });

    it('should render card with footer', () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      );
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('should render complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Main content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  describe('Styles', () => {
    it('should apply custom className to Card', () => {
      const { container } = render(
        <Card className="custom-card">Content</Card>
      );
      expect(container.firstChild).toHaveClass('custom-card');
    });

    it('should apply custom className to CardHeader', () => {
      const { container } = render(
        <CardHeader className="custom-header">Header</CardHeader>
      );
      expect(container.firstChild).toHaveClass('custom-header');
    });
  });

  describe('Snapshot', () => {
    it('should match snapshot', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Snapshot Title</CardTitle>
          </CardHeader>
          <CardContent>Snapshot Content</CardContent>
        </Card>
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
