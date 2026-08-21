# T02 来源与使用边界

## 参考来源

- 官方免费演示：https://coreui.io/demos/bootstrap/latest/free/
- Sidebar 组件文档：https://coreui.io/bootstrap/docs/components/sidebar/
- 颜色工具文档：https://coreui.io/bootstrap/docs/utilities/colors/
- 官方免费模板仓库：https://github.com/coreui/coreui-free-bootstrap-admin-template
- 上游免费代码许可证：MIT（以官方仓库当前 `LICENSE` 为准）

## 本模板与参考来源的关系

T02 只借鉴 CoreUI Free Bootstrap Admin Template 可见的网页视觉与组件语言：深灰侧边栏、白色顶栏、扁平边框卡片、多彩指标卡、面包屑和响应式 off-canvas 导航。当前目录内的 HTML、CSS 和 JavaScript 均为本项目独立编写，没有复制 CoreUI 代码、Logo、图片、图标文件、页面文案或演示数据，也没有引入其运行时依赖。

CoreUI PRO 为商业版本，本模板不复制、不引入、不声称提供任何 PRO 代码、组件或资产。如后续直接引入任何上游代码，必须重新核对具体文件的许可范围，并保留要求的版权和许可证文本。

## 开发参考方式

生成客户 Demo 时，以 `manifest.json` 中的 preserve / replace / avoid 规则、`tokens.css` 中的令牌与组件、`starter.html` 的页面结构、`interactions.js` 的交互约定为实现基准。不在运行时抓取官方站点，不把上游演示页面当作可直接复制的成品。

## Mock 数据

`starter.html` 和 `interactions.js` 中的企业名称、人员姓名、订单编号、金额、日期、统计数字和通知内容均为 Codex 临时构造的演示数据，不代表真实客户、业务或经营结论。生成正式 Demo 时，应按已确认开发文档整体替换。

## 禁止复用

- CoreUI 或其他第三方 Logo、商标、产品名称和品牌元素
- 上游演示站的图片、图标文件、网页文案、示例数据与源代码
- CoreUI PRO 或其他商业版本中未获授权的代码、组件和资产
- 客户真实姓名、联系方式、账号或未脱敏经营数据
- 无法确认授权范围的截图、字体、素材和脚本
