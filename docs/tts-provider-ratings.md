# TTS provider ratings (build-time audio for writing/projects)

Rough comparison for **static-first**: pre-generate audio at build for writing and project pages (en, es, zh; ~75 items; ~500–2000 words each). Criteria: quality/engagement, cost at scale, API ease in Node/CI, language support, and handling of long text.

---

## Summary table

| Provider        | Quality (1–5) | Cost (build) | API ease | Languages | Long text | Best for              |
|----------------|---------------|--------------|----------|-----------|-----------|------------------------|
| **ElevenLabs** | 5             | High         | Easy     | 70+       | Chunk     | Premium, engaging     |
| **OpenAI TTS** | 4             | Medium       | Easy     | 57        | 4096/req  | Balance quality/cost  |
| **Google Cloud** | 4           | Medium       | Medium   | 40+       | Chunk     | Enterprise, i18n      |
| **Amazon Polly** | 3–4         | Low–medium   | Medium   | 30+       | Chunk     | Cost-sensitive, AWS   |
| **Edge TTS**   | 3             | Free         | Easy     | 40+       | Chunk     | Zero budget, good i18n|
| **Azure TTS**  | 4             | Medium       | Medium   | 140+      | Chunk     | Max language coverage |

---

## 1. ElevenLabs

- **Quality:** 5. Consistently top in blind tests; most natural prosody and expressiveness. Best for “engaging” long-form listening.
- **Pricing:** High. ~\$206/1M characters (Multilingual v2); free tier ~10k chars/month. For ~75 articles × ~1200 words × ~6 chars/word ≈ 540k chars → paid tier; add es/zh and you’re in the hundreds of dollars per full rebuild unless you limit to a subset.
- **API:** REST; straightforward. Node SDK available. Chunk long text and concatenate audio.
- **Languages:** 70+ including en, es, zh.
- **Long text:** No single-request limit that blocks you; chunk by paragraph/sentence and merge.

**Verdict:** Best engagement; use if quality is the priority and budget allows.

---

## 2. OpenAI TTS (tts-1 / tts-1-hd)

- **Quality:** 4. Natural, clear; a notch below ElevenLabs for expressiveness but very good for articles.
- **Pricing:** tts-1 \$15/1M chars, tts-1-hd \$30/1M. Same ~540k chars ≈ \$8–16 per full rebuild (one locale); ×3 locales ≈ \$25–50. Affordable for a static site.
- **API:** Simple REST; 4096 **characters per request**. Must chunk (e.g. by paragraph), then concatenate MP3s (e.g. ffmpeg or a small script). Well documented; Node-friendly.
- **Languages:** 57 including en, es, zh.
- **Long text:** Required: split into ≤4096-char segments, request each, stitch audio.

**Verdict:** Best balance of quality and cost for your scale; small extra work for chunking.

---

## 3. Google Cloud Text-to-Speech

- **Quality:** 4 with WaveNet/Neural2; Studio is higher quality but much more expensive.
- **Pricing:** Standard \$4/1M chars, WaveNet \$16/1M. Free tier: 1M WaveNet chars/month. Full rebuild ~540k × 3 locales ≈ 1.6M chars → about \$26 with WaveNet after free tier.
- **API:** gRPC or REST; need GCP project and credentials. Node client libraries. Chunking and concatenation similar to others.
- **Languages:** 40+ (en, es, zh well supported).
- **Long text:** Per-request limits; chunk and merge.

**Verdict:** Strong option if you already use GCP or want enterprise SLA; quality and cost comparable to OpenAI.

---

## 4. Amazon Polly

- **Quality:** 3–4. Standard is robotic; Neural is good; “Long-form”/Generative is best but expensive.
- **Pricing:** Standard \$4.80/1M, Neural \$19.20/1M, Long-form \$100/1M. Free tier 5M chars for 12 months. Using Neural, full rebuild ≈ \$31 (1.6M chars).
- **API:** AWS SDK (Node); IAM and region setup. Chunk and concatenate.
- **Languages:** 30+ including en, es, zh.
- **Long text:** Chunk by sentence/paragraph; use `StartSpeechSynthesisTask` for long-form async if needed.

**Verdict:** Good if you’re on AWS and want to keep everything in one cloud; Neural is a solid quality/cost middle ground.

---

## 5. Edge TTS (Microsoft, unofficial)

- **Quality:** 3. Neural voices; better than old basic TTS, not as expressive as ElevenLabs or OpenAI.
- **Pricing:** Free (uses Edge/bing speech service; no official price for this API). No API key in the usual sense; some Node packages (e.g. `edge-tts-node`) call the service.
- **API:** Community packages: `edge-tts-node`, `edge-tts-universal`. Text → stream or file. Chunk long text and concatenate.
- **Languages:** 40+ with variants (en, es, zh).
- **Long text:** Chunk and merge; no single huge limit.
- **Caveat:** Unofficial; ToS and stability are less clear than paid APIs. Fine for personal/side projects; for strict compliance, prefer Azure TTS.

**Verdict:** Best for zero budget; good i18n and “good enough” quality for many listeners.

