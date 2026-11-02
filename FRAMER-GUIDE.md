# 在 Framer 里搭这个 Portfolio

参照物：本地版 `portfolio-redesign/`（`index.html` / `work.html` / `about.html` / `lens.html`），开着它对照着搭最快。

分工：
- **原生做**（拖拽 + Effects）：页面、导航 tab、文字排版、出现动画、视差、横向滚动、名字翻牌、工牌摇晃、项目详情页（CMS）。
- **代码组件做**（`framer/code/` 里 8 个文件，复制粘贴进去）：首屏文字人像、叠卡、掀开盖布、桌面文件、拖动照片、盖印章、数字滚动。

---

## 0. 准备（10 分钟）

1. 新建一个空白 Framer 项目，断点保留 **Desktop 1440 / Tablet 810 / Phone 390**。
2. **颜色**（Assets → Colors，新建 Color Style）：

   | 名字 | 值 |
   |---|---|
   | Paper | `#EFE7DA` |
   | Paper 2 | `#E6DCCB` |
   | Paper 3 | `#F7F2E9` |
   | Ink | `#231F1C` |
   | Ink 2 | `#5A524A` |
   | Ink 3 | `#8F857A` |
   | Rule | `#D3C8B6` |
   | Zhu | `#B23A2B`（全站唯一强调色） |

3. **字体**（Assets → Text Styles），都是 Google Fonts，Framer 里直接能选：
   - Display：**Fraunces** Regular，H1 96 / 行高 0.96 / 字距 -2.5%，H2 68 / 1.02，H3 46 / 1.02
   - Body：**Inter** Light 17 / 1.65
   - Label：**IBM Plex Mono** Regular 12，Eyebrow 大写 + 字距 12%
   - Lead：Fraunces Regular 24 / 1.5，颜色 Ink 2
4. **行书字体**：代码组件已经内置了（`Assets.tsx` 里），不用上传。原生文字（比如工牌、导航上的"朱"）想用行书，就去 Site Settings → Fonts → Upload 上传 `assets/fonts/danxingshu-subset.woff2`。⚠️ 上线前确认这款字体的网页授权。
5. **纸张纹理**：每个页面的背景色设为 Paper。想要颗粒感，可以在页面最底层放一个铺满的 Frame，Fill 用一张噪点图，透明度 8%，Pointer Events 设为 None。

## 1. 导入代码组件

Assets → Code → **+** → New Code File，按下面顺序建文件，**文件名要一模一样**，把对应 `.tsx` 的内容整个粘进去：

1. `Assets` ← `Assets.tsx`（**必须第一个建**，其他文件都会 import 它）
2. `InkPortrait` · `ProjectDeck` · `PeelReveal` · `DeskFiles` · `DraggablePrints` · `SealStamp` · `CountUp`

之后在 Assets → Code 里就能把它们拖到画布上，右侧面板可以改属性。

## 2. 导航（一个 Component，4 个 Variant）

1. 做一个 `Nav` 组件：左边 `朱`（行书，Zhu 色）+ "Annora Zhu"；中间是胶囊形 tab 组（Stack，padding 4，圆角 999，描边 Rule）；右边是黑色胶囊按钮 "Say hi"。
2. 建 4 个 Variant：**Home / Work / About / Lens**。每个 variant 里，当前页那个 tab 的背景是 Ink、文字是 Paper，其他 tab 透明。
3. 每个页面都放这个 Nav：Position **Fixed**、Top 0、宽 100%，再选好对应的 variant。
4. 滚动后出现半透明背景：Nav 加 **Effects → Scroll → Section**，滚过 Hero 后背景变成 Paper 82% + Background Blur 10。
5. **页面切换动画**：Site Settings → **Page Transitions**（或者每个 Link 的 Transition），用 Fade 加轻微上移（y 14 → 0），时长 0.4s，曲线 ease-out。

## 3. Home

- **Hero**（三栏 Grid，高 100vh）：
  - 左：小绿点那行（mono），加上 H1 "I listen for what people *don't* say."。其中 *don't* 用 Fraunces Italic、颜色 Zhu。
  - 中：拖一个 **InkPortrait**，宽 520、高 693（3:4）。Photo 选 `assets/img/me-crop.jpg`，**Built-in matte 保持开启**（这个遮罩只对这张照片准，换照片就关掉）。下面两行说明文字。
  - 右下：mono 小字简介。
  - 视差：左右两块加 **Effects → Scroll Speed** 0.9 / 1.1。
- **Intro**：两栏，文案照抄 `index.html` 里的 `.intro`。
- **三扇门**：3 张 4:5 的卡，各自 Link 到 Work / About / Lens。
  - 图片加 Hover 效果：Scale 1.06、Opacity 0.5。
  - 右上角的圆形箭头 Hover 时旋转 -45°、变成 Zhu 色。
- **Footer**：见第 7 节。

## 4. Work

1. **CMS**：CMS → New Collection "Projects" → **Import CSV** → 选 `framer/projects-cms.csv`。字段类型这样设：

   | 字段 | 类型 |
   |---|---|
   | Body | Formatted Text |
   | Cover、Image 1–4 | Image |
   | Link / Video / Embed / Audio URL | Link 或 Plain Text |
   | Embed Is Phone | Toggle |

   CSV 最后一列写着哪些图要从 `assets/work/` 手动上传（Biblely、WaterlooWorks、宣传册等，这些图旧网站上没有公开网址）。导入后可以删掉这一列。
