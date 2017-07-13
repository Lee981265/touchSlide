/*
*	author: Ponicy
*	time: 	2017.7.12
*/ 
;(function (w) {

	function Touchslide (obj) {
		this._warp = document.querySelector(obj.warp);			//容器节点节点
		this._box = this._warp.querySelectorAll(obj.box);		//滚动列表节点
		this._index = 1;										//切换索引
		this._len = this._box.length;							//dom个数
		this._h = parseInt(getComputedStyle(this._warp.parentNode, 'height').height); //容器的高度
		this._w = parseInt(getComputedStyle(this._warp.parentNode, 'width').width);  //容器的宽度
		this.isInit = true;		//是否是初始化
		this.animate = obj.animate / 1000;		//动画时间
		this.arrow = obj.arrow == 0 ? obj.arrow : 1;   //滚动方向   0 是横向， 1是纵向
		this.showMeau = obj.showMeau !=undefined ? obj.showMeau : true;  // 是否显示索引
		this.carousel = obj.carousel !=undefined ? obj.carousel : false;  // 是否启动轮播
		this.timing = obj.timing;  //轮播时间间隔，单位毫秒
		this.meau = null; 	//菜单列表节点
		this.version= "1.0.0";
	};
	/*
		@ Y 		开始的y轴位置
		@ lastY   	结束的y轴位置
		@ X 		开始的x轴位置
		@ lastX		结束的x轴位置
		@ moveX 	touchmove时的横向位置
		@ moveY 	touchmove时的纵向位置
	*/ 
	// var arrow = 1;  //滚动方向  1竖向 ，0横向
	var Y, lastY, X, lastX, moveX, moveY;
	var oldX = 0;   //手指滑动结束时的横向位置
	var oldY = 0;	//手指滑动结束时的纵向位置
	var isReset = true;   //移动过程的方向，true为向右，false为向左，用于是否取消滚动
	var flag = true;   //阻止连续滑动
	var _sTime = null;  //定时器

	// 初始化上下滚动
	function addClass(box, h) {
		// var self = this;
		for(var i=0; i<box.length; i++) {
			box[i].style.height = h + 'px';
		};
	};

	// 初始化左右滚动
	function addWidth (box, w){
		for(var i=0; i<box.length; i++) {
			box[i].style.width = w + 'px';
		};
	};

	// 返回手指滑动的距离
	function returnPosition (node, x, _x) {
		var a = node.getAttribute('style');
		var test = /transform.+;$/;
		var str = a.match(test)[0];  //匹配的数据
		// var _num = /\(.+\)/;
		var _onlyNum = /-[0-9].+[0-9]/;   //dom当前的位置px值
		var _px = str.match(_onlyNum)[0];
		// console.log(parseInt(_px));
		var _X = parseInt(_px) + parseInt(x - _x);
		return _X;
	}

	// 创建圆点菜单索引
	function createMeau (node, n, arrow) {
		var meau = document.createElement('div');
		// meau.className = 'touch-menu';
		var ul = document.createElement('ul');
		ul.id = "touch-meau";
		// if()
		if(arrow){
			meau.className = 'touch-menu touch-line';
		}else{
			meau.className = 'touch-menu touch-arrow';
		}
		for(var i=0; i<n; i++){
			var li = document.createElement('li');
			if(i==0){
				li.className = 'active';
			}
			li.index = i;
			ul.appendChild(li);
		};
		meau.appendChild(ul);
		node.parentNode.appendChild(meau);
	};

	// 往容器添加头尾各添加一个dom节点
	Touchslide.prototype.addNode = function () {				
		var _first = this._box[0].cloneNode(true);
		var _last = this._box[this._len - 1].cloneNode(true);
		this._warp.appendChild(_first);
		this._warp.insertBefore(_last, this._warp.childNodes[0])
		if(!this.arrow){
			_first.style.width = this._w + 'px';
			_last.style.width = this._w + 'px';
		}else{
			_first.style.height = this._h + 'px';
			_last.style.height = this._h + 'px';
		}
	};

	Touchslide.prototype.init = function () {
		// console.log(Touchslide);
		createMeau(this._warp, this._len, this.arrow);
		// 保存索引节点
		this.meau = document.getElementById('touch-meau').querySelectorAll('li');
		this.addNode(this._box, this._h, this._w);
		if(!this.arrow){
			addWidth(this._box, this._w)
			this.layout();
			this.translateXDom(this._warp, this._index, this._w)
		}else{
			addClass(this._box, this._h);
			this.translateYDom(this._warp, this._index, this._h);
		}
		if(!this.showMeau){
			document.getElementById('touch-meau').style.display = 'none';
		};
		document.getElementById('touch-meau').addEventListener('click', this.show.bind(this), false);
		this._warp.addEventListener('touchmove', this.move.bind(this), false);
		this._warp.addEventListener('touchstart', this.start.bind(this), false);
		this._warp.addEventListener('touchend', this.end.bind(this), false);
		this.isInit = false;
		// 自动轮播
		if(this.carousel) {
			this.startTime();
		};
		var self = this;
		window.onresize = function () {
			// document.querySelector('.touchSlide').removeChild(document.querySelector('.touch-menu'));
			self.destroy();
			self.init();
		}

	};

	// 解除绑定
	Touchslide.prototype.destroy = function () {
		document.querySelector('.touchSlide').removeChild(document.querySelector('.touch-menu'));
		this._warp.removeEventListener('touchmove', this.move.bind(this), false)
		this._warp.removeEventListener('touchstart', this.start.bind(this), false);
		this._warp.removeEventListener('touchend', this.end.bind(this), false);
		clearTime();
		this._h = window.innerHeight;
		this._w = window.innerWidth;
	};

	// 点击跳到相应的页面
	Touchslide.prototype.show = function (e) {
		if(e.target.nodeName != 'LI'){return false;}
		clearTime()
		if(this.arrow){
			this.translateYDom(this._warp, e.target.index + 1, this._h);
		}else{
			this.translateXDom(this._warp, e.target.index + 1, this._w);
		};
		if(e.target.index == 0){
			this._index = 1;
		}else if( e.target.index == this._len - 1){
			this._index = this._len;
		}else{
			this._index = e.target.index + 1;
		}
		this.meauClass(this._index);  // 0 1 2 3 4 5
		var self = this;
		if(this.carousel) {
			this.startTime();
		}
	}

	// 清除定时器
	function clearTime (){
		clearInterval(_sTime);
		_sTime = null;
	}

	// 启动定时器
	Touchslide.prototype.startTime = function () {
		var self = this;
		_sTime = setInterval(function(){
			self.autoPlay();
			self.meauClass(self._index);
		},this.timing);
	}

	// 初始化dom结构
	Touchslide.prototype.layout = function () {
		this._warp.style.width = this._w * (this._len+2) + 'px';
	}

	// 纵向滚动
	Touchslide.prototype.translateYDom = function (node, n, h) {
		var self = this;
		flag = false;
		if(n == 1 && this.isInit){
			node.style.transitionDuration = '0s';
			node.style.transform = 'translateY(-'+ h*n +'px)';
		}else{
			node.style.transitionDuration = this.animate + 's';
			node.style.transform = 'translateY(-'+ h*n +'px)';
		}
		// console.log(n);
		if(n==this._len + 1){
			setTimeout(function(){
				node.style.transitionDuration = '0s';
				node.style.transform = 'translateY(-'+ h*1 +'px)';
			},this.animate*1000);
			this._index = 1;
		};
		if(n==0){
			setTimeout(function(){
				node.style.transitionDuration = '0s';
				node.style.transform = 'translateY(-'+ h*self._len +'px)';
			},this.animate*1000);
			this._index = this._len;
		};
		setTimeout(function(){
			flag = true;
		},this.animate*1000)
	};

	// 横向滚动
	Touchslide.prototype.translateXDom = function (node, n, w) {
		// debugger
		var self = this;
		flag = false;
		if(n == 1 && this.isInit){
			node.style.transitionDuration = '0s';
			node.style.transform = 'translateX(-'+ w*n +'px)';
		}else{
			node.style.transitionDuration = this.animate + 's';
			node.style.transform = 'translateX(-'+ w*n +'px)';
			// node.style.transitionDuration = this.animate + 's';
			// node.style.transform = 'translateY(-'+ h*n +'px)';
		}
		// node.style.transitionDuration = '0.5s';
		// node.style.transform = 'translateX(-'+ w*n +'px)';
		// console.log(this.isInit);
		if(n==this._len + 1){
			setTimeout(function(){
				node.style.transitionDuration = '0s';
				node.style.transform = 'translateX(-'+ w*1 +'px)';
			},this.animate*1000);
			this._index = 1;
		};
		if(n==0){
			setTimeout(function(){
				node.style.transitionDuration = '0s';
				node.style.transform = 'translateX(-'+ w*self._len +'px)';
			},this.animate*1000);
			this._index = this._len;
		};
		setTimeout(function(){
			flag = true;
		},this.animate*1000)
	};
	
	// 手指触摸移动
	Touchslide.prototype.move = function (e) {
		if(!this.arrow){  //左右
			moveX = e.touches[0].pageX;
			var _X = returnPosition(this._warp, moveX, oldX);
			if(moveX > oldX){
				isReset = true;
			}else{
				isReset = false;
			}
			if(flag && Math.abs(oldX-X) > Math.abs(oldY - Y) + 10) {   //只有左右滑动的距离远大于上下滑动的距离才生效
				this._warp.style.transitionDuration = '0s';
				this._warp.style.transform = 'translateX('+ _X +'px)';
			}
			oldX = moveX;
			oldY = e.touches[0].pageY;
		}else{   //上下
			moveY = e.touches[0].pageY;
			var _Y = returnPosition(this._warp, moveY, oldY);
			if(moveY > oldY){
				isReset = true;
			}else{
				isReset = false;
			}
			if(flag && Math.abs(oldY - Y) > Math.abs(oldX- X)+10) {
				this._warp.style.transitionDuration = '0s';
				this._warp.style.transform = 'translateY('+ _Y +'px)';
				
			}
			oldY = moveY;
			oldX = e.touches[0].pageX;
		}
	};

	// 手指触摸开始
	Touchslide.prototype.start = function (e) {
		e.preventDefault();
		Y = e.touches[0].pageY;
		X = e.touches[0].pageX;
		oldX = e.touches[0].pageX;
		oldY = e.touches[0].pageY;
		clearTime();
	};

	// 手指触摸结束
	Touchslide.prototype.end = function (e) {
		// var self = this;
		lastY = e.changedTouches[0].pageY;
		lastX = e.changedTouches[0].pageX;

		if(this.arrow && Y - lastY > 0 && flag && Math.abs(lastY-Y) > Math.abs(lastX - X)) {  //向上滚动
			if(isReset){
				this.translateYDom(this._warp, this._index, this._h);
			}else{
				this._index += 1;
				this.translateYDom(this._warp, this._index, this._h);
			}
		};
		if(this.arrow && Y - lastY < 0 && flag && Math.abs(oldY-Y) > Math.abs(oldX - X)) {
			if(isReset){
				this._index -= 1;
				this.translateYDom(this._warp, this._index, this._h);
			}else{
				this.translateYDom(this._warp, this._index, this._h);
			}
		};
		if(!this.arrow && X - lastX > 0 && flag && Math.abs(lastX-X) > Math.abs(lastY - Y)) {  //向左滚动
			if(isReset){
				this.translateXDom(this._warp, this._index, this._w);
			}else{
				this._index += 1;
				this.translateXDom(this._warp, this._index, this._w);
			}
		}
		if(!this.arrow && X - lastX < 0 && flag && Math.abs(oldX-X) > Math.abs(oldY - Y)) {	//向右滚动
			if(isReset){
				this._index -= 1;
				this.translateXDom(this._warp, this._index, this._w);
			}else{
				this.translateXDom(this._warp, this._index, this._w);
			}
		};
		this.meauClass(this._index);
		// 启动定时器
		if(this.carousel) {
			this.startTime();
		}
	};

	// 轮播
	Touchslide.prototype.autoPlay = function () {
		this._index += 1;
		if(this.arrow){
			this.translateYDom(this._warp, this._index, this._h);
		}else{
			this.translateXDom(this._warp, this._index, this._w);
		};
	}

	// 对索引添加样式识别当前位置
	Touchslide.prototype.meauClass = function (n) {  // 0 1 2 3 4 5
		for(var i=0; i< this._len; i++) {
			this.meau[i].className = '';
		};
		this.meau[n-1].className = 'active';
	} 


	w.Touchslide = Touchslide;

})(window)