---

## 6. Azure Cognitive Services (Speech / TTS)

- **Quality:** 4. Neural and custom neural voices; comparable to Google/OpenAI.
- **Pricing:** ~\$16/1M chars (neural). Free tier 0.5M chars/month.
- **API:** REST or SDK; Azure account and key. Strong for 140+ languages and many voices.
- **Languages:** 140+ (best if you add more locales later).
- **Long text:** Chunk and concatenate.

**Verdict:** Use when you need maximum language coverage or are already on Azure.

---

## 7. Local / on-device TTS (runs before or during build)

These are **neural TTS models that run on your machine** (or in CI) at build time—no cloud call, no API key. Examples: **Piper**, **Coqui TTS**, **Hugging Face TTS**.

### Piper TTS

- **Quality:** 2–3. Understandable and clear; prosody and expressiveness lag cloud neural TTS. Trained on smaller datasets (tens of hours per voice) with less prosodic annotation, so it sounds more “flat” than Edge/OpenAI/ElevenLabs for narrative or emphatic text.
- **Pricing:** Free. Runs on CPU (or GPU with onnxruntime-gpu). No per-character cost; you pay in build time and local compute.
- **Setup:** Python (`pip install piper-tts`) or Bun + onnxruntime-node. Download voice models (`.onnx` + `.onnx.json`) from [Hugging Face](https://huggingface.co/rhasspy/piper-voices/). Output is WAV; use ffmpeg to get MP3. In a Node-based prebuild you’d typically shell out to `python3 -m piper --model <voice.onnx> --input-file <text> --output-file out.wav` then ffmpeg to MP3.
- **Languages:** 30+ (en, es, zh have voices).
- **Long text:** Chunk and run Piper per chunk; concatenate WAV/MP3 with ffmpeg. No network, so no rate limits; speed is dominated by CPU and model size (often sub–200 ms per chunk on a decent laptop).
- **CI/build:** Build environment must have Python (or Bun), Piper, the voice files, and ffmpeg. No network at audio-gen time; good for air-gapped or strict-privacy CI.

### Coqui TTS / Hugging Face

- **Quality:** 2–4 depending on model (e.g. VITS, Bark). Some models are close to cloud quality; others are robotic.
- **Setup:** Heavier (Python, often GPU-friendly). More moving parts than Piper. Good if you already run Python ML in CI.

---

## Local (Piper) vs Edge TTS

| Aspect | Edge TTS | Local (e.g. Piper) |
|--------|----------|---------------------|
| **Quality / engagement** | Better. Cloud neural voices; more natural prosody and rhythm. | Weaker. Flatter prosody; “read aloud” more than “narrated.” |
| **Cost** | Free (unofficial API). | Free; cost is build time and CPU. |
| **Build dependency** | Node + `node-edge-tts`; network required during build. | Python (or Bun) + Piper + voice models + ffmpeg; no network at gen time. |
| **CI** | Needs outbound HTTPS. Can break if service changes. | Self-contained once models are cached; works offline / air-gapped. |
| **Speed per chunk** | Network latency (hundreds of ms per request). | Often faster locally (tens–hundreds of ms on CPU). |
| **Swap in this repo** | Already implemented; `TTS_PROVIDER=edge`. | Add a `piper` provider that shells to `piper` CLI or calls a small Python helper; same `TTSProvider` interface. |

**Summary:** For **engagement and listenability**, Edge TTS (and any cloud neural TTS) beats local models like Piper. For **no network at build time**, **privacy**, or **deterministic/offline CI**, a local Piper (or similar) provider is the better fit. This site’s abstraction makes it straightforward to add a `providers/piper.ts` that spawns Piper and reads WAV → convert to buffer (or to MP3 via ffmpeg) so you can switch or A/B test without changing the rest of the pipeline.

---

## Recommendation for this site

- **Engagement-first, some budget:** **OpenAI TTS** (tts-1 or tts-1-hd). Best quality/cost for en/es/zh at ~75 items; only downside is implementing 4096-char chunking and audio stitching.
- **Zero cost, good quality:** **Edge TTS** via a Node script; acceptable quality and good language support; needs network at build time.
- **Zero cost, no network at build:** **Local TTS (e.g. Piper)**; add a provider that shells to Piper + ffmpeg. Lower engagement than Edge/cloud but fine for accessibility; ideal for offline or air-gapped CI.
- **Maximum engagement, budget OK:** **ElevenLabs**; plan for chunking and higher cost per full rebuild.

All of them need a small shared pipeline: MDX → plain text (existing plan), chunk long text, call TTS per chunk, concatenate audio, write to `public/audio/<locale>/writing|<projects>/<slug>.mp3`.

**Implementation:** This site uses Edge TTS via a provider abstraction in `src/lib/tts/`. Swap provider by implementing the `TTSProvider` interface in `src/lib/tts/providers/` and setting `TTS_PROVIDER` (or extending `getTTSProvider()` in `src/lib/tts/index.ts`). Build script: `scripts/generate-audio.ts`. Set `SKIP_AUDIO=1` to skip generation in CI.
