import { useCallback, useEffect, useRef, useState } from "react";
import type { HandLandmarker } from "@mediapipe/tasks-vision";
import { loadHandLandmarker } from "@/lib/mediapipe/loadHandLandmarker";
import { isOpenPalm, isPinch } from "@/lib/mediapipe/gestureRecognizers";
import { scrollToNextSection } from "@/lib/scrollToNextSection";

export type GestureStatus = "idle" | "loading" | "active" | "denied" | "unavailable";
export type Gesture = "palm" | "pinch" | null;

function isCapable(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "mediaDevices" in navigator &&
    typeof navigator.mediaDevices?.getUserMedia === "function" &&
    typeof WebAssembly !== "undefined"
  );
}

export function useGestureController() {
  const [status, setStatus] = useState<GestureStatus>("idle");
  const [gesture, setGesture] = useState<Gesture>(null);

  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number>();
  const wasPinchingRef = useRef(false);

  // Tears down camera/model resources WITHOUT touching status - used both by the
  // public stop() (which does want status -> idle) and by the error path in
  // start() (which needs status to stay "denied"/"unavailable", not get
  // clobbered back to "idle" by a naive shared stop()).
  const cleanupResources = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = undefined;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    videoRef.current = null;
    wasPinchingRef.current = false;
    setGesture(null);
  }, []);

  const stop = useCallback(() => {
    cleanupResources();
    setStatus("idle");
  }, [cleanupResources]);

  const start = useCallback(async () => {
    if (!isCapable()) {
      setStatus("unavailable");
      return;
    }

    setStatus("loading");
    try {
      const [landmarker, stream] = await Promise.all([
        loadHandLandmarker(),
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }),
      ]);
      landmarkerRef.current = landmarker;
      streamRef.current = stream;

      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      await video.play();
      videoRef.current = video;

      setStatus("active");

      const loop = () => {
        const currentLandmarker = landmarkerRef.current;
        const currentVideo = videoRef.current;
        if (!currentLandmarker || !currentVideo) return;

        const result = currentLandmarker.detectForVideo(currentVideo, performance.now());
        const hand = result.landmarks?.[0];

        if (hand) {
          if (isOpenPalm(hand)) {
            setGesture("palm");
            window.scrollBy({ top: 12 });
            wasPinchingRef.current = false;
          } else if (isPinch(hand)) {
            setGesture("pinch");
            if (!wasPinchingRef.current) scrollToNextSection();
            wasPinchingRef.current = true;
          } else {
            setGesture(null);
            wasPinchingRef.current = false;
          }
        } else {
          setGesture(null);
          wasPinchingRef.current = false;
        }

        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      cleanupResources();
      setStatus(name === "NotAllowedError" ? "denied" : "unavailable");
    }
  }, [cleanupResources]);

  // Cleanup only on actual unmount - no need to touch status, the component's going away.
  useEffect(() => cleanupResources, [cleanupResources]);

  return { status, gesture, start, stop };
}
