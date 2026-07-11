# Third-Party Notices

## MediaPipe Hand Landmarker

This site self-hosts `public/mediapipe/models/hand_landmarker.task` and the
MediaPipe Tasks Vision WASM runtime (generated at build time from the
`@mediapipe/tasks-vision` npm package into `public/mediapipe/wasm/`, not
committed to this repo), used for the optional webcam gesture-control
feature. Both are provided by Google's MediaPipe project and licensed under
the Apache License 2.0:

https://github.com/google-ai-edge/mediapipe

Model source: https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task

Gesture detection runs entirely client-side (WASM, in-browser) - no video or
frame data is ever sent to a server.

## Fonts

Inter (via `@fontsource-variable/inter`) and JetBrains Mono (via
`@fontsource/jetbrains-mono`) are both licensed under the SIL Open Font
License 1.1, self-hosted rather than loaded from Google Fonts.

## Icons

Stack/tool icons in the tech field, marquee, and elsewhere are sourced from
the `simple-icons` npm package (CC0 1.0 Universal) as raw SVG path data.
ROS2 and LangChain aren't in that set and are rendered as plain text-glyph
badges instead of a logo mark.
