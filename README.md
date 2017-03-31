## JavaScript实现手势移动端手机解锁

```
/*
* @Author: 何青秋 109601
* @Date:   2017-03-26 09:56:57
* @Last Modified by:   heqingqiu
* @Last Modified time: 2017-03-29 14:07:12
*/
```

我将这个任务分成两部分：用于执行「记录和验证密码」的部分和「画图连线」的部分。

* 记录和验证密码：原生Js，没有使用第三方类库包括jQuery
* 画图连线：canvas  



### 记录和验证密码  

#### 1.设置密码区域

我使用了9个具有同样类名:```passwordCircle```的div作为圆圈，用CSS的```border-radius```控制div边缘变为圆形。

```.passwordCIrcle```的父元素:```.password```设为```display:flex;```，以便于对其内部的9个圆圈进行布局。

在程序中通过

```javascript
passCircleEl = document.getElementsByClassName('passwordCircle');
```

对圆圈进行遍历  



#### 2.记录密码

在监听手指／鼠标（demo同样兼容PC浏览器）的**点击、滑动／经过、抬起**事件时，主要要考虑这三种情况：

1. 手指／鼠标点击，标志着开始画线和经过圆圈
2. 手指／鼠标滑过圆圈：记录滑过的圆圈编号和顺序
3. 手指／鼠标抬起：画线和经过圆圈的动作结束

但这三种只是宽泛意义上的事件，实际上有更多种情况需要考虑。

##### @param {Array} passArray

```passArray```用于记录每一次手指划过产生的临时数组  

  

##### @param {String} certainArray

```certainArray```用于记录一次有效的密码设定，初始值为''。

当某次设置的密码长度大于5且此前没有成功设置过密码，certainArray将被赋值```JSON.stringify(passArray)``` 。

```centainArray```是一个在```passArray```被```localStorage```记录之前的一个缓存字符串，用于对比第二次确认密码时的输入。  



##### @param{Array} circleCoord

```circleCoord```是一个对象数组，会在程序运行的最开始被计算。

这个数组的每个元素都是一个记录有圆圈x、y和圆心的centerx、centery值的对象。

每当页面```resize```，该数组将被重新计算。  



##### chooseFromCircle(x0,y0)

```chooseFromCircle(x0,y0)```函数接受两个数组作为参数，功能是通过当前坐标来计算焦点在哪个圆圈内。  

通过循环遍历```circleCoord```数组找到符合条件的圆圈。



##### 事件监听

给容器```.password```绑定两组事件监听器，一组```touchstart```+```touchmove```+```touchend```，一组```mousedown```+```mousemove```+```mouseup```  

在```touchmove```和```mousemove```部分使用```chooseFromCircle``` 记录圆圈的编号和顺序。  



### 3.检验及验证密码

##### testPassArray(arr)

```testPassArray(arr)```函数是最重要的逻辑之一，这个函数接受一个数组作为参数。

```testPassArray()```函数接受到最近一次手指划过产生的临时数组，也即```passArray```后，开始检验密码，检验步骤如下：

* 检测当前的模式，判断是设置密码模式还是验证密码模式。
  * 如果是验证密码模式，检测localStorage是否存储密码
    1. 如果存储则比较
    2. 如果没有存储则跳出警示框
  * 如果是设置密码模式
    * 如果此前没有任何密码输入，不仅是没有密码存储
      * 当前输入密码长度符合要求：提示确认密码，且certainArray将记录本次输入的密码
      * 当前输入密码长度不符合要求：提示密码输入长度不够
    * 如果此前有一次成功的密码输入（即存在非空的certainArray），比较当前输入与certainArray记录的上一次输入
      * 如果一致：提示密码设置成功
      * 如果不一致，比较localStorage里存储的密码输入与centainArray
        * 如果相符，说明有一次成功的密码存储了，证明当前至少是第三次的输入密码，在这种情况下，默认用户在重设密码，所以需要检验密码输入的长度
          * 如果符合要求：提示用户在重设密码，并要求二次输入确认
          * 如果不符合要求：提示用户在重设密码，但本次输入不符合要求
        * 如果不相符，说明当前没有成功存储的密码，用户是在进行“确认输入”的操作，所以提示用户第二次输入的不正确

### 圆圈连线

#### drawLine(num)

该函数接受一个数字作为参数，该数字为圆圈的编号。通过在密码区域下方放置```canvas```画布的方式，使用```context.lineTo(centerX,centerY)```将经过的圆圈的圆心相连。



最后再用grunt压缩一下css和js，结束啦～



### 总结

这一次的任务让我接触了以前不太用的```touch```事件，感觉很有收获。因为很担心浏览器兼容的问题，所以在真机上测试了多次，意外学会在局域网里用手机浏览器访问本地的localhost，和图书馆的AP隔离搏斗很久最后还是用了手机热点什么的...

从在广州开的CSS大会上见到波波老师，就对360的前端团队充满好奇了，虽然还是萌新，也希望自己能有机会哈！