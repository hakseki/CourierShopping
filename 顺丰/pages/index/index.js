Page({

  /**
   * 页面的初始数据
   */
  data: {
      username:``,
      password:``
  },


clickOnLoginBtn(){
  wx.login({
    success:(res) =>{
      console.log(res);
      this.login(res.code,this.data.username,this.data.password)
    },
  })
},
login(code,username,password){
  wx.request({
    url: 'http://127.0.0.1:5000/login',
    data:{
      code,
      username,
      password
    },
    method:'POST',
    success(res){
      if(res.statusCode===200){
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000,
          mask: true,
        })
          wx.switchTab({
            url: '/pages/SendCourier/SendCourier', // 跳转的目标页面路径
          })
        console.log(res);
      }
    },
    complete: function(completeRes) {
      if(completeRes.statusCode===401){
        wx.showToast({
          title: '登录失败',
          icon: 'none',
          duration: 2000,
          mask: true,
        })
      }
      else if(completeRes.statusCode===201){
        wx.showToast({
          title: 'openid注册完成',
          icon: 'success',
          duration: 2000,
          mask: true,
        })}
      console.log('请求完成，响应状态码：', completeRes.statusCode);
    }
  })
  
}


})