2. **列表页 /work**：拖一个 **ProjectDeck**，宽 Fill、高 620。默认已经填好 11 个项目，链接都指向 `/work/<slug>`，和 CMS 的 slug 对应。没有封面的项目：
   - 在属性面板里给它上传 Cover，用 `assets/work/` 里的图；
   - 或者留空，它会自动显示成黑底文字卡。
3. **详情页模板 /work/:slug**：照 `work.js` 的 detail 结构排。
   - 顶部 Bar：← All work、编号、前一个 / 后一个（用 CMS 的 Previous / Next 链接）。
   - 两栏：左边是标题、Kick（Fraunces Italic）、Body、Stats、Role / Details、链接按钮；右边是 Cover。
   - 下面是两栏图库：Image 1–4、Video（Framer 原生 **Video** 组件）、YouTube（原生 **YouTube** 组件，绑 YouTube ID）、Embed（原生 **Embed** 组件，URL 绑 Embed URL；Embed Is Phone 为真时 9:16，否则 16:10）、Audio（Embed 组件，里面放 `<audio controls src="…">`）。
   - 每一块都设 **Visible → 绑定字段**，字段为空就自动隐藏。
   - 点图放大：图片加 **On Tap → Open Overlay**，Overlay 里放同一张大图，背景 Ink 88%。
   - 进场动画：Cover 加 Appear 效果，Scale 0.96 → 1、Opacity 0 → 1。

## 5. About

- **介绍**：左边竖版照片（`me-crop.jpg`），Position **Sticky** Top 100；右边 H1 "Hi, I'm Annora." 加四段 Lead，文案照抄 `about.html`。
  - 三格数字用 **CountUp**：8、5、30（suffix 分别为空、空、"+"）。
- **8 个工牌**：做一个 `Badge` 组件，结构是红色顶条 "HELLO, I'M / *Annora*"、中间写工作地点 + 小字、底部一个小孔，上方一条 1.5px 的挂绳。
  - 加 **Effects → Loop**：Rotate -2.5° ↔ 2.5°，5s，Mirror。8 个工牌的 Delay 依次错开 0.6s。
  - Hover：y 8、Scale 1.05。
  - 整排上方放一条 2px 的黑线，旋转 -0.4°。
- **5 顶帽子 + 3 条特质**：普通 Stack 就行；帽子 Hover 变黑底并上移 3。
- **名字翻牌**：做一个 `NameCard` 组件，两个 Variant：Front（行书字 + 拼音）和 Back（黑底，英文意思）。
  - Hover → Back，转场用 Spring；Back 的 Rotate Y 设 180°。
  - 父级开 3D 透视（Perspective 1000），两面都关掉 Backface。
  - 三张卡分别是：朱 *Vermilion* / 硯 *Inkstone* / 潤 *To nourish*。
- **横向滚动的成长经历**：
  1. 外层 Section 高 **340vh**；
  2. 里面放一个 **Sticky**（Top 0）、高 100vh 的 Frame，Overflow Hidden；
  3. 4 张卡排成横向 Stack（Track），Track 加 **Effects → Scroll Transform**，Trigger 设为外层 Section，滚动进度 0% → 100% 时 X 从 0 移到 -(Track 宽 − 视口宽)；
  4. 再加一条 2px 的 Zhu 色进度条，同样用 Scroll Transform 控制 Scale X 0 → 1。
  - Tablet / Phone 断点改成竖排，取消 Sticky。
- **评语**：两张卡，Rotate 分别为 -1.2° 和 1°，Hover 时转回 0°。
- **Off the clock**：
  1. 先拖一个 **DeskFiles**（宽 1296、高 640）到画布空白处，在属性面板给 `nail-set-v12.jpg` 上传 `assets/img/nails.jpg`；
  2. 再拖一个 **PeelReveal**，大小相同，把它的 **Underneath** 连到刚才那个 DeskFiles。

## 6. Lens

- 页头：H1 "Portraits on an old *CCD*." 加一段说明。
- 拖一个 **DraggablePrints**，宽 Fill、高 1000。在 Prints 里依次上传 7 张照片（`assets/img/lens-*.jpg`）。它会自动判断横竖：横版照片配横版相框，竖版配竖版。
  - 位置和角度默认已经摆好，可以在面板里微调。
  - 点照片会全屏放大。手机上会自动变成两栏网格。

## 7. Footer（做成组件，4 个页面共用）

1. 先排一个 `FooterContent`：Eyebrow "Say hi"、H2、三个链接（邮箱 / LinkedIn / Instagram）；右下角放竖排的 `朱硯潤` 签名、红色印章和一行小字说明。
2. 拖一个 **SealStamp**，宽 Fill、高 560，把 **Content** 连到 FooterContent。点击空白处会盖章，点链接不会。
3. 最底下一条细线，左边 "© 2026 Annora Zhu"，右边 "Hand-coded in Waterloo"。

## 8. 发布前检查

- [ ] 每个页面在 Phone 断点下都检查一遍（ProjectDeck 和 DraggablePrints 在窄屏会自动切换布局）
- [ ] 打开 Preview，首屏人像应该是行书字拼成的人形。如果显示的是普通照片，说明图片不允许读像素，Framer 自己托管的图片一般没问题
- [ ] 确认行书字体的网页授权
- [ ] 让两位同事确认评语的英文措辞
- [ ] 补全 4 个工牌（餐厅、甜品店、美甲店、电商）的具体职责
- [ ] Site Settings → SEO：标题 "Annora Zhu"，描述用 `index.html` 里的 meta description
