"use client";

export default function Wordmark({ size = 16 }: { size?: number }) {
  return (
    <span
      style={{
        fontWeight: 800,
        fontSize: size,
        letterSpacing: "-0.02em",
        fontFamily: "var(--font-sans)",
        display: "inline-flex",
        alignItems: "baseline",
        gap: 4,
      }}
    >
      <span style={{ color: "#0f172a" }}>Data</span>
      <span style={{ color: "var(--brand-gold)" }}>Sturdy</span>
    </span>
  );
}
