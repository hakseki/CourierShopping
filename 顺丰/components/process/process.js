Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 属性名: 属性配置
    company:String,//公司名
    sender:String,//寄件人
    recipients:String,//收件人
    addressOne:String,//寄件地址
    addressTwo:String,//收件地址
    courier_id:String//快递单号
  },

  /**
   * 私有数据，组件的初始数据状态
   */
  data: {
    // 数据字段
  },
  methods: {
    copyText: function() {
      wx.setClipboardData({
        data: this.data.courier_id, 
        success: function(res) {
          wx.showToast({
            title: '内容已复制',
            icon: 'none',
            duration: 1500
          });
        },
        fail: function(err) {
          console.error('复制失败', err);
        }
      });
    }
  }
})