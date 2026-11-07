'use client';

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import MermaidRenderer from '@/components/MermaidRenderer';
import { parseSqlSchema, ParserOptions, TableInfo, ParserStats } from '@/lib/sql-parser';
import {
  Upload,
  Download,
  Copy,
  Check,
  ExternalLink,
  Code2,
  Eye,
  Settings2,
  Trash2,
  FileCode,
  Sparkles,
  Database,
  AlertCircle,
  FileCheck2,
  Layers,
  Network,
} from 'lucide-react';

const SAMPLE_AUTH_SQL = `-- Mini Esquema de Autenticación y Roles
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nom_rol VARCHAR(50) NOT NULL UNIQUE,
    des_rol VARCHAR(200) NULL,
    act_rol BOOLEAN DEFAULT 1
);

CREATE TABLE usuarios (
    id_usu INT AUTO_INCREMENT PRIMARY KEY,
    nom_usu VARCHAR(80) NOT NULL,
    ema_usu VARCHAR(120) NOT NULL UNIQUE,
    pas_usu VARCHAR(255) NOT NULL,
    id_rol_usu INT NOT NULL,
    act_usu BOOLEAN DEFAULT 1,
    FOREIGN KEY (id_rol_usu) REFERENCES roles(id_rol)
);

CREATE TABLE refresh_tokens (
    id_rft INT AUTO_INCREMENT PRIMARY KEY,
    tkn_rft VARCHAR(255) NOT NULL UNIQUE,
    id_usu_rft INT NOT NULL,
    exp_rft TIMESTAMP NOT NULL,
    FOREIGN KEY (id_usu_rft) REFERENCES usuarios(id_usu)
);`;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit for security

