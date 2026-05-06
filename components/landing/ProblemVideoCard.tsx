"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  idleSrc: string;
  hoverSrc: string;
}

export default function ProblemVideoCard({ idleSrc, hoverSrc }: Props) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const idleVideoRef   = useRef<HTMLVideoElement>(null);
  const hoverVideoRef  = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [showHover, setShowHover] = useState(false);
  const reverseFrameRef = useRef<number>(0);

  // Set playback speed to 50%
  useEffect(() => {
    if (idleVideoRef.current) idleVideoRef.current.playbackRate = 0.5;
    if (hoverVideoRef.current) hoverVideoRef.current.playbackRate = 0.5;
  }, []);

  // Only play idle video when the card enters the viewport
  useEffect(() => {
    const video     = idleVideoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const playForward = () => {
    setIsHovered(true);
    setShowHover(true);
    cancelAnimationFrame(reverseFrameRef.current);
    if (hoverVideoRef.current) {
      hoverVideoRef.current.play().catch(() => {});
    }
  };

  const playBackward = () => {
    setIsHovered(false);
    if (hoverVideoRef.current) {
      hoverVideoRef.current.pause();

      let lastTime = performance.now();
      const rewind = (time: number) => {
        const delta = (time - lastTime) / 1000;
        if (delta > 0.033) {
          lastTime = time;
          if (hoverVideoRef.current && hoverVideoRef.current.currentTime > 0) {
            hoverVideoRef.current.currentTime = Math.max(
              0,
              hoverVideoRef.current.currentTime - delta * 1.2
            );
            setShowHover(true);
          } else {
            setShowHover(false);
            return;
          }
        }
        reverseFrameRef.current = requestAnimationFrame(rewind);
      };
      reverseFrameRef.current = requestAnimationFrame(rewind);
    }
  };

  useEffect(() => {
    return () => cancelAnimationFrame(reverseFrameRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[200px] sm:h-[300px] flex items-center justify-center cursor-pointer"
      onMouseEnter={playForward}
      onMouseLeave={playBackward}
    >
      <motion.div
        animate={{ scale: isHovered ? 1.3 : 1, zIndex: isHovered ? 10 : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full h-full min-h-[150px] sm:min-h-[250px]"
      >
        <video
          ref={idleVideoRef}
          src={idleSrc}
          preload="auto"
          loop
          muted
          playsInline
          autoPlay
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
            showHover ? "opacity-0" : "opacity-100"
          }`}
          style={{ mixBlendMode: "screen" }}
        />

        <video
          ref={hoverVideoRef}
          src={hoverSrc}
          preload="auto"
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
            showHover ? "opacity-100" : "opacity-0"
          }`}
          style={{ mixBlendMode: "screen" }}
        />
      </motion.div>
    </div>
  );
}
