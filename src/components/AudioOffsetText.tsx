import { appendAudioText, createAudioTextState } from "@/lib/audio-text";

export default function AudioOffsetText({ text, offsetBase }: { text: string; offsetBase: number }) {
  const state = createAudioTextState();

  return (
    <>
      {Array.from(text).map((char, index) => {
        const { startOffset, endOffset } = appendAudioText(state, char);
        if (endOffset <= startOffset) {
          return <span key={`plain-${offsetBase}-${index}`}>{char}</span>;
        }

        return (
          <span
            key={`audio-${offsetBase + startOffset}-${index}`}
            data-audio-start-offset={offsetBase + startOffset}
            data-audio-end-offset={offsetBase + endOffset}
          >
            {char}
          </span>
        );
      })}
    </>
  );
}
