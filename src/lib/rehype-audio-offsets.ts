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

const DEFAULT_BODY_START_OFFSET = 0;

function wrapTextNode(
  node: HastNode,
  state = createAudioTextState(),
  bodyStartOffset = DEFAULT_BODY_START_OFFSET
): HastNode[] {
  if (node == null || !node.value) return [];
  const wrapped: HastNode[] = [];
  for (const char of node.value) {
    const { startOffset, endOffset } = appendAudioText(state, char);
    if (endOffset <= startOffset) continue;
    wrapped.push({
      type: "element",
      tagName: "span",
      properties: {
        "data-audio-start-offset": String(bodyStartOffset + startOffset),
        "data-audio-end-offset": String(bodyStartOffset + endOffset),
      },
      children: [{ type: "text", value: char }],
    });
  }
  return wrapped;
}

function annotateNode(
  node: HastNode,
  ancestors: HastNode[],
  state: ReturnType<typeof createAudioTextState>,
  bodyStartOffset: number
) {
  if (!node.children?.length) return;
  const nextAncestors = node.type === "element" ? [...ancestors, node] : ancestors;
  const nextChildren: HastNode[] = [];
  for (const child of node.children) {
    if (child == null) continue;
    if (child.type === "text") {
      if (shouldSkip(nextAncestors)) {
        nextChildren.push(child);
        continue;
      }
      nextChildren.push(...wrapTextNode(child, state, bodyStartOffset));
      continue;
    }
    annotateNode(child, nextAncestors, state, bodyStartOffset);
    nextChildren.push(child);
  }
  node.children = nextChildren;
}

export interface RehypeAudioOffsetsOptions {
  /** When set (e.g. for project pages), body content is not first in the audio; add this to span offsets. */
  bodyStartOffset?: number;
}

export function rehypeAudioOffsets(options: RehypeAudioOffsetsOptions = {}) {
  const bodyStartOffset = options.bodyStartOffset ?? DEFAULT_BODY_START_OFFSET;
  return function transform(tree: HastNode) {
    if (tree == null) return;
    annotateNode(tree, [], createAudioTextState(), bodyStartOffset);
  };
}
