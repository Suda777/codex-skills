# Sources and licenses

Pinned components are downloaded only into `.runtime/` after permission.

| Component | Upstream | Purpose | License |
| --- | --- | --- | --- |
| whisper.cpp v1.9.2 | https://github.com/ggml-org/whisper.cpp | Local multilingual ASR | MIT |
| RapidOCR 3.8.x | https://github.com/RapidAI/RapidOCR | Portable visible-text OCR | Apache-2.0 |
| sherpa-onnx 1.13.x | https://github.com/k2-fsa/sherpa-onnx | Offline speaker diarization | Apache-2.0 |
| imageio-ffmpeg 0.6.x | https://github.com/imageio/imageio-ffmpeg | Platform FFmpeg executable | BSD-2-Clause wrapper; FFmpeg has its own license |

The Skill does not vendor these repositories into its committed tree. `setup_runtime.py` pins a release family, stores runtime downloads under `.runtime/`, and records local SHA-256 values in `runtime.json`.

Before changing a version or download URL:

1. Check the official release and license.
2. Confirm the operating-system and architecture support.
3. Re-run the portable smoke test.
4. Update this file and the setup constants together.
