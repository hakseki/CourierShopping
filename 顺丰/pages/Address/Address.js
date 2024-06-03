// pages/address/address.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    users:[]
  },
  upData(event){

    const id =event.currentTarget.dataset.id
    console.log(id);
    wx.navigateTo({
      url: `/pages/Addaddress/Addaddress?id=${id}`, // 跳转的目标页面路径
    })
  },
  btn(){
    wx.navigateTo({
      url: '/pages/Addaddress/Addaddress', // 跳转的目标页面路径
    })
  },
  ButtonDell(event){
    const id =event.currentTarget.dataset.id
    console.log(id);
   wx.showModal({
      title: '确认删除',
      content: '确定要删除这条地址记录吗？',
      confirmText: '删除',
      cancelText: '取消',
      success: (modalRes) => {
        if (modalRes.confirm) {
          // 用户点击确认删除，发起删除请求
          this.deleteAddress(id);
          this.ShowUsers()
        }
      }
    });
   
  },
  onShow:function(){
    this.ShowUsers()
  }
  ,
  ShowUsers(){
    wx.request({
      url: 'http://127.0.0.1:5000/getUserAddresses', //仅为示例，并
      header: {
        'content-type': 'application/json' // 默认值
      },
      success:(res)=>{
        console.log(res.data),
        this.setData({
          users:res.data
        })
      }
    })
  },
  deleteAddress(id) {
    wx.request({
      url: `http://127.0.0.1:5000/deleteAddressById/${id}`, // 替换为你的后端实际API地址
      method: 'DELETE',
      header: {
        'content-type': 'application/json' // 根据实际情况调整
      },
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({
            title: '已成功删除',
            icon: 'success',
            duration: 2000
          });
          // 可以在此处添加更多操作，比如刷新页面或跳转
        } else if (res.statusCode === 404) {
          wx.showToast({
            title: '没有找到要删除的地址记录',
            icon: 'none',
            duration: 2000
          });
        } else {
          wx.showToast({
            title: '删除失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (err) => {
        console.error('请求失败', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }

})