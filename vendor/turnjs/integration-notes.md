# 第九版：Turn.js 离线集成说明

下载日期：2026-10-10。上游仓库：[blasten/turn.js](https://github.com/blasten/turn.js)，固定提交 `08c1f6599a1412b145c7bf645a1f28c14db12742`（2013-05-04）。这里使用仓库第 3 版，未下载商业第 4 版。完整许可见 `license.txt`；本地课堂作业使用，保留原作者版权与全部许可文件。jQuery 3.7.1 来自官方 `code.jquery.com`，MIT 许可见 `jquery-LICENSE.txt`。

## 按顺序加载

```html
<script defer src="./vendor/turnjs/jquery-3.7.1.min.js"></script>
<script defer src="./vendor/turnjs/turn.min.js"></script>
```

在这两个脚本之后加载书架脚本。所有文件本地保存，不依赖 CDN。源文件 `turn.js` 仅用于查阅，运行时加载 `turn.min.js` 即可。

## 第 3 版已有 API

```js
const $book = jQuery(bookElement);
$book.turn({ width: 820, height: 560, display: 'double', page: 2,
  duration: 550, gradients: true, acceleration: true,
  when: { turned(event, page, view) { /* 更新页码与按钮 */ } }
});
$book.turn('page');                // 当前页
$book.turn('page', 4);             // 指定页
$book.turn('next');
$book.turn('previous');
$book.turn('view');                // 当前左右页；空白页用 0 表示
$book.turn('pages');               // 总页数
$book.turn('animating');
$book.turn('stop');
$book.turn('disable', true);       // 停用拖动/页角响应
$book.turn('disable', false);
$book.turn('display', 'single');   // 窄屏单页
$book.turn('display', 'double');
$book.turn('size', 820, 560);       // 数字：整本书的宽度、单页高度
```

先显示读书窗口，再测量容器可用宽高并初始化；不要在隐藏容器中以 0 尺寸初始化。页脚需保留“上一页 / 下一页 / 原文 PDF / 关闭”，不能只靠拖页角。双页模式的 `next` 是下一对页面，不等于页码加 1。

第 3 版**没有** `turn('destroy')`、`turn('options', ...)`、`autoCenter`、`zoom`、`.hard`、`.fixed`；这些不是本文件的可用功能。封面可用自己的 CSS 做厚度与书脊，翻页内页仍按普通纸页处理。第 1 页在双页模式只占右半边；书架封面已经独立呈现时，阅读窗口可以从第 2 页摘要开始，避免把“封面右半幅”误认为整本书没居中。

## 生命周期与简洁降级

第 3 版给 document 绑定未命名空间的移动和抬手事件，没有公开销毁接口。建议有限的几本书各自只初始化一次、缓存并复用；关闭时 `stop`、`disable(true)` 并隐藏，再打开时重新设置 `size/display` 并 `disable(false)`。不要为每次点击反复创建实例，也不要用 `jQuery(document).off()` 清掉其他功能的监听。

检测到 `prefers-reduced-motion: reduce`、依赖缺失、初始化异常或容器过窄时，直接使用普通单页阅读器，按钮替换当前页内容即可，不必加载翻页动画。不能使用 `duration: 0`：第 3 版缓动计算会除以 duration，页角部分还写死了 500 / 800 毫秒；单靠 CSS 禁用过渡也不会停止其 JS 定时动画。

## 来源与静态核验

官方首页 `https://www.turnjs.com/` 在本次网页读取中超时，未做视觉观察。参考来自可核验的 GitHub README、Wiki、源代码和官方 `demos/magazine` / `demos/magazine_single` HTML：前者固定双页，后者固定单页，均有页角翻动和左右键导航。书架外观是本项目新增的浏览入口，不应声称直接复制了未能读取的官方首页布局。

源代码未使用 `jQuery.browser`、`.live()`、`.die()`、`.size()` 等已移除接口；它使用的 `bind`、`extend`、`inArray`、`Event` 在 jQuery 3.7.1 中仍提供。3 个 JavaScript 文件的 `node --check` 均通过。这里只完成依赖与源代码静态核验，实际显示、触屏和键盘效果需在网站浏览器检查中验证。

参考：[第 3 版 README](https://github.com/blasten/turn.js/blob/08c1f6599a1412b145c7bf645a1f28c14db12742/readme.md)、[API Wiki](https://github.com/blasten/turn.js/wiki/Reference)、[非商业许可](https://github.com/blasten/turn.js/blob/08c1f6599a1412b145c7bf645a1f28c14db12742/license.txt)。原文件与 SHA-256 列于网站目录的 `第三方组件说明.json`。
