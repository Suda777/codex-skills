# Platform routing

## Backend selection

`auto` selects `macos` on Darwin and `portable` elsewhere. A user can force `portable` on macOS to exercise the same open-source extraction path used on Windows and Linux.

### macOS

- Audio preparation: the FFmpeg binary supplied by `imageio-ffmpeg`.
- ASR: `whisper.cpp`; build with its normal Apple defaults so Apple Silicon can use Metal and Accelerate. Core ML is optional because generating Core ML encoders adds Xcode and Python dependencies.
- Visible text: Apple Vision through `scripts/ocr_macos.swift`.
- Speaker diarization: sherpa-onnx when the user needs speaker turns.

If Vision cannot recognize the required language or the Swift runtime is unavailable, use the portable OCR backend and record the fallback in `manifest.json`.

### Windows

- Audio preparation: the FFmpeg executable supplied by `imageio-ffmpeg`.
- ASR: the pinned official `whisper.cpp` Windows release. Start with its CPU binary; CUDA, Vulkan, or OpenVINO acceleration is an explicit optimization rather than an installation requirement.
- Visible text: RapidOCR with ONNX Runtime. DirectML can be enabled separately on supported Windows systems, but CPU mode is the compatibility baseline.
- Speaker diarization: sherpa-onnx with local ONNX models downloaded from its official GitHub releases.

Do not install CUDA toolkits, GPU drivers, Visual Studio, system codecs, or global Python packages automatically. The compatibility baseline must work inside the Skill runtime without them.

### Linux

Use the portable route. Prefer official `whisper.cpp` release binaries when the architecture is supported; otherwise compile the pinned source inside `.runtime/` after authorization.

## Model choice

- `base`: fast smoke tests and lower-memory machines; may miss names and technical phrases.
- `small`: default recommendation for ordinary Chinese interviews when time permits.
- `medium` or larger: use only when the user values accuracy enough to accept the download, storage, and runtime cost.

The extractor records the model in the manifest. Do not compare two transcripts without also comparing model size and backend.

## Speaker diarization

sherpa-onnx provides local clustering without account login. The default model pair is a pyannote segmentation ONNX model plus a 3D-Speaker embedding model from official sherpa-onnx releases. If installation or models are unavailable, complete ASR and OCR, label the speaker as unknown, and report that diarization was skipped.

Even successful diarization produces anonymous cluster labels. Identifying a person requires separate evidence.
