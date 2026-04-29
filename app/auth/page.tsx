"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [notice, setNotice] = useState("当前是演示表单，不会提交真实账号数据。");

  const isRegister = mode === "register";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(isRegister ? "注册流程已模拟完成，可以进入工作台体验。" : "登录流程已模拟完成，可以进入工作台体验。");
  }

  return (
    <main className="auth-page">
      <div className="site-shell">
        <nav className="site-nav reveal">
          <Link className="brand" href="/">
            <span className="brand-mark">PB</span>
            <span>
              <h1>PixelBloom AI</h1>
              <p>登录后继续创作</p>
            </span>
          </Link>
          <div className="nav-links">
            <Link className="button button-outline" href="/">返回首页</Link>
            <Link className="button button-fill" href="/studio">进入工作台</Link>
          </div>
        </nav>

        <section className="auth-layout">
          <div className="auth-showcase reveal delay-1">
            <div>
              <div className="eyebrow">Account Preview</div>
              <h2 className="auth-title">把灵感入口留给真正想创作的人</h2>
              <p className="auth-copy">
                这是一个前端演示级登录注册页：它提供完整的视觉和交互状态，后续接入真实鉴权时可以继续沿用当前路由与页面结构。
              </p>
            </div>
            <div className="auth-badges">
              <span className="auth-badge">登录 / 注册切换</span>
              <span className="auth-badge">第三方入口样式</span>
              <span className="auth-badge">工作台快捷进入</span>
            </div>
          </div>

          <div className="auth-panel reveal delay-2">
            <div className="auth-tabs" role="tablist" aria-label="账号操作">
              <button className={`auth-tab ${mode === "login" ? "active" : ""}`} type="button" onClick={() => setMode("login")}>
                登录
              </button>
              <button className={`auth-tab ${mode === "register" ? "active" : ""}`} type="button" onClick={() => setMode("register")}>
                注册
              </button>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {isRegister && (
                <label>
                  用户名
                  <input name="name" placeholder="例如：Pixel Creator" autoComplete="name" />
                </label>
              )}
              <label>
                邮箱
                <input name="email" type="email" placeholder="creator@example.com" autoComplete="email" required />
              </label>
              <label>
                密码
                <input name="password" type="password" placeholder="请输入密码" autoComplete={isRegister ? "new-password" : "current-password"} required />
              </label>
              {isRegister && (
                <label>
                  确认密码
                  <input name="confirmPassword" type="password" placeholder="再次输入密码" autoComplete="new-password" required />
                </label>
              )}

              <button className="button button-fill" type="submit">
                {isRegister ? "创建演示账号" : "登录演示账号"}
              </button>

              <div className="oauth-grid">
                <button className="button button-outline" type="button" onClick={() => setNotice("Google 登录是展示入口，暂未接入真实 OAuth。")}>
                  Google
                </button>
                <button className="button button-outline" type="button" onClick={() => setNotice("GitHub 登录是展示入口，暂未接入真实 OAuth。")}>
                  GitHub
                </button>
              </div>

              <div className="auth-note">{notice}</div>
              <Link className="button button-dark" href="/studio">继续进入工作台</Link>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
