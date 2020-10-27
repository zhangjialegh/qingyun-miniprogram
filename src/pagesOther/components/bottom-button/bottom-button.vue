<template>
  <view class="button-wrap" :hidden="hidden">
    <view class="img-big-wrap">
      <view class="button-container">
        <view v-for="(button, lang) in buttons" :key="lang" class="button-item">
          <view  @touchstart.stop="streamRecord" @touchend.stop="endStreamRecord" :data-conf="button" class="button-press">
            <span class="text-in-button" :class="{'text-press': button.buttonType == 'press'}">{{button.buttonText}}</span>
            <image class="button-background" :src="buttonBackground[button.lang][button.buttonType]"></image>
          </view>
          <view class="button-label">{{button.msg}}</view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import {language} from '@/common/conf.js'
let buttons = []

// 按钮配置
language.forEach(item=>{
  buttons.push({
    buttonText: item.lang_name,
    lang: item.lang_content,
    lto: item.lang_to[0],
    msg: item.hold_talk,
    buttonType: 'normal',
  })
})

// 按钮对应图片
let buttonBackground = {
  zh_CN: {
    normal: 'https://ifile.jialekoi.cn/qingyun/voice/button_zh.png',
    press: 'https://ifile.jialekoi.cn/qingyun/voice/button_zh_press.png',
    disabled: 'https://ifile.jialekoi.cn/qingyun/voice/button_zh_disabled.png',
  },
  en_US: {
    normal: 'https://ifile.jialekoi.cn/qingyun/voice/button_en.png',
    press: 'https://ifile.jialekoi.cn/qingyun/voice/button_en_press.png',
    disabled: 'https://ifile.jialekoi.cn/qingyun/voice/button_en_disabled.png',
  }
}
export default {
  props: {
    buttonDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      buttons: buttons,
      buttonBackground: buttonBackground,
      currentButtonType: 'normal',
    }
  },
  watch: {
    buttonDisabled(newVal) {
      let buttonType = newVal ? 'disabled' : 'normal'
      this.changeButtonType(buttonType)
    }
  },
  methods: {
    streamRecord(e) {
      if(this.buttonDisabled) {
        return
      }
      // 先清空背景音
      wx.stopBackgroundAudio()

      let currentButtonConf = e.currentTarget.dataset.conf

      this.changeButtonType('press', currentButtonConf.lang)

      this.$emit('recordstart', {
        buttonItem: currentButtonConf
      })

    },

    /**
     * 松开按钮结束录音
     */
    endStreamRecord(e) {
      let currentButtonConf = e.currentTarget.dataset.conf
      // console.log("currentButtonConf", currentButtonConf)
      this.$emit('recordend', {
        buttonItem: currentButtonConf
      })
    },

    /**
     * 修改按钮样式
     */
    changeButtonType(buttonType, buttonLang) {

      let tmpButtons = this.buttons.slice(0)

      tmpButtons.forEach(button => {
        if(!buttonLang || buttonLang == button.lang) {
          button.buttonType = buttonType
        }
      })
      this.buttons = tmpButtons
    }
  }
}
</script>
<style scoped>
  .button-wrap {
    display: -webkit-flex;
    display: flex;
    -webkit-justify-content: center;
    justify-content: center;
  }

  .img-big-wrap {
    width: 100%;
    display: -webkit-flex;
    display: flex;
    background: #FAFAFA;
  }

  .button-container{
    display: flex;
    display: -webkit-flex;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    justify-content: space-between;
    -webkit-justify-content: space-between;
    align-items: center;
    -webkit-align-items:center;
    margin: 0 calc( (100% - 240rpx * 2) / 3 );
    margin-bottom: 20px;
    padding: 50rpx 0 38rpx 0;
  }
  .button-item {
    display: flex;
    display: -webkit-flex;
    flex-direction: column;
    -webkit-flex-direction: column;
    justify-content: flex-start;
    -webkit-justify-content: flex-start;
    align-items: center;
    -webkit-align-items: center;
    width: 240rpx;
    box-sizing: border-box;
  }
  .button-label {
    font-size: 28rpx;
    color: #9B9B9B;
    letter-spacing: 0;
    margin: 15rpx 0 0 0;
  }
  .button-press {
    position: relative;
    display: flex;
    display: -webkit-flex;
    height: 100rpx;
    width: 100%;
    border-radius: 100rpx;
    justify-content: center;
    -webkit-justify-content: center;
    align-items: center;
    -wekbit-align-items:center;
  }
  .button-background {
    position: absolute;
    height: 100rpx;
    width: 100%;
    border-radius: 100rpx;
    left: 0;
    z-index: 1;
  }

  .text-in-button {
    font-weight: bold;
    font-size: 34rpx;
    color: #FFFFFF;
    z-index: 2;
  }

  .text-in-button.text-press {
    opacity: 0.6;
  }
</style>