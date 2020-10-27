<template>
  <view>
    <view v-if="modalShow" style="height: 100%; width: 100%">
      <view class="modal-wrapper">
        <view class="modal-triangle"></view>
        <view class="menu-modal">
          <view
            v-for="(item, type) in modalItems"
            :key="type"
            class="menu-modal-item"
            :data-type="item.type"
            @tap="itemTap"
            >{{ item.text }}</view
          >
        </view>
      </view>
    </view>
    <view
      v-if="modalShow"
      class="modal-hidden"
      @touchstart="leaveBubbleModal"
    ></view>
  </view>
</template>
<script>
import { language } from "@/common/conf.js";
const tips_language = language[0];
let modalItems = [
  {
    type: "copySource",
    text: tips_language.copy_source_text,
  },
  {
    type: "delete",
    text: tips_language.delete_item,
  },
  {
    type: "copyTarget",
    text: tips_language.copy_target_text,
  },
];
export default {
  props: {
    item: {
      type: Object,
      default: function () {
        return {};
      },
    },
    modalShow: {
      type: Boolean,
      default: true,
    },
    index: {
      type: Number,
    },
  },
  data() {
    return {
      modalItems: modalItems,
    };
  },
  methods: {
    deleteBubbleModal() {
      this.$emit(
        "modaldelete",
        {
          item: this.item,
          index: this.index,
        },
        { bubbles: true, composed: true }
      );
      this.leaveBubbleModal();
    },

    /**
     * 点击
     */
    itemTap(e) {
      let itemType = e.currentTarget.dataset.type;
      let item = this.item;
      switch (itemType) {
        case "copySource":
          this.setClip(item.text);
          break;
        case "copyTarget":
          this.setClip(item.translateText);
          break;
        case "delete":
          this.deleteBubbleModal();
          break;
        default:
          break;
      }
    },

    /**
     * 复制到剪贴板
     *
     * @param      {string}  text    需要复制到剪贴板的文字
     */
    setClip(text) {
      uni.setClipboardData({
        data: text,
        success: (res) => {
          this.leaveBubbleModal();
          uni.showToast({
            title: "已复制到剪切板",
            icon: "success",
            duration: 1000,
            success: function (res) {
              console.log("show succ");
            },
            fail: function (res) {
              console.log(res);
            },
          });
        },
      });
    },
    leaveBubbleModal() {
      this.$emit("modalleave", {
        modalShow: this.modalShow,
      });
    },
  },
};
</script>
<style scoped>
.modal-wrapper {
  position: relative;
  color: #ffffff;
  height: 70rpx;
  width: 80%;
  margin: 0 auto;
  z-index: 70;
  opacity: 0.9;
}
.modal-triangle {
  position: relative;
  margin: 0 auto;
  top: 28px;
  height: 0;
  width: 0;
  border: 5px solid #000000;
  transform: rotate(45deg);
}
.modal-hidden {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  opacity: 0;
  z-index: 69;
}
.menu-modal {
  height: 70rpx;
  font-size: 14px;
  position: absolute;
  top: 0;
  width: 100%;
  display: flex;
  display: -webkit-flex;
  -webkit-align-items: center;
  align-items: center;
  box-sizing: border-box;
}
.menu-modal-item {
  color: #ffffff;
  position: relative;
  width: 35%;
  height: 100%;
  display: flex;
  display: -webkit-flex;
  align-items: center;
  -webkit-align-items: center;
  justify-content: center;
  -webkit-justify-content: center;
  background-clip: content-box;
  background-color: #000000;
}

.menu-modal-item:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.menu-modal-item:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

.menu-modal-item + .menu-modal-item {
  border-left: 1rpx solid #ffffff;
}

.menu-modal-item:active {
  background-color: #9e9e9e;
}
</style>