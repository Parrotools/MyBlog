# Parrotools.top from 0 to 1
# 设计思路
对于这个博客应怎么做，我想了很久也没能得出一个很好的答案，做二次元风的吧，我又只喜欢鸭鸭，而且从头到尾都是同一个人物也太乏味了，如果只是拿几个组件拼一下又显得敷衍，还不如不做，最后呢，还是想到用MC的元素，因为感觉自己好像确实最喜欢MC，而且做起来也不花哨，不会有视觉疲劳，选择的主题和内容都是MC风的，但是又不完全是反应MC的，只把它当作补充和点缀，我觉得还是努力做到了平衡的。

## 用到的技术

采用的**NextJS**：React 负责前端，Node（route handler + server action）负责后端，**Prisma + SQLite** 负责数据。公开站、后台管理、API 全在一个进程里，一次部署就完事。
## Intro：TNT爆炸

首页 intro 用的是 **Three.js + WebGL**，物理是 **cannon-es** 的真实刚体模拟——不是脚本化缓动，是真砸。

## 视差Banner
视差Banner的灵感主要来源于B站的首页，鼠标移动时，云层、太阳、月亮、星星都会有不同的位移，云层的位移最大，太阳、月亮、星星的位移最小，鼠标不动时，云层会缓慢移动，鼠标移动时，云层会加速移动。由于博客主要任务是要输出大量的信息，如果不用视差Banner的话，博客就很单调了，就只是几个表格，但是加上视差之后，会有一些立体感。
一个比较好的视差Banner: [冰岩作坊前端](https://www.bingyan.net/)。这个是套了很多很多层的，设计上很复杂，但是效果确实精彩绝伦

## 那些"借鉴"来的动画

大量动画直接致敬了 [JIEJOE-WEB-Tutorial](https://github.com/JIEJOE-WEB-Tutorial) 系列

### 扑克轮播：抽牌换位

来源：[001-poker-slides](https://github.com/JIEJOE-WEB-Tutorial/001-poker-slides)。五张卡片扇形排开，点击任意一张它会飞到最前面，原来的最前一张退到队尾，飞行途中做一次翻转，露出牌背再翻回来，950ms：

```ts
const SLOTS = [
  "rotate(-8deg)",
  "rotate(-4deg) translate(55%, -8%)",
  "rotate(0deg) translate(110%, -13%)",
  "rotate(4deg) translate(165%, -15%)",
  "rotate(8deg) translate(220%, -13%)",
];
```

### 六边形矩阵：跳页幕布的底色

来源：[012-hexagons-matrix](https://github.com/JIEJOE-WEB-Tutorial/012-hexagons-matrix)。Canvas 画六边形网格，随机错峰弹出再缓慢脉冲。：

```ts
function hash(i: number): number {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
}
```

### 404 / 403 / 500 / 400 的 ASCII 动画

来源：[015-ascii-animation](https://github.com/JIEJOE-WEB-Tutorial/015-ascii-animation)。亮度场映射到字符、按帧画在 canvas 上，13 FPS。每种错误页一个专属场：404 是漩涡虚空，403 是方环，500 是火焰，400 是静电流：

```ts
const RAMP = " ·.:;+=xX#@";
```

### 页面跳转幕布

点内部链接先盖一层幕布，路由在底下换，然后幕布揭开。**这纯粹是为了展示，不是为了加载资源**——几个 card 能有多少资源啊，有没有可能这个加载动画比实际的页面用的东西还多(

## 对于hover等小东西

- **hover**：闪电流动边框 + 慢渐变动画，部分元素有 sliding 效果
- **SVG 描边动画**散落各处
- **TNT 上指针的变化**
- **卡片刻意不套很多层**：扁平就完事，渲染便宜，看着也干净
- 关于页的 hotbar、玩家属性条、3D 头像

## More:

响应式整体做了，但导航栏在极端宽度下会有些 bug——**不修了**，以及categories这个page会有些问题，cards的布局不是很合理，不过无所谓了。

