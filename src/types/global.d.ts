/**
 * TITANE∞ v26.2.0 — Global Type Definitions
 * © 2025 Humain Total / Kevin Thibault. All rights reserved.
 */

/**
 * React 19 Migration: Fix JSX.Element namespace
 * React 19 moved JSX types from global.JSX to React.JSX
 * This declaration ensures backward compatibility
 */
declare global {
  namespace JSX {
    type Element = React.JSX.Element;
    type IntrinsicElements = React.JSX.IntrinsicElements;
    type ElementType = React.JSX.ElementType;
    type ElementClass = React.JSX.ElementClass;
    type ElementAttributesProperty = React.JSX.ElementAttributesProperty;
    type ElementChildrenAttribute = React.JSX.ElementChildrenAttribute;
    type IntrinsicAttributes = React.JSX.IntrinsicAttributes;
    type IntrinsicClassAttributes<T> = React.JSX.IntrinsicClassAttributes<T>;
  }
}

export {};
