const GOOGLE_FONTS_HOST = 'fonts.googleapis.com';

function isBlockedStylesheetNode(node: Node): node is HTMLLinkElement | HTMLStyleElement {
  if (!(node instanceof Element)) {
    return false;
  }

  if (node instanceof HTMLLinkElement) {
    return (
      node.rel === 'stylesheet' &&
      typeof node.href === 'string' &&
      node.href.includes(GOOGLE_FONTS_HOST)
    );
  }

  if (node instanceof HTMLStyleElement) {
    return node.textContent?.includes(GOOGLE_FONTS_HOST) === true;
  }

  return false;
}

function pruneBlockedStylesheets(root: ParentNode): void {
  root.querySelectorAll('link[rel="stylesheet"], style').forEach(node => {
    if (isBlockedStylesheetNode(node)) {
      node.remove();
    }
  });
}

function shouldBlockNode(node: Node): boolean {
  if (isBlockedStylesheetNode(node)) {
    return true;
  }

  if (node instanceof Element) {
    pruneBlockedStylesheets(node);
  }

  return false;
}

export function installGoogleFontStylesheetGuard(): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  pruneBlockedStylesheets(document);

  const originalAppendChild = Node.prototype.appendChild;
  const originalInsertBefore = Node.prototype.insertBefore;
  const originalReplaceChild = Node.prototype.replaceChild;
  const originalAppend = Element.prototype.append;
  const originalPrepend = Element.prototype.prepend;

  Node.prototype.appendChild = function appendChildPatched<T extends Node>(
    this: Node,
    node: T
  ): T {
    if (shouldBlockNode(node)) {
      return node;
    }
    return originalAppendChild.call(this, node) as T;
  };

  Node.prototype.insertBefore = function insertBeforePatched<T extends Node>(
    this: Node,
    node: T,
    child: Node | null
  ): T {
    if (shouldBlockNode(node)) {
      return node;
    }
    return originalInsertBefore.call(this, node, child) as T;
  };

  Node.prototype.replaceChild = function replaceChildPatched<T extends Node>(
    this: Node,
    node: Node,
    child: T
  ): T {
    if (shouldBlockNode(node)) {
      return child;
    }
    return originalReplaceChild.call(this, node, child) as T;
  };

  Element.prototype.append = function appendPatched(
    this: Element,
    ...nodes: (Node | string)[]
  ): void {
    originalAppend.apply(
      this,
      nodes.filter(node => !(node instanceof Node) || !shouldBlockNode(node))
    );
  };

  Element.prototype.prepend = function prependPatched(
    this: Element,
    ...nodes: (Node | string)[]
  ): void {
    originalPrepend.apply(
      this,
      nodes.filter(node => !(node instanceof Node) || !shouldBlockNode(node))
    );
  };

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (isBlockedStylesheetNode(node)) {
          node.remove();
          return;
        }

        if (node instanceof Element) {
          pruneBlockedStylesheets(node);
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  return () => {
    observer.disconnect();
    Node.prototype.appendChild = originalAppendChild;
    Node.prototype.insertBefore = originalInsertBefore;
    Node.prototype.replaceChild = originalReplaceChild;
    Element.prototype.append = originalAppend;
    Element.prototype.prepend = originalPrepend;
  };
}
