<template>
  <view class="loading">
    <view class="loading-icon">.</view>
    <view :animation="waiting_animation" class="loading-icon">.</view>
    <view :animation="waiting_animation_1" class="loading-icon">.</view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      waiting_animation: {},
      waiting_animation_1: {},
      a: {},
      a1: {}
    };
  },
  mounted() {
    console.log("ready waitting");
    this.waiting_animation = uni.createAnimation({
      duration: 600,
    });
    this.waiting_animation_1 = uni.createAnimation({
      duration: 400,
    });

    this.setWaitInterval();
  },
  beforeDestroy() {
    this.clearAnimation();
  },
  methods: {
    clearAnimation () {
      this.endWaitAnimation();
    },

    /**
     * 清除动画
     */
    endWaitAnimation () {
      clearInterval(this.waiting_interval);
      this.waiting_animation = {}
      this.waiting_animation_1 = {}
    },
    startWaitAnimation () {
      this.waiting_animation.opacity(0).scale(1.2, 1.2).step();
      this.waiting_animation.opacity(1).scale(1, 1).step();
      // this.waiting_animation = this.waiting_animation.export()
      this.waiting_animation_1.opacity(0).scale(1.2, 1.2).step();
      this.waiting_animation_1.opacity(1).scale(1, 1).step();
      // this.waiting_animation_1 = this.waiting_animation_1.export()
    },

    /**
     * 设置动画
     */
    setWaitInterval () {
      // this.endWaitAnimation(); 
      this.waiting_interval = setInterval(() => {
        this.startWaitAnimation();
      }, 600);
    },
  },
};
</script>
<style scoped>
.loading {
  position: relative;
  display: inline;
}
.loading-icon {
  display: inline;
}
</style>