/**
*名称：指示灯
*作者：zhuangjie
*联系我：2119299531@qq.com
*/
$(function () {
    //当box容器加入到html文档中作为节点
    $("body").prepend(` 
                    <div id="title_box">
                        <div id="content" >
                
                        </div>
                    </div>
            `) 
    var target_titles = ["h1","h2","h3"] //文章中哪些标题需要加入到指示灯中
    var journal_box = $("#cnblogs_post_body");     //文章容器
    var journal_node = journal_box.children();  //文章的子节点
    var pick_title_node = []        //有效的title节点

    //每个小盒子的长度
    var box_height = 30                   //mbox容器box的高度
    var bbb = "#9c9c9c"  //最外层容器的背景颜色
    var mbox_width = $(window).width() / 4.7         //mbox的宽度
    var mbox_margin_size = 2.5  //margin的外边距大小
    var active_color = "#0681ba"  //mbox活跃时的背景颜色
    var mbox_color = "rgba(85, 85, 85,0.9)" //mbox中的背景颜色
    var color = "#ebebeb"  //mbox中的文字颜色
    var current_index = 0  //现在的mbox_index或当前的标题对应的index
    var listen_scroll = true //是否处理滚动条事件
    var tops_size = [] //各个标题距顶部的高度



    //选择出标题有效元素节点
    for (let i = 0; i < journal_node.length; i++) {
        unit_node = journal_node[i];
        for(let j = 0; j < target_titles.length; j++) {
            if (unit_node.localName.indexOf(target_titles[j]) == 0) {
                pick_title_node[pick_title_node.length] = unit_node
                return;
            }
        }
        
    }
    //与主题结耦了，判断是用我们的指示灯还是主题的目录
    if (pick_title_node.length > 20 || pick_title_node.length == 0) {
        //相当不用我们的指示灯了
        window.onload = function () {
            document.getElementById('articleDirectory').style = "display:block;"
            document.getElementById('home').style = "margin-top: 332px;margin-left: 4%;"
        }
        return;
    }
    //将元素节点进行加工成mbox html且追加到页面中作为节点 & 将同将title距顶部的高度加到容器中
    for (i = 0; i < pick_title_node.length; i++) {
        title_str = pick_title_node[i].innerText.trim()
        $("#content").append("<div id='title_index_" + i + "' title='" + title_str + "'>" + title_str + "</div>")
        tops_size[tops_size.length] = $(pick_title_node[i]).offset().top
    }


    //设置整体盒子样式
    if (pick_title_node.length > 0) {
        $("#title_box").css({
            "position": "fixed",
            "left": "0px",
            "right": "0px",
            "top": "0px",
            "font-size": "10px",
            "background": bbb,
            "overflow": "hidden",
            "z-index": "10",
            "border-bottom": "1px solid #bbbbbb"
        })
        $("#content").css({
            "height": box_height + "px",
            "overflow": "hidden",
            "width": mbox_width * pick_title_node.length + mbox_margin_size * 2 * pick_title_node.length + 250 + "px",
            "position": "relative"

        })
        $("#content").children().css({
            "float": "left",
            "width": mbox_width + "px",
            "height": "25px",
            "line-height": "25px",
            "background": mbox_color,
            "margin": mbox_margin_size + "px",
            "padding": "0px 5px",
            "box-sizing": " border-box",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "white-space": "nowrap",
            "cursor": "pointer",
            "color": color,
            "font-weight": "700"

        })


    }

    //触发指示灯初始化
    $(window).scrollTop(1);
    $(window).scrollTop(0);
    //防抖函数模板
    function debounce(func, delay) {
        let timer = null;
        return function (...args) {
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
                func.apply(this, args)
            }, delay)
        }
    }
    //定位指示灯
    //判断mbox的left是否超出，如果超时调整位置
    function toLamp() {
        //执行体
        console.log("指针灯排校准中~");
        //盒子在盒子父容器中距离左边的大小
        console.log("current_index=", current_index, "总盒子：" + tops_size.length);
        mbox_position_left = $("#title_index_" + current_index).position().left
        //窗口可见宽度
        window_width = $(window).width();
        console.log(mbox_position_left, window_width);
        if (mbox_position_left > window_width) {
            $("#content").animate({
                // 将当前盒子向左移
                "left": -mbox_position_left + box_height + "px"
            })
        } else {
            $("#content").animate({
                "left": "0px"
            })
        }

    }
    //灯位置初始化
    //创建刷新指示灯的防抖函数
    let refresh = debounce(toLamp, 50)

    //有动画地滚动
    let st = null; //保证多次执行 ScrollTo 函数不会相互影响
    function ScrollTo(scroll, top) {
        if(st != null ) {
            //关闭上一次未执行完成的滚动
            clearInterval(st);
        }
        st = setInterval(function () {
            let currentTop = $(scroll).scrollTop();
            let currentTo = 0;
            //每次移动的跨度
            let span = 40;
            //当在跨度内时，直接到达
            if (currentTop >= top - span && currentTop <= top + span) {
                $(scroll).scrollTop(top);
                let tmp_st = st;
                st = null;
                clearInterval(tmp_st);
                return;
            }
            //如果不在跨度内时，根据当前的位置与目的位置进行上下移动指定跨度
            if (currentTop < top) {
                $(scroll).scrollTop(currentTop + span)
            } else {
                $(scroll).scrollTop(currentTop - span)
            }
        }, 10)
    }
    //当点击mbox时进行事件委托
    $("#content").on("click", "div", function () {
        //点击的index
        index = parseInt($(this).prop("id").split("_")[2])
        //text中真实的obj
        node = pick_title_node[index]
        //所在位置
        mbox_top = $(node).offset().top
        //定位到该元素的位置
        ScrollTo(window, mbox_top - box_height)


        //维护指示灯
        $("#title_index_" + index).css({
            "background": active_color
        }).siblings().css({
            "background": mbox_color
        })
        //调整活跃的mbox到可视位置1
        refresh()
        //维护index
        current_index = index

    });
    //监听窗口滑动
    $(window).scroll(function () {
        //查看是否要监听scroll
        if (listen_scroll) {
            //维护tile高度容器
            for (h = 0; h < pick_title_node.length; h++) {
                tops_size[h] = $(pick_title_node[h]).offset().top
            }
            //当前可视窗口距顶部的位置
            let current_top = this.scrollY + box_height;
            //判断在哪个title内 (中间拖动值)
            let hide_height = current_top + box_height; //与 tops_size 结合判断,得出 current_index
            //维护全局变量 current_index
            if (current_top <= tops_size[0]) {//判断是否是第一个
                current_index = 0;
            } else if (current_top >= tops_size[tops_size.length - 1] - 10) { //看是否是最后一个, 减10是解决未知的bug
                current_index = tops_size.length - 1;
            } else { //根据当前位置与标题的top得到， 与平常的数组遍历不同，这里是 tops_size.length-1
                for (j = 0; j < tops_size.length - 1; j++) {
                    if (hide_height >= tops_size[j] && hide_height < tops_size[j + 1]) {
                        current_index = j;
                    }
                }
            }
            //去更新
            $("#title_index_" + current_index).css({
                "background": active_color
            }).siblings().css({
                "background": mbox_color
            })
            //调整活跃的mbox到可视位置2
            refresh()

        }
    })
})