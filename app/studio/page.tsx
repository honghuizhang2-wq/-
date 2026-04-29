"use client";

import Link from "next/link";
import { ChangeEvent, DragEvent, useRef, useState } from "react";

type Mode = "text" | "image";
type StatusType = "ready" | "busy" | "error";
type HistoryItem = {
  dataUrl: string;
  text: string;
  time: string;
};

const styleOptions = ["真实摄影", "产品海报", "动漫插画", "水彩", "赛博朋克", "极简平面"];
const ratioOptions = ["1:1", "4:3", "3:4", "16:9", "9:16"];

function hashText(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function seededColor(seed: number, shift: number) {
  const hue = (seed * 37 + shift) % 360;
  return `hsl(${hue}, 58%, 52%)`;
}

function getCanvasSize(ratio: string) {
  const [w, h] = ratio.split(":").map(Number);
  const base = 1024;
  if (w === h) return [base, base] as const;
  if (w > h) return [base, Math.round((base * h) / w)] as const;
  return [Math.round((base * w) / h), base] as const;
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const chars = Array.from(text);
  let line = "";
  let lines = 0;

  for (const char of chars) {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      lines += 1;
      line = char;
      if (lines >= maxLines - 1) break;
    } else {
      line = next;
    }
  }

  if (line) {
    ctx.fillText(lines >= maxLines - 1 && chars.length > line.length ? `${line}...` : line, x, y);
  }
}

