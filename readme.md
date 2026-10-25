# Blue theme · 个人阅读版

基于 [SiriusXT/trilium-theme-blue](https://github.com/SiriusXT/trilium-theme-blue)，保留蓝色界面、米黄色浅色背景、霞鹜文楷和彩色树形引导线，重新整理长文排版与明暗主题的交互状态。适用于以 TriliumNext `next-light` / `next-dark` 为基础的自定义主题（原主题要求 >= 0.101.1）。

## 使用

两个 CSS 都是完整、独立的文件，不依赖额外 CSS、构建步骤或外部在线字体。

| 文件 | CSS 笔记属性 |
| --- | --- |
| `blue-theme-light.css` | `#appTheme=blue-theme-light #appThemeBase=next-light` |
| `blue-theme-dark.css` | `#appTheme=blue-theme-dark #appThemeBase=next-dark` |

1. 在 Trilium 创建 CSS 类型的代码笔记，粘贴对应文件的完整内容。
2. 添加上表中的属性，在选项的外观设置中选择主题。
3. 修改主题或图片脚本后，通过 Ctrl+R（macOS 为 Cmd+R）重新加载。

不要同时将两份 CSS 标记为 `#appCss`；应通过主题选择使用其中一份。

## 设计方案

参考 [Primer 的标题层级](https://primer.style/product/components/heading/)、[Material 的字体角色与对比度](https://m3.material.io/styles/typography/applying-type)及 [GOV.UK 的标题规范](https://design-system.service.gov.uk/styles/headings/)。以下配色与布局是为本主题设计的方案，并非直接复制这些设计系统的样式。

层级先通过字号、间距和边线表达，颜色作为辅助。移除原来的白字、文字阴影和发光色块；每个标题都有独立字号，不要求读者仅凭颜色区分层级。保留 Trilium 设置中的 Markdown `#` 前缀，将它们缩小；不修改笔记本身的标题语义。

| 层级 | 相对正文字号 | 视觉处理 | 浅色文字 / 深色文字 |
| --- | --- | --- | --- |
| H1 | 1.85em | 蓝色大标题、细底线 | `#244b67` / `#d6e6f4` |
| H2 | 1.50em | 淡蓝底、左侧边线 | `#254f6c` / `#b8d9f3` |
| H3 | 1.30em | 青绿色文字、左侧边线 | `#2f6259` / `#a8d5c7` |
| H4 | 1.15em | 暖棕 / 沙金色文字 | `#79542b` / `#dfc29b` |
| H5 | 1.05em | 灰紫色文字 | `#625375` / `#c7b8de` |
| H6 | 1.00em | 灰蓝色文字 | `#565e64` / `#b8c3cc` |

H2 的浅色底为 `#e1e9e8`，深色底为 `#273847`；其余标题使用正文底色。在默认配色下，H1–H6 的文字对比度浅色最低为 **5.62:1**、深色最低为 **8.18:1**，均高于普通文字 4.5:1 的参考值。链接保持下划线，并分别使用较深的蓝色和较亮的蓝色。参考 [WCAG 对比度说明](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)。

### 字体与阅读节奏

- 主界面与笔记树使用 `1.1rem`，正文使用 `1.2rem`，代码编辑区使用 `1rem`，避免嵌套 `em` 反复放大。浏览器根字号 16px 时分别约为 17.6px、19.2px、16px；页面缩放仍正常生效。
- 保留 `LXGW WenKai` / `LXGW WenKai Mono`，并补充楷体、系统等宽字体回退。设备没有安装文楷时将使用回退字体；若要跨设备保持一致，可参考 [Trilium 的字体资源说明](https://docs.triliumnotes.org/user-guide/theme-development/reference#custom-fonts)配置字体。
- 正文行高为 1.75，普通顶层段落保留两字符首行缩进及两端对齐；列表、任务清单、表格、引用和图注使用自然对齐。
- 正文排版限定在编辑态与只读态容器，标题装饰排除笔记列表卡片、笔记本标题及嵌入笔记的标题控件。
- 内容宽度继续由 Trilium 的外观设置管理，避免主题覆盖全宽笔记或分栏。以默认正文字号阅读中文长文时，可先试 900–960px 并启用居中，再按屏幕调整。参见 [内容宽度设置](https://docs.triliumnotes.org/user-guide/concepts/ui/content-width)。

### 侧栏、焦点和打印

- 左侧栏沿用 `../../../custom/background.png`。浅色叠加 90% 的浅色遮罩，深色叠加 94% 的深色遮罩，减弱纹理并保护文字对比度；缺少图片时仍有主题底色。相对资源路径保留对部署子路径的兼容。
- 树节点的悬停与活动状态使用不同背景，活动节点还有持久边线；彩色分支线只承担结构提示。
- 恢复可见的键盘焦点与编辑器表格焦点，不再将全局焦点颜色设为透明，也不隐藏侧栏的滚动条。
- 滚动条使用基础主题的颜色变量，代码块可保留自己的局部配色；标签页恢复省略号。
- 打印时，编辑态和只读态的 H1–H6 都转换为黑字、透明背景，保留字号层级与标题后的分页约束。取消整组 `all: revert`，不隐藏笔记标题或警告内容。
- 减少动画的规则仅在系统启用 `prefers-reduced-motion` 时应用。

可在 CSS 的变量区调整 `--blue-reading-line-height`、`--blue-paragraph-indent`、`--blue-wallpaper-overlay` 和 `--blue-heading-*`。不需要纹理时，将 `--blue-wallpaper-image` 改为 `none`；不需要首行缩进时，将 `--blue-paragraph-indent` 改为 `0`。

## 可选的深色图片脚本

在 JavaScript 代码笔记中粘贴 `Dark-mode-img-color-conversion.js`，添加 `#widget`。给某篇笔记添加 `#disableAdjustImage`，可对该笔记关闭图片反色，保留深色高亮适配。

- 图片在加载和识别期间正常显示；仅对白色不透明背景占比高的图片应用反色。照片等未命中的图片不再统一降低亮度。
- 通过图片加载事件及 DOM 观察处理粘贴、懒加载和换图，取代固定时间的扫描和轮询。
- 采样最多 64×64 像素，避免大图造成不必要的像素遍历；透明图、读取失败和损坏图片保留原样。
- 高亮转换只作用于处于深色模式的当前笔记面板，浅色模式、其他界面和打印不会被修改。观察器在切换笔记和销毁时清理，多个分栏各自管理。

白底比例仍属于启发式判断：白底照片也可能命中，可使用上述标签关闭。脚本不修改原始图片文件。

## 维护与验证

仓库继续使用原有文件结构，两份 CSS 可分别直接粘贴使用。公共排版与交互规则在两份文件中保持一致，主题特有的配色集中在文件前部。

本轮在隔离 Chrome 页面中验证了明暗配色、H1–H6 对比度、编辑与只读一致性、焦点、选择器边界、列表和表格缩进、滚动条、树节点状态及打印；另验证了图片新增、换源、透明图、读取失败、禁用标签、主题切换与观察器清理。临时验证页面以 TriliumNext v0.101.1 的关键样式为基础，不等同于完整应用集成测试。测试、预览与构建辅助文件不保留在仓库中。

## 原始主题截图

以下图片来自上游原始主题，不代表本次阅读版的最新效果。

![原始浅色主题](./img/screenshot1.png)
![原始深色主题](./img/screenshot2.png)
