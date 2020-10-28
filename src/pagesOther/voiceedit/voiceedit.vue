<template>
  <view class="container edit-container">
    <textarea
      :maxlength="edit_text_max"
      class="edit_textarea"
      :auto-focus="true"
      :focus="is_focus"
      @input="editInput"
      @confirm="editConfirm"
      :value="edit_text"
      :adjust-position="true"
      @focus="editFocus"
      @blur="editBlur"
    ></textarea>
    <view class="bottom-wrap" :style="{paddingBottom: bottomHeight+'px'}">
      <view class="tips-wrapper">
        <text class="edit-tips">{{ tips }}</text>
        <view class="delete-content" @tap="deleteContent">
          <image
            src="https://ifile.jialekoi.cn/qingyun/voice/delete_all.png"
            class="img-delete-all"
          ></image>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
const initBottomHeight = 0;
export default {
  data() {
    return {
      edit_text_max: 200,
      remain_length: 200,
      edit_text: "",
      is_focus: false,
      tips: "",
      index: -1,
      bottomHeight: initBottomHeight,
    };
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setEditText(options.content)
    let index = parseInt(options.index)
    this.index = index
    this.oldText = options.content
  },
  methods: {
    /**
     * 获得最大文本长度
     */
    getEditTextMax: function() {
      return this.edit_text_max;
    },
    /**
     * 更新剩余长度
     */
    updateRemainLength: function(now_content) {
      this.remain_length = this.getEditTextMax() - now_content.length;
      this.tips = "还可以输入" + this.remain_length + "字...";
      this.tips = this.tips;
    },
    /**
     * 设置初始内容
     */
    setEditText: function(text) {
      this.edit_text = text;
      //更新剩余长度显示
      this.updateRemainLength(text);
      this.is_focus = true;
    },
    /**
     * bindinput
     */
    editInput: function(event) {
      console.log(event);
      if (event.detail.value.length > this.getEditTextMax()) {
      } else {
        this.edit_text = event.detail.value;
        this.updateRemainLength(this.edit_text);
      }
    },
    /**
     * bindconfirm
     */
    editConfirm: function(event) {
      if (this.edit_text.length > 0 && this.edit_text != this.oldText) {
        // 得到页面栈

        let pages = getCurrentPages();
        if (pages.length > 1) {
          const PrePage = pages[pages.length - 2]
          let prevPage = pages[pages.length - 2]; //上一个页面
          let dialogList = prevPage.$vm.dialogList.slice(0);
          let editItem = dialogList[dialogList.length - 1];
          editItem.text = this.edit_text;
          this.dialogList = dialogList
          this.recordStatus = 2
          uni.navigateBack();
        }
      } else {
        //文本输入为空时提示
        uni.showToast({title: '内容不能为空'})
      }
    },

    /**
     * 点击文本输入框修改底下按钮行高，让提示和按钮始终在键盘上方   *
     */
    editFocus: function(e) {
      let { value, height } = e.detail;
      console.log(value, height);

      if (!isNaN(height)) {
        this.bottomHeight = height + initBottomHeight;
      }
    },

    /**
     * 输入框失焦
     */
    editBlur: function() {
      this.bottomHeight = initBottomHeight;
    },

    /**
     * 清空内容
     */
    deleteContent: function() {
      this.setEditText("");
      this.is_focus = true;
    },
  },
};
</script>
<style scoped>
.edit-container {
  position: relative;
  padding: 20px 50rpx 20rpx;
  justify-content: flex-start;
  -webkit-justify-content: flex-start;
  background-color: #fafafa;
}
.edit_textarea {
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  font-size: 36rpx;
  line-height: 60rpx;
}

.tips-wrapper {
  width: 100%;
  display: flex;
  display: -webkit-flex;
  justify-content: space-between;
  -webkit-justify-content: spacce-between;

  padding: 0;
  box-sizing: border-box;
  align-items: center;
  -webkit-align-items: center;
}
.edit-tips {
  font-size: 30rpx;
  color: #b2b2b2;
  line-height: 50rpx;
}
.img-delete-all {
  height: 32rpx;
  width: 28rpx;
}
.delete-content {
  position: relative;
  right: -20rpx;
  padding: 20rpx 20rpx;
}
</style>
