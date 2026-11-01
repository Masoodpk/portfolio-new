"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  onError: (error: unknown) => void;
};

/**
 * Contains any WebGL / model-loading failure to the 3D stage so the rest
 * of the page keeps working. The parent swaps in the static poster.
 */
export class SceneErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
