import { appendAudioText, createAudioTextState } from "./audio-text";

interface HastNode {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const SKIP_TAGS = new Set(["pre", "script", "style"]);

function shouldSkip(ancestors: HastNode[]): boolean {
  return ancestors.some((node) => node.type === "element" && node.tagName && SKIP_TAGS.has(node.tagName));
}

function wrapTextNode(node: HastNode, state = createAudioTextState()): HastNode[] {
  if (!node.value) return [];
  const wrapped: HastNode[] = [];
  for (const char of node.value) {
    const { startOffset, endOffset } = appendAudioText(state, char);
    if (endOffset <= startOffset) continue;
    wrapped.push({
      type: "element",
      tagName: "span",
      properties: {
        "data-audio-start-offset": String(startOffset),
        "data-audio-end-offset": String(endOffset),
      },
      children: [{ type: "text", value: char }],
    });
  }
  return wrapped;
}

function annotateNode(node: HastNode, ancestors: HastNode[], state: ReturnType<typeof createAudioTextState>) {
  if (!node.children?.length) return;
  const nextAncestors = node.type === "element" ? [...ancestors, node] : ancestors;
  const nextChildren: HastNode[] = [];
  for (const child of node.children) {
    if (child.type === "text") {
      if (shouldSkip(nextAncestors)) {
        nextChildren.push(child);
        continue;
      }
      nextChildren.push(...wrapTextNode(child, state));
      continue;
    }
    annotateNode(child, nextAncestors, state);
    nextChildren.push(child);
  }
  node.children = nextChildren;
}

export function rehypeAudioOffsets() {
  return function transform(tree: HastNode) {
    annotateNode(tree, [], createAudioTextState());
  };
}
