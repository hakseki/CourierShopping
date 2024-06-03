Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    canIUseNicknameComp: wx.canIUse('button.open-type.chooseAvatar')
  },
  onLoad: function (options) {
    const username = options.username;
    if (username) {
      this.setData({
        'userInfo.nickName': username,
      });
    }
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }
  },
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '展示用户信息',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      }
    });
  }, 
  onChooseAvatar(e) {
    this.setData({
      'userInfo.avatarUrl': e.detail.avatarUrl
    });
  },
  exit(){
    wx.reLaunch({
      url: '/pages/index/index', // 请根据实际情况替换首页的路径
    })
  }
});
