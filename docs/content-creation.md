# Content Creation

The `content:create` script loads the website-content skill guidelines and calls a configured LLM to generate site content — writing entries, project entries, or site copy — then writes the resulting files directly to the repository.

This keeps the skill's SKILL.md focused on content guidelines. The script is the consumer that knows how to load and use them.

## Usage

```bash
# Write a new writing entry
pnpm content:create --type writing --topic "Why I stopped using ORMs"

# Write a project entry with an explicit slug
pnpm content:create --type project --topic "My CLI tool" --slug my-tool

# Free-form prompt for more complex tasks
pnpm content:create --prompt "Update the English about page philosophy section to reflect a shift toward agent-native workflows"

# Locale-specific entry
pnpm content:create --type writing --topic "The cost of indirection" --locale es
```

### Options

| Option | Description |
|---|---|
| `--type` | Content type: `writing`, `project`, `homepage`, `about` |
| `--topic` | What to write about. Required when `--type` is set. |
| `--slug` | Optional slug override (for writing/project entries). |
| `--locale` | Optional locale (`en`, `es`, `zh`). Omit for the shared canonical entry. |
| `--prompt` | Free-form prompt. Use instead of `--type`/`--topic` for multi-file or non-standard tasks. |

Either `--prompt` or both `--type` and `--topic` must be provided.

## LLM Provider Configuration

Select the LLM provider and supply the matching API key via environment variables (in `.env` or the shell):

| `LLM_PROVIDER` | API key variable | Example models |
|---|---|---|
| `openai` *(default)* | `OPENAI_API_KEY` | `gpt-4o`, `o1`, `o3-mini`, `gpt-4-turbo`, … |
| `anthropic` | `ANTHROPIC_API_KEY` | `claude-opus-4-5`, `claude-sonnet-4-5`, `claude-3-5-haiku`, … |
| `google` | `GOOGLE_API_KEY` | `gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-2.5-pro`, … |
| `openai-compatible` | `LLM_API_KEY` + `LLM_BASE_URL` | Mistral, Groq, xAI Grok, Together AI, Ollama, LM Studio, … |

Set `LLM_MODEL` to override the provider's default model for any provider.

Copy the commented-out LLM block from `.env.example` into your `.env` and fill in the values you need.

## What the Script Does

1. Resolves the skill directory (`.agents/skills/website-content/`).
2. Loads `SKILL.md`, `references/voice-guide.md`, and `references/content-schemas.md` as a system prompt.
3. Sends the assembled system prompt and your user message to the configured LLM.
4. Parses `<file path="...">...</file>` blocks from the response.
5. Writes each block to the specified relative path, restricted to `content/`, `public/writing/`, and `public/projects/`. Absolute paths and `../` traversals are rejected.

## Recommended Workflow

1. Configure your LLM provider in `.env`.
2. Run `pnpm content:create` with your task.
3. Review the generated files — check frontmatter, body copy, and image paths.
4. If the output needs refinement, re-run with a more specific `--prompt`.
5. Run the site locally (`pnpm dev`) to spot-check the rendered output.
6. Commit the files normally.

## Notes

- The script writes files but does not commit them. Review the output before staging.
- For writing and project entries, the script follows the shared-entry convention. Use `--locale` or `--prompt` to create locale-specific entries.
- After creating or updating a shared writing/project entry, use the `content-translation` skill to produce locale-specific copies (see `.agents/skills/content-translation/SKILL.md`).
- Generated audio is a separate step — see [docs/audio-r2-workflow.md](./audio-r2-workflow.md).
