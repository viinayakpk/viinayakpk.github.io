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
