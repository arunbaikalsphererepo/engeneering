"use client";
// @ts-nocheck
import React from 'react';
 
export default function Wordmark({ size = 16 }: any) {
  return (
    <span style={{ fontWeight: 800, fontSize: size, letterSpacing: '-0.01em',
      fontFamily: 'var(--font-sans)', display: 'inline-flex', alignItems: 'baseline' }}>
      <span style={{ color: 'inherit' }}>Data</span>
      <span style={{ color: 'var(--brand-gold)', marginLeft: 6 }}>Sturdy</span>
    </span>
  );
}