export default function StudioPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const toastTimer = useRef<number | null>(null);

  const [mode, setMode] = useState<Mode>("text");
  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  const [style, setStyle] = useState(styleOptions[0]);
  const [ratio, setRatio] = useState(ratioOptions[0]);
  const [strength, setStrength] = useState(70);
  const [model, setModel] = useState("Image Studio Mock");
  const [count, setCount] = useState(1);
  const [endpoint, setEndpoint] = useState("");
  const [status, setStatus] = useState("等待创作指令");
  const [statusType, setStatusType] = useState<StatusType>("ready");
  const [sourcePreview, setSourcePreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [lastDataUrl, setLastDataUrl] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);

  const dotColor = statusType === "busy" ? "#174ea6" : statusType === "error" ? "#b42318" : "#e0a829";

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }
    toastTimer.current = window.setTimeout(() => setToast(""), 1800);
  }

  function setStatusState(text: string, type: StatusType = "ready") {
    setStatus(text);
    setStatusType(type);
  }

  function addHistory(dataUrl: string, text: string) {
    const item = { dataUrl, text: text || "未命名", time: new Date().toLocaleTimeString() };
    setHistory((items) => [item, ...items].slice(0, 12));
  }

  function syncStrength(value: number) {
    setStrength(Math.max(0, Math.min(100, Number(value) || 0)));
  }

  async function drawImageFromUrl(url: string, addToHistory = false) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    await new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const [width, height] = getCanvasSize(ratio);
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/png");
        setLastDataUrl(dataUrl);
        if (addToHistory) addHistory(dataUrl, prompt.trim());
        resolve();
      };
      image.onerror = () => reject(new Error("图片加载失败"));
      image.src = url;
    });
  }

  async function drawGeneratedImage(index = 0) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const [width, height] = getCanvasSize(ratio);
    canvas.width = width;
    canvas.height = height;
    const text = prompt.trim() || "未命名创作";
    const seed = hashText(`${text}-${style}-${strength}-${index}`);

    if (mode === "image" && sourceImageRef.current) {
      ctx.drawImage(sourceImageRef.current, 0, 0, width, height);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.18 + (100 - strength) / 260})`;
      ctx.fillRect(0, 0, width, height);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, seededColor(seed, 20));
      gradient.addColorStop(0.52, seededColor(seed, 145));
      gradient.addColorStop(1, seededColor(seed, 275));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    for (let i = 0; i < 18; i += 1) {
      const x = (seed + i * 97) % width;
      const y = (seed * 3 + i * 131) % height;
      const radiusSize = 50 + ((seed + i * 43) % 180);
      ctx.beginPath();
      ctx.arc(x, y, radiusSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.06 + (i % 4) * 0.025})`;
      ctx.fill();
    }

    ctx.fillStyle = "rgba(0, 0, 0, .22)";
    ctx.fillRect(0, height - 170, width, 170);
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${Math.max(28, Math.round(width / 34))}px "Microsoft YaHei", Arial`;
    ctx.fillText(style, 44, height - 108);
    ctx.font = `500 ${Math.max(18, Math.round(width / 52))}px "Microsoft YaHei", Arial`;
    wrapCanvasText(ctx, text, 44, height - 72, width - 88, Math.max(26, Math.round(width / 38)), 2);

    const dataUrl = canvas.toDataURL("image/png");
    setLastDataUrl(dataUrl);
    addHistory(dataUrl, text);
  }

  async function requestRemoteGeneration() {
    if (!endpoint.trim()) return false;

    const payload = {
      mode,
      prompt: prompt.trim(),
      negative_prompt: negative.trim(),
      style,
      ratio,
      strength,
      count,
      model
    };

    const response = await fetch(endpoint.trim(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`接口返回 ${response.status}`);

    const data = await response.json();
    const url = data.image || data.url || data.data?.[0]?.url || data.data?.[0]?.b64_json;
    if (!url) throw new Error("接口响应里没有找到图片地址");
    await drawImageFromUrl(url.startsWith("data:") || url.startsWith("http") ? url : `data:image/png;base64,${url}`, true);
    return true;
  }

  async function generate() {
    if (!prompt.trim()) {
      showToast("先写一句提示词");
      return;
    }
    if (mode === "image" && !sourceImageRef.current) {
      showToast("图生图需要上传参考图片");
      return;
    }

    setBusy(true);
    setStatusState("正在生成图像...", "busy");
    try {
      const remoteUsed = await requestRemoteGeneration();
      if (!remoteUsed) {
        for (let i = 0; i < count; i += 1) {
          await new Promise((resolve) => window.setTimeout(resolve, 220));
          await drawGeneratedImage(i);
        }
      }
      setStatusState("生成完成", "ready");
      showToast("图像已生成");
    } catch (error) {
      setStatusState("生成失败", "error");
      showToast(error instanceof Error ? error.message : "生成失败");
    } finally {
      setBusy(false);
    }
  }

  function loadSourceFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const image = new Image();
      image.onload = () => {
        sourceImageRef.current = image;
        setSourcePreview(result);
        setStatusState("参考图片已加载", "ready");
      };
      image.src = result;
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    loadSourceFile(event.dataTransfer.files[0]);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    loadSourceFile(event.target.files?.[0]);
  }

  async function copyPrompt() {
    if (!prompt.trim()) {
      showToast("没有提示词可复制");
      return;
    }
    await navigator.clipboard.writeText(prompt.trim());
    showToast("提示词已复制");
  }

  function downloadImage() {
    if (!lastDataUrl) {
      showToast("还没有可下载的图片");
      return;
    }
    const link = document.createElement("a");
    link.href = lastDataUrl;
    link.download = `ai-image-${Date.now()}.png`;
    link.click();
  }

  function clearInput() {
    setPrompt("");
    setNegative("");
    setSourcePreview("");
    sourceImageRef.current = null;
    showToast("已清空输入");
  }

  return (
    <main className="studio-app">
      <aside className="studio-sidebar">
        <div className="studio-brand">
          <div className="studio-logo">AI</div>
          <div>
            <h1>AI 图像工作台</h1>
            <p>文生图 / 图生图单页控制台</p>
          </div>
        </div>

        <div className="studio-tabs" role="tablist" aria-label="生成模式">
          <button className={`studio-tab ${mode === "text" ? "active" : ""}`} type="button" onClick={() => {
            setMode("text");
            setStatusState("文生图模式已就绪");
          }}>
            文生图
          </button>
          <button className={`studio-tab ${mode === "image" ? "active" : ""}`} type="button" onClick={() => {
            setMode("image");
            setStatusState("图生图模式已就绪");
          }}>
            图生图
          </button>
        </div>

        <section className="studio-panel" aria-label="生成参数">
          {mode === "image" && (
            <div className="studio-field">
              <div className="field-head">参考图片 <span className="hint">PNG / JPG</span></div>
              <div
                className={`upload ${dragging ? "dragging" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
              >
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} />
                {sourcePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sourcePreview} alt="参考图预览" />
                ) : (
                  <div className="upload-copy">
                    <strong>上传参考图片</strong>
                    <span>点击或拖拽图片到这里</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="studio-field">
            <div className="field-head">提示词 <span className="hint">{prompt.trim().length} 字</span></div>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="例如：一间清晨阳光里的现代咖啡馆，吧台上有手冲咖啡器具，电影感构图，真实摄影，高细节"
            />
          </div>

          <label className="studio-field">
            <span className="field-head">反向提示词 <span className="hint">可选</span></span>
            <input value={negative} onChange={(event) => setNegative(event.target.value)} placeholder="低清晰度、变形、文字、水印" />
          </label>

          <div className="studio-grid-2">
            <label className="studio-field">
              风格
              <select value={style} onChange={(event) => setStyle(event.target.value)}>
                {styleOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="studio-field">
              比例
              <select value={ratio} onChange={(event) => setRatio(event.target.value)}>
                {ratioOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
          </div>

          <div className="studio-field">
            <div className="field-head">创意强度 <span className="hint">{strength}</span></div>
            <div className="slider-row">
              <input type="range" min="0" max="100" value={strength} onChange={(event) => syncStrength(Number(event.target.value))} />
              <input type="number" min="0" max="100" value={strength} onChange={(event) => syncStrength(Number(event.target.value))} />
            </div>
          </div>

          <div className="studio-grid-2">
            <label className="studio-field">
              模型
              <select value={model} onChange={(event) => setModel(event.target.value)}>
                <option>Image Studio Mock</option>
                <option>OpenAI Images</option>
                <option>Stable Diffusion</option>
                <option>Midjourney Proxy</option>
              </select>
            </label>
            <label className="studio-field">
              数量
              <select value={count} onChange={(event) => setCount(Number(event.target.value))}>
                <option value="1">1 张</option>
                <option value="2">2 张</option>
                <option value="4">4 张</option>
              </select>
            </label>
          </div>

          <label className="studio-field">
            接口地址
            <input value={endpoint} onChange={(event) => setEndpoint(event.target.value)} placeholder="https://your-api.example.com/generate" />
          </label>

          <div className="studio-generate">
            <button className="button button-fill" type="button" disabled={busy} onClick={generate}>
              {busy ? "生成中..." : "开始生成"}
            </button>
            <button className="button button-outline" type="button" onClick={clearInput} title="清空">清空</button>
          </div>
        </section>
      </aside>

      <section className="studio-workspace">
        <div className="studio-topbar">
          <div className="status">
            <span className="dot" style={{ background: dotColor, boxShadow: `0 0 0 5px ${dotColor}24` }} />
            <span>{status}</span>
          </div>
          <div className="studio-actions">
            <Link className="button button-outline" href="/">首页</Link>
            <button className="button button-outline" type="button" onClick={downloadImage}>下载</button>
            <button className="button button-outline" type="button" onClick={copyPrompt}>复制提示词</button>
          </div>
        </div>

        <div className="canvas-wrap">
          <div className="stage">
            {!lastDataUrl && (
              <div className="empty-state">
                <strong>生成结果会显示在这里</strong>
                <span>填写提示词后点击开始生成。若填入接口地址，会向你的后端发送请求；否则使用本地预览生成器。</span>
              </div>
            )}
            <canvas ref={canvasRef} hidden={!lastDataUrl} width="1024" height="1024" />
          </div>

          <aside className="history-panel">
            <div className="history-head">
              <h2>历史结果</h2>
              <button className="button button-outline" type="button" onClick={() => {
                setHistory([]);
                showToast("历史已清空");
              }}>
                清空
              </button>
            </div>
            <div className="thumbs">
              {history.map((item, index) => (
                <figure className="thumb" key={`${item.time}-${index}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.dataUrl} alt={item.text} onClick={() => void drawImageFromUrl(item.dataUrl)} />
                  <figcaption>{index + 1}. {item.text} · {item.time}</figcaption>
                </figure>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">{toast}</div>
    </main>
  );
}
