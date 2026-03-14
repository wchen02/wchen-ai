import AudioOffsetText from "@/components/AudioOffsetText";
import { appendAudioText, createAudioTextState } from "@/lib/audio-text";
import type { Project } from "@/lib/schemas";

interface ProjectSummaryWithHighlightProps {
  project: Pick<Project, "motivation" | "problemAddressed" | "learnings">;
  motivationLabel: string;
  problemLabel: string;
  learningsLabel: string;
  highlightWithAudio?: boolean;
}

export default function ProjectSummaryWithHighlight({
  project,
  motivationLabel,
  problemLabel,
  learningsLabel,
  highlightWithAudio = false,
}: ProjectSummaryWithHighlightProps) {
  const offsetState = createAudioTextState();
  const motivationLabelRange = appendAudioText(offsetState, motivationLabel);
  appendAudioText(offsetState, " ");
  const motivationRange = appendAudioText(offsetState, project.motivation);
  appendAudioText(offsetState, " ");
  const problemLabelRange = appendAudioText(offsetState, problemLabel);
  appendAudioText(offsetState, " ");
  const problemRange = appendAudioText(offsetState, project.problemAddressed);

  let learningsLabelRange: { startOffset: number; endOffset: number } | null = null;
  let learningsRange: { startOffset: number; endOffset: number } | null = null;

  if (project.learnings) {
    appendAudioText(offsetState, " ");
    learningsLabelRange = appendAudioText(offsetState, learningsLabel);
    appendAudioText(offsetState, " ");
    learningsRange = appendAudioText(offsetState, project.learnings);
  }

  return (
    <div className="bg-gray-50 dark:bg-neutral-900 rounded-xl p-6 md:p-8 space-y-6 border border-gray-100 dark:border-gray-800">
      <section id="the-motivation">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 scroll-mt-24">
          {highlightWithAudio ? (
            <AudioOffsetText text={motivationLabel} offsetBase={motivationLabelRange.startOffset} />
          ) : (
            motivationLabel
          )}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {highlightWithAudio ? (
            <AudioOffsetText text={project.motivation} offsetBase={motivationRange.startOffset} />
          ) : (
            project.motivation
          )}
        </p>
      </section>

      <section id="the-problem">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 scroll-mt-24">
          {highlightWithAudio ? (
            <AudioOffsetText text={problemLabel} offsetBase={problemLabelRange.startOffset} />
          ) : (
            problemLabel
          )}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {highlightWithAudio ? (
            <AudioOffsetText text={project.problemAddressed} offsetBase={problemRange.startOffset} />
          ) : (
            project.problemAddressed
          )}
        </p>
      </section>

      {project.learnings && learningsLabelRange && learningsRange && (
        <section id="key-learnings">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 scroll-mt-24">
            {highlightWithAudio ? (
              <AudioOffsetText text={learningsLabel} offsetBase={learningsLabelRange.startOffset} />
            ) : (
              learningsLabel
            )}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {highlightWithAudio ? (
              <AudioOffsetText text={project.learnings} offsetBase={learningsRange.startOffset} />
            ) : (
              project.learnings
            )}
          </p>
        </section>
      )}
    </div>
  );
}
