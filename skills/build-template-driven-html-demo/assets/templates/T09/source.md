# T09 极简分析台：来源与边界

## 参考来源

- Latitude 当前产品主页：<https://latitude.so/>
- Latitude 旧版分析工作区入口：<https://tools.latitude.so/>
- 第三方历史界面记录（只用于确认信息密度与布局类别）：<https://www.saasframe.io/examples/latitude-project-dashboard>

## 使用边界

本模板属于 **reference-only**。Latitude 的产品定位与界面已经变化，且这里没有取得可复用其产品代码或品牌资产的授权。因此本包只抽象以下通用网页设计模式：极简分析画布、窄浅色导航、细边界、命令式查询区、大型图表和数据表格。

本包的 HTML、CSS、JavaScript、中文文案、内联 SVG 图标和 Mock 数据均为独立实现。没有复制 Latitude 的名称、徽标、截图、插画、字体、产品文案、源代码、数据或专有组件。

## 运行与数据说明

- starter.html、tokens.css 与 interactions.js 不需要构建、网络、服务或第三方依赖。
- 最终生成时会把本地 CSS 与 JavaScript 内联为一个 HTML 文件。
- 页面中的工作区、运行记录、分析结果、成员、导出内容与状态变更均为用于交互演示的虚构 Mock 数据，不代表真实 AI 计算或外部数据源。
