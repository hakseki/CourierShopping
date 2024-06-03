// components/my-picker/my-picker.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 外部可以传入的选项数组
    array: {
      type: Array,
      value: ['圆通', '菜鸟', '顺丰']
    },
    // 初始选中项，由外部控制
    initIndex: {
      type: Number,
      value: -1
    }
  },

  /**
   * 私有数据，组件的初始数据状态
   */
  data: {
    // 内部使用的选中项索引，这里用properties中的initIndex初始化
    index: -1,
    hasSelected: false
  },

  /**
   * 组件生命周期函数，在组件实例进入页面节点树时执行
   */
  attached() {
    // 初始化时设置index，确保与外部传入的initIndex一致
    this.setData({ index: this.properties.initIndex });
  },

  /**
   * 组件的事件处理函数
   */
  methods: {
    // 选项发生变化时触发的事件处理函数
    bindPickerChange(e) {
      // 更新内部的index值
      this.setData({ index: e.detail.value });

      // 触发自定义事件，将选择的值传递给父组件
      this.triggerEvent('pickerChange', { value: e.detail.value });
    },

    // 假设的按钮点击事件，用于演示如何更新内部状态
    btn() {
      this.setData({
        index: 0,
      });
      // 可以在这里同样触发事件，通知父组件变化
      this.triggerEvent('buttonTap', { action: 'reset' });
    }
  }
});