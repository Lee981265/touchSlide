# touchSlide
基于原生js的移动端滚屏H5; 可用于活动H5页面; 也可用于轮播图

### 引入方式
```
<link rel="stylesheet" type="text/css" href="./css/touchSlide.css"><script src="./js/touchSlider.js">
```

### 使用方法

```
var touch = new TouchSlide({
	warp: '.touchwarp',
	box: '.box',
	showMeau: false
})
```

### 模板结构
```
<div class="touchSlide">
	<div class="touchwarp clearfix">
		<div class="slidebox">1</div>
		<div class="slidebox">2</div>
		<div class="slidebox">3</div>
		<div class="slidebox">4</div>
		<div class="slidebox">5</div>
	</div>
</div>
```

### 参数说明

| params | val | 说明 |
|------|-------|-------|
| warp | class | 容器的class |
| box  | class | 列表的class |
| animate | int | 动画时间，滚动的时间，单位毫秒 |
| arrow | int | 滚动的方向，1为上下，0为左右，默认为1 |
| carousel | boolean | 是否启动自动轮播模式，默认为false, 必须和timing同时设定 |
| timing | int | 轮播间隔时间 |
| showMeau | boolean | 是否显示索引，默认值为true |
