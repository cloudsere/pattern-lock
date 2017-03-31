/*
* @Author: heqingqiu
* @Date:   2017-03-26 09:56:57
* @Last Modified by:   cloudseer
* @Last Modified time: 2017-03-29 21:48:20
*/

'use strict';
function init(){	
	var passArray = [],//用来存储活动密码
		certainArray = '',//存储确定密码
		flag = false, //鼠标按下时flag变为true，开始记录密码
		touchFlag = false,//用来检测当前的touchPassMove事件是否有效
		testPassword = false,//是否进入验证模式
		arrLimitLength = 5,//最短的密码长度
		r = 50,//圆圈的直径
		canvas = document.getElementById('myCanvas'),//画布
		context = canvas.getContext('2d'),//画布的上下文
		passWordContainer = document.getElementsByClassName('password')[0],//用以绑定事件
		passCircleEl = document.getElementsByClassName('passwordCircle');

	var circleCoord = calculateCircleCoord();//得到每个圆圈的坐标，在每次改变窗口大小时要重新计算
	window.addEventListener('resize',function(){circleCoord = calculateCircleCoord();},false);

	//webkit的touch事件
	//touchPassStart事件：检测手指按下／鼠标左键按下，把flag标识为true
	//touchPassMove事件：计算手指／鼠标是否经过某个圆圈，并记录密码，这部分也要处理圆圈样式变化
	//touchPassEnd事件：手指／鼠标抬起，密码数组清零，样式reset，flag=false
	passWordContainer.addEventListener('touchstart',touchPassStart,false);
	passWordContainer.addEventListener('touchmove',touchPassMove,false);
	passWordContainer.addEventListener('touchend',touchPassEnd,false);

	//添加对ie等其他不支持touch的浏览器的支持
	passWordContainer.addEventListener('mousedown',touchPassStart,false);
	passWordContainer.addEventListener('mousemove',touchPassMove,false);
	passWordContainer.addEventListener('mouseup',touchPassEnd,false);

	//考虑pc的情况，用mouseover记录密码
	setPassWord();
	//当鼠标离开password区域后强制触发forceMouseUp
	document.documentElement.addEventListener('mouseup',forceMouseUp,false);

	//切换设置密码和验证密码
	var radios = document.forms[0].elements['password'];
	for(var i = 0; i<radios.length;i++){
		radios[i].onclick = function(){radioChange(this)};
	}
	function calculateCircleCoord(){
		var array = [];
		if(document.documentElement.getBoundingClientRect()){
		//检测是否有getBoundingClientRect的方法,ie11,ios safari9.3,android4.4
			for(var i = 0; i< passCircleEl.length;i++){
				var currentCircleCoord = passCircleEl[i].getBoundingClientRect();
				var lx = currentCircleCoord.left,
					ly = currentCircleCoord.top;
				var obj = {
					x:lx,
					y:ly,
					centerx:lx+r/2,
					centery:ly+r/2
				};
				array.push(obj);
			}
		}else{
			for(var i = 0; i< passCircleEl.length;i++){
				var currentCircleCoord = getPos(passCircleEl[i]);
				array.push(currentCircleCoord);
			}
		}
		return array;
	}

	function getPos(el){
		for(var lx=0,ly=0;el!=null;lx+=el.offsetLeft,ly +=el.offsetTop,el=el.offsetParent);
		return {
			x: lx,
			y: ly,
			centerx:lx+r/2,
			centery:ly+r/2
		}
	}

	function chooseFromCircle(x0,y0){
		var circleIndex = -1;
		for(var i = 0; i < circleCoord.length; i++){
			var circleX = circleCoord[i].x;
			var circleY = circleCoord[i].y;
			if(circleX <= x0 && x0 <=(circleX+r) && circleY <= y0 && y0 <=(circleY+r)
				){
				circleIndex = i;
				break;
			}
		}
		return circleIndex;
	}

	function resetCircleStyle(){
		passArray = [];//密码清零
		flag = false;
		for(var i = 0; i< passCircleEl.length;i++){
			passCircleEl[i].classList.remove('activeCircle');
			passCircleEl[i].classList.remove('activeTwice');
		}
	}

	function testPassArray(arr){
		var storedArr = localStorage.getItem('password');
		var newArr = JSON.stringify(arr);
		//验证密码
		if(testPassword){
			if(storedArr){
				if(storedArr === newArr){
					writeTip(7);
				}else{
					writeTip(6);
				}
			}else{
				alert('请您先设置密码');
			}
			return;
		}
		//设置密码
		if(!certainArray){
			if(arr.length < arrLimitLength){
				writeTip(2);
			}else{
				writeTip(3);
				certainArray = newArr;
			}
			return;
		}
		
		if(certainArray){
			//如果此前已经输入过一次长度大于5的密码
			if(certainArray === newArr){
				writeTip(5);
				localStorage.setItem('password',newArr);
			}else{
				//如果第二次确认的密码与第一次输入的不相等，且之前有已经设置好的密码，就提醒用户在重设密码
				if(storedArr === certainArray){
					if(arr.length >= arrLimitLength){
						certainArray = newArr;
						writeTip(9);//重设密码且符合要求
					}else{
						certainArray = '';
						writeTip(10);//重设密码但不符合要求
					}
				}else{
					certainArray = '';
					writeTip(4);
				}
				return;
			}
		}
	}

	function setPassWord(){
		for(var i = 0; i < passCircleEl.length; i++){
			(function(i){
				passCircleEl[i].addEventListener('mousedown',clickPassCircle,false);
				passCircleEl[i].addEventListener('touchstart',clickPassCircle,false);
				//移动端上不支持mouseover事件，pc上对touchmove事件的支持不好
				passCircleEl[i].addEventListener('mouseover',overPassCircle,false);
				function clickPassCircle(e){
					flag = true;
					this.classList.add('activeCircle');
					passArray.push(i);
					initLine(i);
				}
				function overPassCircle(e){
					if(flag && !touchFlag){
						passArray.push(i);
						drawLine(i);
						if(this.classList.contains('activeCircle')){
							this.classList.add('activeTwice');
							return;
						}
						this.classList.add('activeCircle');
					}
				}
			})(i);
		}
	}

	function touchPassStart(e){
		e.preventDefault();
		flag = true;
	}
	function touchPassEnd(e){
		if(e){
			e.preventDefault();
			e.stopPropagation();
		}
		if(passArray.length === 0){
			return;
		}
		if(passArray.length === 1){
			writeTip(2);//考虑只点击一次就抬起的情况
		}
		if(passArray[0] === passArray[1]){passArray.shift();}
		testPassArray(passArray)
		resetCircleStyle();
		endDraw();
	}
	function touchPassMove(e){
		e.preventDefault();
		if(e.touches){
			touchFlag = true;
			var touch = e.touches[0],
				touchx = touch.pageX,
				touchy = touch.pageY;
			var num = chooseFromCircle(touchx,touchy);
			if(num >= 0){
				if( num !== passArray[passArray.length-1]){
					passArray.push(num);
					var el = document.getElementsByClassName('passwordCircle')[num];
					if(el.classList.contains('activeCircle')){
						//反复勾选一个圆圈的情况，把反复勾选的计入密码中，用红色提醒
						el.classList.add('activeTwice');
						return;
					}
					el.classList.add('activeCircle');
					drawLine(num);
				}
			}
		}
	}

	function forceMouseUp(x0,y0){
		var boxX = passWordContainer.getBoundingClientRect().left;
		var boxY = passWordContainer.getBoundingClientRect().right;
		if(boxX<=x0 && x0<=(boxX+220) && boxY <= y0 && y0 <= (boxY+220)){
			//do nothing
		}else{
			touchPassEnd();
		}
	}
	function initLine(num){
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		context.strokeStyle = '#f25666';
		context.beginPath();
		context.lineWidth = 3;
		var centerX = circleCoord[num].centerx;
		var centerY = circleCoord[num].centery;
		context.moveTo(centerX,centerY);
	}

	function drawLine(num){
		var centerX = circleCoord[num].centerx;
		var centerY = circleCoord[num].centery;
		context.lineTo(centerX,centerY)
		context.stroke();
	}
	function endDraw(){
		context.closePath();
		context.clearRect(0,0,canvas.width,canvas.height);
	}
	function radioChange(myRadio){
		if(myRadio.value === 'test'){
			writeTip(8);
			testPassword = true;
		}else{
			writeTip(1);
			testPassword = false;
		}
	}

	function writeTip(num){
		var toolTipBox = document.getElementsByClassName('tooltip')[0];
		var innerTip = '';
		switch(num){
			case 1: 
				innerTip = '<p>请输入手势密码</p>';
				break;
			case 2: 
				innerTip = '<p>密码太短，至少需要5个点</p>';
				break;
			case 3: 
				innerTip = '<p>请再次输入手势密码</p>';
				break;
			case 4: 
				innerTip = '<p>两次输入的不一致,重新设置</p>';
				break;
			case 5: 
				innerTip = '<p>密码设置成功</p>';
				break;
			case 6: 
				innerTip = '<p>输入的密码不正确</p>';
				break;
			case 7: 
				innerTip = '<p>密码正确！</p>';
				break;
			case 8: 
				innerTip = '<p>请验证手势密码</p>';
				break;
			case 9: 
				innerTip = '<p>您在重设密码，请再次输入确认</p>';
				break;
			case 10: 
				innerTip = '<p>重设密码请输入至少5个点</p>';
				break;
		}
		toolTipBox.innerHTML = innerTip;
	}
}