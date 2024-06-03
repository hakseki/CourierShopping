// pages/ProductDetails/ProductDetails.js
Page({
   
  /**
   * 页面的初始数据
   */
  data: {
      activeNames: ['1'],
      //轮播图配置
      autoplay: true,
      interval: 3000,
      duration: 1200,
      value: 3,
    goods:[],
    swiper:[],
    id:0,
    goodItem:[]
  },
  onLoad: function(options) {
    const id = options ? options.id : '默认值或空值处理';
    console.log('Id:', id);
    this.setData({
      id: id
    });
  },
  // 获取从上一个页面传递过来的index参数
  onShow(){
    this.getGoods(this.data.id)
    console.log(this.data.goods);
  },
  getGoods(id){
    wx.request({
      url: `http://127.0.0.1:3000/GetGood/${id}`,
      success:(res)=>{
        this.setData({
          goods:res.data,
        })
        const goodItem = this.data.goods[0]
        this.setData({
          swiper:goodItem.img,
          goodItem
        })
      }
    })

  },
  click(){
    wx.showToast({
      title: '功能建设中',
      icon: 'error',
      duration: 2000
    })
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  clickCart(){
    wx.navigateTo({
      url: '/pages/ShoppingCart/ShoppingCart',
    })
  }
})