function ConverterContent() {
  const searchParams = useSearchParams();
  const [sqlInput, setSqlInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [copied, setCopied] = useState<boolean>(false);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const dragCounter = useRef<number>(0);

  // Parser Options
  const [options, setOptions] = useState<ParserOptions>({
    includeMethods: true,
    direction: 'TB',
    pascalCase: true,
    diagramType: 'classDiagram',
  });

  // Parsed Output & Stats
  const [parsedResult, setParsedResult] = useState<{
    tables: TableInfo[];
    mermaidCode: string;
    stats: ParserStats;
  }>({
    tables: [],
    mermaidCode: '',
    stats: { tablesCount: 0, columnsCount: 0, relationsCount: 0 },
  });

  const showToast = (text: string, type: 'error' | 'success' = 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const runParse = useCallback((sql: string, opts: ParserOptions) => {
    if (!sql.trim()) {
      setParsedResult({
        tables: [],
        mermaidCode: '',
        stats: { tablesCount: 0, columnsCount: 0, relationsCount: 0 },
      });
      return;
    }
    const { tables, mermaidCode, stats } = parseSqlSchema(sql, opts);
    setParsedResult({
      tables,
      mermaidCode,
      stats,
    });
  }, []);

  const handleSqlChange = (value: string) => {
    setSqlInput(value);
    runParse(value, options);
  };

  const handleOptionChange = (newOptions: Partial<ParserOptions>) => {
    const updated = { ...options, ...newOptions };
    setOptions(updated);
    runParse(sqlInput, updated);
  };

  // Load Demo schema
  const loadDemoSchema = async () => {
    setIsLoadingSample(true);
    try {
      const res = await fetch('/api/sample');
      if (res.ok) {
        const data = await res.json();
        if (data.sql) {
          setSqlInput(data.sql);
          runParse(data.sql, options);
          showToast('Esquema demo (10 tablas) cargado correctamente', 'success');
        }
      }
    } catch (e) {
      showToast('No se pudo cargar el archivo demo');
    } finally {
      setIsLoadingSample(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('demo') === 'true') {
      loadDemoSchema();
    }
  }, [searchParams]);

  // Strict file validation & sanitization
  const processSqlFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.sql')) {
      showToast(`Archivo rechazado: "${file.name}". Por seguridad solo se admiten archivos .sql`, 'error');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast('El archivo supera el tamaño máximo permitido (10MB).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSqlInput(content);
        runParse(content, options);
        showToast(`Archivo "${file.name}" cargado exitosamente`, 'success');
      }
    };
    reader.onerror = () => {
      showToast('Error al leer el archivo seleccionado.', 'error');
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSqlFile(file);
      e.target.value = '';
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDraggingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSqlFile(files[0]);
    }
  };

  const handleCopy = () => {
    if (!parsedResult.mermaidCode) return;
    navigator.clipboard.writeText(parsedResult.mermaidCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMmd = () => {
    if (!parsedResult.mermaidCode) return;
    const blob = new Blob([parsedResult.mermaidCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagrama-clases.mmd';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenMermaidLive = () => {
    if (!parsedResult.mermaidCode) return;
    const jsonPayload = JSON.stringify({
      code: parsedResult.mermaidCode,
      mermaid: { theme: 'default' },
    });
    const base64 = btoa(unescape(encodeURIComponent(jsonPayload)));
    window.open(`https://mermaid.live/edit#base64:${base64}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-4">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs shadow-2xl transition-all duration-200 ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 border-rose-800 text-rose-300'
                : 'bg-emerald-950/90 border-emerald-800 text-emerald-300'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Top Control Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 backdrop-blur-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <FileCode className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base sm:text-lg font-bold text-white">
                  SQL to Mermaid Studio
                </h1>
                {parsedResult.stats.tablesCount > 0 && (
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300">
                      {parsedResult.stats.tablesCount} tablas
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
                      {parsedResult.stats.columnsCount} columnas
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-400">
                      {parsedResult.stats.relationsCount} relaciones
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Arrastra tu archivo <code className="text-indigo-300 font-mono">.sql</code> o prueba los esquemas de ejemplo predefinidos.
              </p>
            </div>
          </div>

          {/* Quick Presets & Upload */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 mr-1">Ejemplos:</span>
            <button
              onClick={loadDemoSchema}
              disabled={isLoadingSample}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/40 text-indigo-300 hover:text-white transition disabled:opacity-50"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>SaaS E-Commerce (10 Tablas)</span>
            </button>

            <button
              onClick={() => {
                setSqlInput(SAMPLE_AUTH_SQL);
                runParse(SAMPLE_AUTH_SQL, options);
                showToast('Esquema de autenticación cargado', 'success');
              }}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Auth & Roles (3 Tablas)</span>
            </button>

            <label className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white cursor-pointer transition">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Subir .sql</span>
              <input type="file" accept=".sql" onChange={handleFileInputChange} className="hidden" />
            </label>

            {sqlInput && (
              <button
                onClick={() => handleSqlChange('')}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/50 text-slate-400 hover:text-rose-400 transition"
                title="Limpiar Editor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Configurations Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/70 rounded-xl px-4 py-2.5 text-xs text-slate-300">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-1.5">
              <Settings2 className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-white">Configuración:</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Orientación:</span>
              <select
                value={options.direction}
                onChange={(e) => handleOptionChange({ direction: e.target.value as 'TB' | 'LR' })}
                className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="TB">Vertical (TB)</option>
                <option value="LR">Horizontal (LR)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.includeMethods}
                onChange={(e) => handleOptionChange({ includeMethods: e.target.checked })}
                className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>Incluir Métodos CRUD (+registrar, +actualizar)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options.pascalCase}
                onChange={(e) => handleOptionChange({ pascalCase: e.target.checked })}
                className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>Formato PascalCase</span>
            </label>
          </div>

          {/* Detected tables mini pills */}
          {parsedResult.tables.length > 0 && (
            <div className="hidden xl:flex items-center gap-1.5 overflow-x-auto max-w-md py-0.5">
              <span className="text-slate-500 text-[11px]">Tablas:</span>
              {parsedResult.tables.slice(0, 5).map((t) => (
                <span
                  key={t.name}
                  className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-cyan-300 font-mono"
                >
                  {t.className}
                </span>
              ))}
              {parsedResult.tables.length > 5 && (
                <span className="text-[10px] text-slate-500 font-mono">
                  +{parsedResult.tables.length - 5} más
                </span>
              )}
            </div>
          )}
        </div>

        {/* 2-Column Split Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-[620px]">
          {/* Left Pane: SQL Input with Drag & Drop */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`relative flex flex-col bg-slate-900/70 border rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 ${
              isDraggingFile
                ? 'border-indigo-500 ring-4 ring-indigo-500/20'
                : 'border-slate-800'
            }`}
          >
            {/* Visual Drag & Drop Overlay */}
            {isDraggingFile && (
              <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-indigo-400 m-2 rounded-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                <div className="w-16 h-16 rounded-2xl bg-indigo-900/40 border border-indigo-500/50 flex items-center justify-center text-indigo-400 mb-4 shadow-xl">
                  <FileCheck2 className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Suelta tu archivo .sql aquí
                </h3>
                <p className="text-xs text-indigo-300/80 font-mono">
                  Solo se aceptan archivos con extensión .sql (máx. 10MB)
                </p>
              </div>
            )}

            <div className="h-12 px-4 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200">Esquema SQL (Entrada DDL)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                  <Upload className="w-3 h-3 text-indigo-400" /> Arrastra tu .sql
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {sqlInput.length.toLocaleString()} caracteres
                </span>
              </div>
            </div>

            <textarea
              value={sqlInput}
              onChange={(e) => handleSqlChange(e.target.value)}
              placeholder="Pega aquí tu código SQL (CREATE TABLE, FOREIGN KEY...), arrastra tu archivo .sql o prueba los ejemplos..."
              className="flex-1 w-full p-4 bg-slate-950/60 text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-0 placeholder:text-slate-600"
              spellCheck={false}
            />
          </div>

          {/* Right Pane: Mermaid Output & Preview */}
          <div className="flex flex-col bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Tab Header & Action Buttons */}
            <div className="h-12 px-4 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('visual')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === 'visual'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Vista Previa</span>
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    activeTab === 'code'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Código .mmd</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopy}
                  disabled={!parsedResult.mermaidCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition disabled:opacity-40"
                  title="Copiar código Mermaid al portapapeles"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>

                <button
                  onClick={handleDownloadMmd}
                  disabled={!parsedResult.mermaidCode}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition disabled:opacity-40"
                  title="Descargar archivo .mmd listo para Mermaid"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar .mmd</span>
                </button>

                <button
                  onClick={handleOpenMermaidLive}
                  disabled={!parsedResult.mermaidCode}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 transition disabled:opacity-40"
                  title="Abrir en Mermaid Live Editor oficial"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tab Display Area */}
            <div className="flex-1 w-full h-full p-2.5 bg-slate-950/40 overflow-hidden flex flex-col">
              {activeTab === 'visual' ? (
                <MermaidRenderer code={parsedResult.mermaidCode} />
              ) : (
                <textarea
                  readOnly
                  value={parsedResult.mermaidCode}
                  placeholder="Aquí aparecerá el código Mermaid generado..."
                  className="flex-1 w-full h-full p-4 bg-slate-950 text-indigo-300 font-mono text-xs leading-relaxed resize-none focus:outline-none rounded-xl border border-slate-800/80"
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ConverterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-mono text-sm">Cargando Studio...</div>}>
      <ConverterContent />
    </Suspense>
  );
}
