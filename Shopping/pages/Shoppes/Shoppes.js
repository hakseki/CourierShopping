// pages/Shoppes/Shoppes.js
import Notify from '@vant/weapp/notify/notify';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 选中项的索引
    activeKey: 0,
    indicatorDots: false, // 是否显示面板指示点
    autoplay: true, // 是否自动切换
    interval: 3000, // 自动切换时间间隔
    duration: 500, // 滑动动画时长
    circular: false, // 是否采用衔接滑动
    imageUrls: [
      '/swiper/1.png',
      '/swiper/2.png',
      '/swiper/3.png',
      '/swiper/4.png',
      '/swiper/5.png',
    ]
    ,goods:[],
  },
  //onShow周期函数，页面构建时导入数据库数据
  onShow(){
    this.getGoods(this.data.activeKey)
  },

  getGoods(index){
    wx.request({
      url: `http://127.0.0.1:3000/GetGoods/${index.toString()}`,
      success:(res)=>{
        console.log(res.data);
        this.setData({
          goods:res.data
        })
      }
    })

  },
  //标签监听事件
  onChange(event) {
    this.setData({
      activeKey:event.detail
    })
    this.getGoods(this.data.activeKey)
  },
  click(event){
    //自定义属性获取点击的索引
    console.log( event.currentTarget.dataset.id);
    const id = event.currentTarget.dataset.id;
    //自定义属性获取点击商品的index
    const index = event.currentTarget.dataset.index;
 
    wx.navigateTo({
      url: `/pages/ProductDetails/ProductDetails?id=${id}`, // 跳转的目标页面路径
    })
      //点击的active变化，变化完跳转页面了，返回的时候全部变成flase
     // 复制商品数据数组，避免直接修改原数组
     const updatedGoods = this.data.goods;
     
     // 将原来active为true的改为false
    const activeGoods = updatedGoods.filter(item=>item.active===true)
    // 遍历筛选出的数组，将active属性改为false
      activeGoods.forEach(item => {
        item.active = false;
      })
 ;
     // 更新被点击商品的active状态，如果已激活则取消，未激活则激活
     updatedGoods[index].active = !updatedGoods[index].active;
      this.setData({
        goods:updatedGoods
      })
  }
})