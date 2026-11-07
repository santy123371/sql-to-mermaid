'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  Download,
  Maximize2,
  Minimize2,
  Move,
} from 'lucide-react';

interface MermaidRendererProps {
  code: string;
}

export default function MermaidRenderer({ code }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#090d16',
        primaryColor: '#1e293b',
        primaryTextColor: '#f8fafc',
        primaryBorderColor: '#4f46e5',
        lineColor: '#6366f1',
        secondaryColor: '#0f172a',
        tertiaryColor: '#1e1b4b',
      },
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });
  }, []);

  useEffect(() => {
    if (!code.trim()) {
      setSvgHtml('');
      setError(null);
      return;
    }

    let isMounted = true;
    const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;

    mermaid
      .render(uniqueId, code)
      .then(({ svg }) => {
        if (isMounted) {
          setSvgHtml(svg);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || 'Error al compilar el diagrama Mermaid.');
          const errorElem = document.getElementById(uniqueId);
          if (errorElem) errorElem.remove();
        }
      });

    return () => {
      isMounted = false;
    };
  }, [code]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleDownloadSvg = () => {
    if (!svgHtml) return;
    const blob = new Blob([svgHtml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagrama-clases.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`relative w-full h-full min-h-[520px] bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none min-h-screen' : ''
      }`}
    >
      {/* Background Dot Pattern */}
      <div className="absolute inset-0 bg-dot-grid opacity-70 pointer-events-none" />

      {/* Floating Canvas Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-xl p-1.5 shadow-2xl">
        <button
          onClick={() => setZoom((prev) => Math.min(prev + 0.15, 3.5))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((prev) => Math.max(prev - 0.15, 0.3))}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
          title="Restablecer posición y zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-slate-700 mx-1" />

        <button
          onClick={handleDownloadSvg}
          disabled={!svgHtml}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 rounded-lg transition disabled:opacity-40"
          title="Descargar diagrama como SVG vectorial"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 rounded-lg transition"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <span className="text-[11px] font-mono text-slate-400 px-2 select-none border-l border-slate-700">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Drag Helper Tooltip */}
      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400 select-none">
        <Move className="w-3 h-3 text-slate-500" />
        <span>Arrastra con el mouse para desplazarte por el lienzo</span>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`flex-1 w-full h-full p-8 flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
      >
        {error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center max-w-md bg-rose-950/40 border border-rose-800/60 rounded-2xl text-rose-300 backdrop-blur-md shadow-2xl">
            <AlertTriangle className="w-8 h-8 mb-2 text-rose-400 animate-bounce" />
            <p className="font-semibold text-sm">Error de Sintaxis Mermaid</p>
            <p className="text-xs text-rose-300/80 mt-1 font-mono break-all leading-relaxed">{error}</p>
          </div>
        ) : svgHtml ? (
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
            dangerouslySetInnerHTML={{ __html: svgHtml }}
            className="mermaid-wrapper flex items-center justify-center [&>svg]:max-w-none [&>svg]:drop-shadow-2xl"
          />
        ) : (
          <div className="text-slate-500 text-sm flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-2 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
            <span className="font-medium">Esperando código SQL para generar diagrama...</span>
          </div>
        )}
      </div>
    </div>
  );
}
