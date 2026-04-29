import Link from "next/link";

const features = [
  {
    title: "登录 / 注册入口",
    text: "导航右上角进入独立二级页面，登录和注册在同一个页面内切换，便于后续接入真实账号系统。"
  },
  {
    title: "文生图案例墙",
    text: "首页展示摄影、海报、动漫、极简、电影感等视觉方向，让访问者先看见结果，再进入生成界面。"
  },
  {
    title: "图生图转化路径",
    text: "案例中加入图生图标签和说明，明确支持上传参考图进行重绘与风格迁移。"
  }
];

const examples = [
  ["文生图", "城市纪实摄影", "清晨街口、逆光、颗粒感和镜头压缩感，适合真实风摄影类文生图。", "style-photo"],
  ["文生图", "动漫角色海报", "高饱和配色和角色中心构图，适合二次元人物、封面和立绘方向。", "style-anime"],
  ["图生图", "霓虹夜景重绘", "上传普通街景后，改造成潮湿霓虹与赛博灯牌的氛围版本。", "style-neon"],
  ["文生图", "极简品牌静物", "克制构图和留白，更适合品牌 KV、广告静物和展示型画面。", "style-minimal"],
  ["图生图", "草图精修上色", "从手绘草图出发做轮廓保留、材质补完和气氛重建。", "style-sketch"],
  ["文生图", "时装大片风格", "强调姿态、面料和灯光关系，适合服饰、珠宝与人物商业视觉。", "style-fashion"],
  ["图生图", "水彩风格迁移", "把照片或原图转成柔和水彩笔触，适合文艺海报、绘本和周边插图。", "style-watercolor"],
  ["文生图", "电影感场景概念", "宽画幅、氛围灯和戏剧化色彩，适合项目提案和分镜前期。", "style-cinema"]
] as const;

export default function HomePage() {
  return (
    <main className="site-shell">
      <nav className="site-nav reveal">
        <Link className="brand" href="/">
          <span className="brand-mark">PB</span>
          <span>
            <h1>PixelBloom AI</h1>
            <p>用一句描述，长出完整画面</p>
          </span>
        </Link>
        <div className="nav-links">
          <a className="nav-link" href="#examples">案例</a>
          <a className="nav-link" href="#features">能力</a>
          <Link className="button button-outline" href="/auth">登录</Link>
          <Link className="button button-fill" href="/auth">注册</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <div className="reveal delay-1">
            <div className="eyebrow">Text to Image / Image to Image</div>
            <h2 className="hero-title">为灵感做一块真正能发光的画布</h2>
            <p className="hero-copy">
              PixelBloom AI 把文生图和图生图收进一个工作台里。宣传页先给你看见风格跨度，进入生成页之后就能立刻开始出图、上传参考图、调整创意强度并保存结果。
            </p>
          </div>

          <div className="hero-actions reveal delay-2">
            <Link className="button button-fill" href="/studio">开始创作</Link>
            <a className="button button-outline" href="#examples">浏览示例</a>
          </div>

          <div className="hero-metrics reveal delay-3">
            <div className="metric">
              <strong>08</strong>
              <span>不同视觉风格示例，覆盖文生图与图生图场景。</span>
            </div>
            <div className="metric">
              <strong>03</strong>
              <span>首页、登录注册页、工作台三条清晰路由。</span>
            </div>
            <div className="metric">
              <strong>∞</strong>
              <span>支持继续接后端接口，把演示页升级成真实可用产品。</span>
            </div>
          </div>
        </div>

        <div className="hero-preview reveal delay-2" aria-label="创作预览">
          <div className="glass-panel">
            <div className="mini-row">
              <strong>今日精选工作流</strong>
              <span>Live Preview</span>
            </div>
            <div className="prompt-card">
              <strong>Prompt</strong>
              <p>黄昏港口边的未来电车，潮湿空气，电影镜头，真实质感</p>
            </div>
            <div className="mosaic">
              <div className="floating-card scene-photo">
                <strong>文生图</strong>
                <p>从空白开始搭建构图、光线和质感，适合海报、概念图、角色和场景探索。</p>
              </div>
              <div className="vertical-stack">
                <div className="floating-card scene-anime">
                  <strong>图生图</strong>
                  <p>上传参考图后进行重绘、换风格和细节改造。</p>
                </div>
                <div className="floating-card scene-product">
                  <strong>多风格跳转</strong>
                  <p>示例卡点击即可进入工作台，继续尝试相似思路。</p>
                </div>
              </div>
            </div>
            <div className="mini-row">
              <span>Campaign Ready</span>
              <Link className="button button-fill" href="/studio">进入工作台</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-head reveal">
          <h3 className="section-title">把创作入口做得像产品，而不只是工具</h3>
          <p className="section-copy">
            首页负责展示和转化，登录注册页负责承接用户动作，工作台则专注执行生成流程。
          </p>
        </div>
        <div className="features">
          {features.map((feature, index) => (
            <article className={`feature-card reveal delay-${index + 1}`} key={feature.title}>
              <strong>{feature.title}</strong>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="examples">
        <div className="section-head reveal">
          <h3 className="section-title">不同风格示例</h3>
          <p className="section-copy">
            这些示例都可以点击，进入 Next.js 工作台路由后继续尝试相似的文生图或图生图流程。
          </p>
        </div>
        <div className="examples">
          {examples.map(([tag, title, text, style], index) => (
            <Link className={`example-card reveal delay-${(index % 4) + 1}`} href="/studio" key={title}>
              <div className={`example-media ${style}`}>
                <div className="tag">{tag}</div>
                <div className="example-art" />
              </div>
              <div className="example-copy">
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="cta-band reveal">
        <strong>示例看够了，下一步就让用户自己生成</strong>
        <p>点击下面的入口会直接进入工作台页面。首页负责展示和吸引，工作台负责生成和操作。</p>
        <Link className="button button-outline" href="/studio">进入文生图 / 图生图工作台</Link>
      </section>

      <footer className="site-footer">
        <p>Next.js 路由：/ ｜ /auth ｜ /studio</p>
        <div className="footer-links">
          <Link href="/auth">登录</Link>
          <Link href="/auth">注册</Link>
          <a href="#examples">示例</a>
        </div>
      </footer>
    </main>
  );
}
