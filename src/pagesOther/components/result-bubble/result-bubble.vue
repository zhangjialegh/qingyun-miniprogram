<template>
  <view class="bubble-wrap" @longpress="showModal" >
    <view class="modal-wrap" v-if="recordStatus == 2">
      <modal :modal-show="modalShow"
        :index="index"
        :item="item"
        @modalleave="modalLeave"></modal>
    </view>
    <view class="create-time">{{item.create}}</view>
    <view class="section-body" :data-index="index" >
      <view class="send-message">
        <view :data-id="item.id"  class="text-content"  :data-index="index" >
          <view class="text-detail" :class="['text-detail-'+item.lfrom]">{{item.text}}<waiting-icon v-if="recordStatus == 0"></waiting-icon></view>
        </view>
        <navigator
          hover-class="navigator-hover"
          :data-text="item.text"
          :data-id="item.id"
          :data-index="index"
          class="edit-icon"
          v-if="editShow"
          :data-item="item"
          :url="'/pagesOther/voiceedit/voiceedit?content='+item.text+'&index='+index">
            <image class="edit-icon-img" :src="edit_icon_path" ></image>
        </navigator>
      </view>
      <view class="line-between"  v-if="recordStatus > 0"></view>
      <view class="translate-message" >
        <view class="text-content">
          <view class="text-detail" :class="['text-detail-'+item.lto]">{{item.translateText}}<waiting-icon v-if="recordStatus == 1"></waiting-icon>
        </view>
        </view>
        <view class="play-icon" @tap.stop="playTranslateVoice" @touchstart.stop="playTranslateVoice" v-if="recordStatus == 2">
          <play-icon :play-type="playType"></play-icon>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import { language } from "@/common/conf.js";
import modal from '../modal/modal'
import WaitingIcon from '../waiting-icon/waiting-icon'
import PlayIcon from '../play-icon/play-icon'
export default {
  components: {modal,WaitingIcon,PlayIcon},
  props: {
    item: {
      type: Object,
      default: function() {
        return {}
      }
    },
    editShow: {
      type: Boolean,
      default: false,
    },
    index: {
      type: Number,
    },
    currentTranslateVoice: {
      type: String,
    },
    recordStatus: {
      type: Number,
      default: 2, // 0：正在识别，1：正在翻译，2：翻译完成
    },
  },
  data() {
    return {
      tips_language: language[0], // 目前只有中文
      modalShow: false, // 展示悬浮框
      playType: 'wait', // 语音播放状态
      edit_icon_path: 'https://ifile.jialekoi.cn/qingyun/voice/edit.png'
    }
  },
  watch: {
    item: {
      handler(newVal, oldVal) {
        // 翻译完成后，文字有改变触发重新翻译
        if(this.recordStatus == 2 && oldVal.text && oldVal.text != '' && newVal.text != oldVal.text) {
          this.$emit('translate', {
            item: this.item,
            index: this.index,
          })
        }

        // 翻译内容改变触发播放
        if(newVal.autoPlay && newVal.translateVoicePath != oldVal.translateVoicePath){
          this.autoPlayTranslateVoice()
        } else if(newVal.translateVoicePath == "") {
          this.playAnimationEnd()
        }
      },
      deep: true
    },
    currentTranslateVoice(newVal, oldVal) {
      if(newVal != '' && newVal != this.item.translateVoicePath) {
        this.playAnimationEnd()
      }
    }
  },
  mounted() {
    if(this.item.autoPlay) {
      this.autoPlayTranslateVoice()
    }
  },
  methods: {

    /**
     * 显示悬浮框
     */
    showModal() {
      this.modalShow = true
    },

    /**
     * 离开悬浮框
     */
    modalLeave() {
      this.modalShow = false
    },


    /**
     * 点击播放图标
     */
    playTranslateVoice() {

      let nowTime = Number.parseInt(+ new Date() / 1000)
      let voiceExpiredTime = this.item.translateVoiceExpiredTime || 0

      if(this.playType == 'playing') {
        uni.stopBackgroundAudio()
        this.playAnimationEnd()
      } else if(nowTime < voiceExpiredTime) {
        this.autoPlayTranslateVoice()
      } else {
        this.playType = 'loading'
        this.$emit('expired', {
          item: this.item,
          index: this.index,
        })
      }
    },

    /**
     * 播放背景音乐
     */
    autoPlayTranslateVoice (path,index) {
      let play_path = this.item.translateVoicePath

      if(!play_path) {
        console.warn("no translate voice path")
        return
      }


      uni.onBackgroundAudioStop(res => {
        console.log("play voice end",res)
        this.playAnimationEnd()
      })

      this.playAnimationStart()

      uni.playBackgroundAudio({
        dataUrl: play_path,
        title: '',
        success: (res) => {
          this.playAnimationStart()
        },
        fail: (res) => {
            // fail
            console.log("failed played", play_path);
            this.playAnimationEnd()
        },
        complete: function (res) {
            console.log("complete played");
        }
      })
    },

    /**
     * 开始播放
     */
    playAnimationStart() {
      this.playType = 'playing'
    },

    /**
     * 结束播放
     */
    playAnimationEnd() {
        this.playType = 'wait'
    },
  }
}
</script>
<style scoped>
  .bubble-wrap {
    position: relative;
  }
  .wait-point {
    display:inline-block;
    width:6px;
    height:6px;
    border-radius:3px;
    background-color: #ddd;
    margin: 0 2px;

  }
  .loading {
    position: relative;
  }

  .line-between {
    height: 1px;
    width: 100%;
    background: #F1F1F1;
    overflow: hidden;
    margin: 30rpx 0;
  }

  .create-time {
    font-size:28rpx;
    color: #B2B2B2;
    margin-bottom:10px;
    display: flex;
    display: -webkit-flex;
    justify-content: center;
    -webkit-justify-content: center;
  }

  .section-body{
    word-wrap: break-word;
    position: relative;
    width:100%;
    background: #FFFFFF;
    box-shadow: 0 2px 16px 2px rgba(0,0,0,0.03);
    padding:50rpx 60rpx;
    box-sizing: border-box;
    min-height: 260rpx;
  }

  .text-detail {
    font-size: 36rpx;
    line-height: 1.231;
    vertical-align: text-bottom;
    box-sizing: border-box;
    font-family: "PingFang-SC-Regular","SimSun","Microsoft Yahei";
    font-variant-ligatures: none;
  }

  .text-detail-en_US {
    line-height: 1.231;
  }

  .text-detail-zh_CN {
    line-height: 1.41;
  }

  .translate-message,
  .send-message {
    position: relative;
    padding: 0 2px;
  }

  .send-message  .text-detail {
    color: #9B9B9B;
  }

  .edit-icon {
    position: absolute;
    display: flex;
    align-items: center;
    right: 8rpx;
    bottom: 0;
    padding: 0 8rpx;
    bottom: 7rpx;
  }

  .edit-icon-img {
    width:40rpx;
    height:40rpx;
  }

  .play-icon {
    position: absolute;
    right: 3rpx;
    bottom: 7rpx;
    padding: 0 8rpx;
    display: flex;
    align-items: center;
  }

  .edit-icon::before
  .play-icon::before {
    content:"";
    position:absolete;
    top:-10rpx;
    left:-10rpx;
    bottom:-10rpx;
    right:-10rpx;
  }


  .text-content {
    margin: 0 48px 0 0;
    box-sizing: border-box;
  }


  .modal-wrap {
    position: absolute;
    width: 100%;
    box-sizing:border-box;
  }
  /* 重置navigator样式 */
  .navigator-hover {
    background-color: #fff;
  }
</style>