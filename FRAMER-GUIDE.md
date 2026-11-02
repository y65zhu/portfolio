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

Assets → Code → **+** → New Code File。**文件名要和下表完全一致**，把对应 `.tsx` 的内容整个粘进去。按顺序建，因为后面的文件会 import 前面的：

| 顺序 | 文件 | 用在哪 |
|---|---|---|
| 1 | `Assets` | 共享字体和颜色，其他文件都要用 |
| 2 | `InkScape` | **全站的水墨画**：用朱硯潤画成的山水，石头代表硯，水代表潤，朱红太阳代表朱 |
| 3 | `InkPortrait` | 首屏的文字人像 |
| 4 | `HomeHero` | **首页首屏整段** |
| 5 | `SiteFooter` | **页脚整段**，包括横排签名、隶书印章、点击盖章 |
| 6 | `Doors` | 首页三扇门 |
| 7 | `AboutHero` | **About 页开头整段** |
| 8 | `OriginsScroll` | About 页横向滚动的成长经历 |
| 9 | `PeelReveal` · `DeskFiles` | Off the clock：掀开水墨画看桌面 |
| 10 | `ProjectDeck` | Work 页叠卡 |
| 11 | `DraggablePrints` · `CountUp` · `SealStamp` | Lens 照片、数字滚动、旧版盖章（已被 SiteFooter 取代） |

**整段组件**（HomeHero、Doors、AboutHero、OriginsScroll、SiteFooter）的用法都一样：
1. 拖到页面上；
2. **Width 设为 Fill，Height 设为 Auto（Fit）**；
3. 外面不要再套 Stack 或加 padding，留白、最大宽度和手机布局都由组件自己处理。

照片默认读取 GitHub 上的图（`me-crop.jpg`、`beijing.jpg` 等），不用上传；想换图就在右侧面板上传。

## 2. 导航（一个 Component，4 个 Variant）

1. 做一个 `Nav` 组件：左边 `朱`（行书，Zhu 色）+ "Annora Zhu"；中间是胶囊形 tab 组（Stack，padding 4，圆角 999，描边 Rule）；右边是黑色胶囊按钮 "Say hi"。
2. 建 4 个 Variant：**Home / Work / About / Lens**。每个 variant 里，当前页那个 tab 的背景是 Ink、文字是 Paper，其他 tab 透明。
3. 每个页面都放这个 Nav：Position **Fixed**、Top 0、宽 100%，再选好对应的 variant。
4. 滚动后出现半透明背景：Nav 加 **Effects → Scroll → Section**，滚过 Hero 后背景变成 Paper 82% + Background Blur 10。
5. **页面切换动画**：Site Settings → **Page Transitions**（或者每个 Link 的 Transition），用 Fade 加轻微上移（y 14 → 0），时长 0.4s，曲线 ease-out。

## 3. Home

从上到下只放四块，全部 Width = Fill：

1. **HomeHero**：左边是标题和简介，右边是 3:4 的文字人像，人像下面是说明文字，背后衬一道淡淡的水墨山。手机上自动改成上下排。
2. **Intro**：原生做，两栏 Grid（左 5 份 / 右 7 份）。左边放 Eyebrow 加 H2，右边放两段 Lead（Fraunces 22，行宽最多 640）和链接。文案照抄 `index.html` 的 `.intro`。
3. **Doors**：三张 4:5 的卡排成一行，手机上排成一列。
4. **SiteFooter**。

段与段之间的间距统一 140（手机 96）。

## 4. Work

1. **CMS**：CMS → New Collection "Projects" → **Import CSV** → 选 `framer/projects-cms.csv`。字段类型这样设：

   | 字段 | 类型 |
   |---|---|
   | Body | Formatted Text |
   | Cover、Image 1–4 | Image |
   | Link / Video / Embed / Audio URL | Link 或 Plain Text |
   | Embed Is Phone | Toggle |

   CSV 最后一列写着哪些图要从 `assets/work/` 手动上传（Biblely、WaterlooWorks、宣传册等，这些图旧网站上没有公开网址）。导入后可以删掉这一列。
2. **列表页 /work**：拖一个 **ProjectDeck**，宽 Fill、高 620。默认已经填好 11 个项目，链接都指向 `/work/<slug>`，和 CMS 的 slug 对应。
   - 新项目 DoFocus、Biblely、AI Certificate 排在中间，进页面时 DoFocus 默认翘起。想换成别的，改右侧的 **Raised at rest**（从 0 开始数）。
   - 鼠标从左往右扫会一张一张地切换；触控板左右轻扫一下只走一张；键盘左右键也能切换。
   - 没有封面的项目：
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

从上到下：

1. **AboutHero**：左边是 3:4 的照片，滚动时固定不动；右边是标题、四段文字和三格会滚动的数字。要加粗的词用 `**` 包起来。
2. **8 个工牌**、**帽子 + 特质**、**名字翻牌**、**评语**：仍然原生做，规则见下面。
3. **OriginsScroll**：Width = Fill。卡片上原来的大汉字已经换成了水墨小画，每张卡的山形不同（改 **Painting seed** 就会换一种）；最后一张带朱红太阳。
4. **Off the clock**：先拖一个 **DeskFiles**（宽 1296、高 640），在属性面板给 `nail-set-v12.jpg` 上传 `assets/img/nails.jpg`。再拖一个同样大小的 **PeelReveal**，把它的 **Underneath** 连到 DeskFiles。盖在上面的是一幅"我的名字画成的山水"，附一行英文解释。
5. **SiteFooter**。

原生部分的规则：
- 内容最大宽 1260，左右留白 90（手机 20）。
- 多列内容用 **Grid**，不要用纵向 Stack 一路排下去：
  - 工牌 4 列 × 2 行，手机 2 列；
  - 帽子横排、可换行；
  - 三条特质 3 列；
  - 翻牌 3 列，每张 1:1.2；
  - 评语 2 列。
- 文字：正文用 Inter 17，说明用 Inter 15，**mono 小字最小 13**。

## 6. Lens

- 页头：H1 "Portraits on an old *CCD*." 加一段说明。
- 拖一个 **DraggablePrints**，宽 Fill、高 1000。在 Prints 里依次上传 7 张照片（`assets/img/lens-*.jpg`）。它会自动判断横竖：横版照片配横版相框，竖版配竖版。
  - 位置和角度默认已经摆好，可以在面板里微调。
  - 点照片会全屏放大。手机上会自动变成两栏网格。

## 7. Footer

每个页面最底下放一个 **SiteFooter**，Width = Fill，旧的 FooterContent 加 SealStamp 可以删掉。
- 左边：Say hi、大标题、邮箱、LinkedIn、Instagram。
- 右边：横排的行书"朱硯潤"，旁边一枚**白文隶书印章**（硯上潤下，像真的石章盖出来的效果）。下面是拼音和一句英文说明。
- 底部：一道水墨山，再往下是版权行。
- 在空白处点一下会盖一枚同样的印章，点链接不会。

## 8. 发布前检查

- [ ] 每个页面在 Phone 断点下都检查一遍（ProjectDeck 和 DraggablePrints 在窄屏会自动切换布局）
- [ ] 打开 Preview，首屏人像应该是行书字拼成的人形。如果显示的是普通照片，说明图片不允许读像素，Framer 自己托管的图片一般没问题
- [ ] 确认行书字体的网页授权
- [ ] 让两位同事确认评语的英文措辞
- [ ] 补全 4 个工牌（餐厅、甜品店、美甲店、电商）的具体职责
- [ ] Site Settings → SEO：标题 "Annora Zhu"，描述用 `index.html` 里的 meta description
