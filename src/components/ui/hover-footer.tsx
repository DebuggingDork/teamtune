"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextHoverEffect = ({
  text,
  duration,
  className,
}: {
  text: string;
  duration?: number;
  automatic?: boolean;
  className?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });

  useEffect(() => {
    if (svgRef.current && cursor.x !== null && cursor.y !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      const cxPercentage = ((cursor.x - svgRect.left) / svgRect.width) * 100;
      const cyPercentage = ((cursor.y - svgRect.top) / svgRect.height) * 100;
      setMaskPosition({
        cx: `${cxPercentage}%`,
        cy: `${cyPercentage}%`,
      });
    }
  }, [cursor]);

  return (
    <motion.svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox="0 0 1000 200"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className={cn("select-none uppercase cursor-pointer", className)}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: "easeOut" }}
      animate={{
        y: [0, -10, 0],
      }}
      // @ts-ignore - framer-motion types issue
      transition={{
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }
      }}
    >
      <defs>
        <linearGradient
          id="textGradient"
          gradientUnits="userSpaceOnUse"
          cx="50%"
          cy="50%"
          r="25%"
        >
          {hovered && (
            <>
              <stop offset="0%" stopColor="#3ca2fa" />
              <stop offset="25%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#3ca2fa" />
              <stop offset="75%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#3ca2fa" />
            </>
          )}
        </linearGradient>

        <motion.radialGradient
          id="revealMask"
          gradientUnits="userSpaceOnUse"
          r="30%"
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id="textMask">
          <rect x="0" y="0" width="100%" height="100%" fill="url(#revealMask)" />
        </mask>
      </defs>

      {/* Base outline text - always visible */}
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="1"
        className="fill-transparent font-bold"
        stroke="#1e3a5f"
        style={{
          fontSize: "140px",
          fontWeight: 800,
          letterSpacing: "0.05em"
        }}
        initial={{ strokeDashoffset: 2000, strokeDasharray: 2000 }}
        whileInView={{
          strokeDashoffset: 0,
          strokeDasharray: 2000,
        }}
        viewport={{ once: true }}
        transition={{
          duration: 3,
          ease: "easeInOut",
        }}
        animate={{
          stroke: ["#1e3a5f", "#3ca2fa", "#1e3a5f"],
        }}
        // @ts-ignore
        transition={{
          stroke: {
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }
        }}
      >
        {text}
      </motion.text>

      {/* Hover highlight text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        strokeWidth="1.5"
        className="fill-transparent font-bold"
        stroke="#3ca2fa"
        style={{
          opacity: hovered ? 0.8 : 0,
          fontSize: "140px",
          fontWeight: 800,
          letterSpacing: "0.05em",
          transition: "opacity 0.3s ease"
        }}
      >
        {text}
      </text>

      {/* Masked reveal text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        stroke="url(#textGradient)"
        strokeWidth="2"
        mask="url(#textMask)"
        className="fill-transparent font-bold"
        style={{
          fontSize: "140px",
          fontWeight: 800,
          letterSpacing: "0.05em"
        }}
      >
        {text}
      </text>
    </motion.svg>
  );
};

export const FooterBackgroundGradient = () => {
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]">
      <div
        className="pointer-events-none absolute inset-0 h-full animate-[spin_20s_linear_infinite]"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(60, 162, 250, 0.1) 0deg, transparent 60deg, transparent 300deg, rgba(60, 162, 250, 0.05) 360deg)",
          filter: "blur(60px)",
        }}
      />
    </div>
  );
};
