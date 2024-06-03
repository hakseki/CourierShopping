// Page({

//   data:{
//     count:0,
//     isClick:false
//   },
//   onChange(event) {
//     console.log(event.detail);
//   },
  
//   click(){
//     const click = this.data.isClick
//     this.setData({
//       isClick:!click
//     })
//   }
// });
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cartEffectList: [],
    // 生效商品
    example: [
      {
        store: "文娱",
        checked: false,
        merchandiseChecked: false,
        merchandises: [
          {
            id: "1",
            imgUrl: "/image/three/2.jpg",
            name: "MINISO名创优品三丽鸥魔法物语系列盲盒摆件单盒潮玩摆件可爱童趣",
            price: 65.5,
            amount: 1,
            unit: "件",  // 添加单位属性
            status: 0,
            x: 0,
            checked: false,
          },
          {
            id: "2",
            imgUrl: "/image/four/3.jpg",
            name: "章鱼箱解可爱翻面章鱼公仔反转八爪鱼毛绒玩偶",
            price: 35.5,
            amount: 1,
            unit: "套",  // 添加单位属性
            status: 1,
            x: 0,
            checked: false,
          }
        ]
      },
      {
        store: "腾讯游戏",
        checked: false,
        merchandiseChecked: false,
        merchandises: [
          {
            id: "1",
            imgUrl: "/image/sun.png",
            name: "极歆网游周边PS5游戏 黑神话 悟空",
            price: 268,
            amount: 1,
            unit: "份",  // 添加单位属性
            status: 1,
            x: 0,
            checked: false,
          },
        ]
      },
    ],
    // 失效商品
   
    startX: 0,
    moveStore: '',
    delBtnW: 128,
    isLeft: 0,
    total: 0,
    totalCount: 0,
    checkedAll: false,
    billLoading: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getCartList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 获取用户购物车
   */
  getCartList() {
    let cartEffectList = this.data.example;
    wx.setStorageSync('cartEffectList', cartEffectList);
    this.setData({
      cartEffectList: cartEffectList,
    });
  },

  /**
   * 店铺全选
   * @param {*} e 
   */
  checkStoreAll(e) {
    let storeName = e.currentTarget.dataset.store;
    let cartEffectList = this.data.cartEffectList;
    let updatedCart = cartEffectList.map(store => {
      if (store.store === storeName) {
        // 切换商店的已勾选标记
        store.checked = !store.checked;
        // 重置商店的商品已勾选标记
        store.merchandiseChecked = false;
        store.merchandises = store.merchandises.map(merch => {
          // 根据商店的已检查标记更新商品的已选择标记
          merch.checked = store.checked;
          return merch;
        });
      }
      return store;
    });
    this.setData({
      cartEffectList: updatedCart
    });
    this.grand();
  },

  /**
   * 单个选择
   * @param {*} e 
   */
  checkSingle(e) {
    let storeName = e.currentTarget.dataset.store;
    let merchandiseData = e.currentTarget.dataset.merchandise;
    let cartEffectList = this.data.cartEffectList;

    let updatedCart = cartEffectList.map(store => {
      if (store.store === storeName) {
        store.merchandises = store.merchandises.map(merch => {
          if (merch.id === merchandiseData.id) {
            // 更改商品的选择状态
            merch.checked = !merch.checked;
            // 更改店铺的选中状态
            store.merchandiseChecked = merch.checked;
          }
          return merch;
        });
      }
      return store;
    });

    this.setData({
      cartEffectList: updatedCart
    });
    this.grand();
  },

  /**
   * 减少数量，下限为1
   * @param {*} e 
   */
  minusAmount(e) {
    let storeName = e.currentTarget.dataset.store;
    let id = e.currentTarget.dataset.id;
    let cartEffectList = this.data.cartEffectList;
    let updatedCart = cartEffectList.map(store => {
      if (store.store === storeName) {
        // 更新商店的已选择商品标记
        store.merchandiseChecked = true;
        store.merchandises = store.merchandises.map(merch => {
          if (merch.id === id) {
            // 更新商品的选择状态
            merch.checked = true;
            if (merch.amount > 1) {
              merch.amount--;
            } else {
              wx.showModal({
                content: '宝贝数量不能再减少了',
                showCancel: false,
              });
            }
          }
          return merch;
        });
      }
      return store;
    });

    this.setData({
      cartEffectList: updatedCart
    });
    this.grand();
  },

  /**
   * 增加数量，上限为99
   * @param {*} e 
   */
  plusAmount(e) {
    let storeName = e.currentTarget.dataset.store;
    let id = e.currentTarget.dataset.id;
    let cartEffectList = this.data.cartEffectList;
    let updatedCart = cartEffectList.map(store => {
      if (store.store === storeName) {
        // 更新店铺的选中状态
        store.merchandiseChecked = true;
        store.merchandises = store.merchandises.map(merch => {
          if (merch.id === id) {
            // 更新商品的选择状态
            merch.checked = true;
            if (merch.amount < 99) {
              merch.amount++;
            } else {
              wx.showModal({
                content: '宝贝数量不能再增加了',
                showCancel: false,
              });
            }
          }
          return merch;
        });
      }
      return store;
    });
    this.setData({
      cartEffectList: updatedCart
    });
    this.grand();
  },

  /**
   * 删除商品
   * @param {*} e 
   */
  deleteMerchandise(e) {
    let storeName = e.currentTarget.dataset.store;
    let id = e.currentTarget.dataset.id;
    let cartEffectList = this.data.cartEffectList;
    let cartLapseList = this.data.cartLapseList;
    // 遍历每个商店
    let updatedEffectCart = cartEffectList.map(store => {
      if (store.store === storeName) {
        // 如果是目标商店，过滤掉指定ID的商品
        store.merchandises = store.merchandises.filter(merch => merch.id !== id);
      }
      return store;
    });
    cartLapseList = cartLapseList.filter(item => item.id !== id);
    this.setData({
      cartEffectList: updatedEffectCart,
      cartLapseList: cartLapseList
    });
  },

  /**
   * 全选
   */
  checkAll() {
    let cartEffectList = this.data.cartEffectList;
    let checkedAll = this.data.checkedAll;
    // 使用map方法更新每个商店和商品的选中状态
    let updatedCart = cartEffectList.map(store => {
      return {
        ...store,
        checked: !checkedAll,
        merchandiseChecked: !checkedAll,
        merchandises: store.merchandises.map(merch => ({
          ...merch,
          checked: !checkedAll
        }))
      };
    });
    this.setData({
      cartEffectList: updatedCart,
      checkedAll: !checkedAll,
    });
    this.grand();
  },

  /**
   * 合计
   */
  grand() {
    let cartEffectList = this.data.cartEffectList;
    // 初始化总价和总数量
    let total = 0;
    let totalCount = 0;
    cartEffectList.forEach(store => {
      store.merchandises.forEach(merch => {
        if (merch.checked) {
          total += merch.amount * merch.price;
          totalCount += merch.amount;
        }
      });
    });
    this.setData({
      total: total,
      totalCount: totalCount,
    });
  },

  /**
   * 结算
   */
  settleBill() {
    this.setData({
      billLoading: true,
    });
    setTimeout(() => {
      wx.navigateTo({
        url: '/pages/success/success',
      });
      this.setData({
        billLoading: false,
      });
    }, 1000);
  },
});
