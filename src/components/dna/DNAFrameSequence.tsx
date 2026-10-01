import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils/cn";

export interface DNAFrameSequenceProps {
  totalFrames?: number;
  frameRate?: number;
  basePath?: string;
  className?: string;
  showOverlay?: boolean;
}

export function DNAFrameSequence({
  totalFrames = 116,
  frameRate = 30,
  basePath = "/assets/dna-frames",
  className,
  showOverlay = true,
}: DNAFrameSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [firstFrameReady, setFirstFrameReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let isMounted = true;
    let isVisible = true;
    let lastTimestamp = performance.now();
    let currentFrameIndex = 0;
    const frameInterval = 1000 / frameRate;

    // Helper to get formatted image URL
    const getFrameUrl = (index: number) => {
      const paddedIndex = String(index + 1).padStart(4, "0");
      return `${basePath}/frame_${paddedIndex}.jpg`;
    };

    // Preload all frames into memory
    const images: HTMLImageElement[] = new Array(totalFrames);
    const loadedStatus: boolean[] = new Array(totalFrames).fill(false);

    // Draw a specific frame to canvas with object-fit: cover logic
    const drawFrame = (img: HTMLImageElement) => {
      if (!ctx || !img || !img.complete || img.naturalWidth === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = container.clientWidth || window.innerWidth;
      const displayHeight = container.clientHeight || window.innerHeight;

      const physicalWidth = Math.floor(displayWidth * dpr);
      const physicalHeight = Math.floor(displayHeight * dpr);

      if (canvas.width !== physicalWidth || canvas.height !== physicalHeight) {
        canvas.width = physicalWidth;
        canvas.height = physicalHeight;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const canvasAspect = displayWidth / displayHeight;
      const imgAspect = img.naturalWidth / img.naturalHeight;

      let drawW: number;
      let drawH: number;
      let drawX: number;
      let drawY: number;

      // object-fit: cover calculation
      if (canvasAspect > imgAspect) {
        drawW = displayWidth;
        drawH = displayWidth / imgAspect;
        drawX = 0;
        drawY = (displayHeight - drawH) / 2;
      } else {
        drawH = displayHeight;
        drawW = displayHeight * imgAspect;
        drawX = (displayWidth - drawW) / 2;
        drawY = 0;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();
    };

    // 1. Immediately preload and render the first frame to eliminate blank flashes
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    images[0] = firstImg;

    firstImg.onload = () => {
      if (!isMounted) return;
      loadedStatus[0] = true;
      setFirstFrameReady(true);
      drawFrame(firstImg);
    };

    // If first image is already cached by browser
    if (firstImg.complete && firstImg.naturalWidth > 0) {
      loadedStatus[0] = true;
      setFirstFrameReady(true);
      drawFrame(firstImg);
    }

    // 2. Preload remaining frames
    for (let i = 1; i < totalFrames; i++) {
      const img = new Image();
      img.src = getFrameUrl(i);
      images[i] = img;
      img.onload = () => {
        if (!isMounted) return;
        loadedStatus[i] = true;
      };
    }

    // 3. Continuously loop through the frames at 30 fps using requestAnimationFrame
    const loop = (timestamp: number) => {
      if (!isMounted) return;

      const elapsed = timestamp - lastTimestamp;

      if (isVisible && elapsed >= frameInterval) {
        lastTimestamp = timestamp - (elapsed % frameInterval);

        // Find the next frame to display
        const nextIndex = (currentFrameIndex + 1) % totalFrames;
        const candidateImg = images[nextIndex];

        if (candidateImg && candidateImg.complete && candidateImg.naturalWidth > 0) {
          currentFrameIndex = nextIndex;
          drawFrame(candidateImg);
        } else {
          // If next frame isn't loaded yet, try to redraw current or closest loaded frame
          const currentImg = images[currentFrameIndex];
          if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
            drawFrame(currentImg);
          }
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    // Resize handling
    const handleResize = () => {
      const currentImg = images[currentFrameIndex] || images[0];
      if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
        drawFrame(currentImg);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Pause when offscreen or document is hidden
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [totalFrames, frameRate, basePath]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden select-none", className)}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-700 ease-out",
          firstFrameReady ? "opacity-100" : "opacity-0"
        )}
      />

      {showOverlay && (
        <>
          {/* Subtle radial gradient overlay */}
          <div
            className="pointer-events-none absolute inset-0 -z-0 opacity-80 mix-blend-multiply"
            style={{
              background:
                "radial-gradient(circle at 60% 45%, rgba(14, 26, 48, 0.15) 0%, rgba(10, 20, 38, 0.75) 75%, rgba(6, 12, 24, 0.92) 100%)",
            }}
          />

          {/* Dark navy/black gradient overlay to preserve legibility for typography, search bar, and badges */}
          <div
            className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-r from-[#0a1628]/90 via-[#0a1628]/55 to-transparent backdrop-blur-[0.5px]"
          />

          {/* Bottom vignette to smoothly transition into next section */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0a1628] to-transparent" />
        </>
      )}
    </div>
  );
}
