<template>
	<view class="container scan-container">
		<view class="scan-bg-box">
			<pikachu />
		</view>
		<view class="scan-grid-box">
			<uni-grid :gridList="gridsData" :column="3" @tapGrid="ocrWord"></uni-grid>
		</view>

		<!-- 文本编辑弹框 -->
		<popup :animation="true" ref="popup" type="bottom" :maskClick="true">
			<view class="scan-content-wrap" @tap="$refs.popup.close()">
				<view class="scan-list-wrap">
					<view class="list-item" :class="{active: item.active}" v-for="item in lists" :key="item.id" @tap.stop="toggleSelect(item)">
						{{item.text}}
					</view>
				</view>
				<!-- 关闭弹窗 -->
				<button class="copy-confirm-btn close" plain :style="{background:'#ffffff'}" hover-class="btn-hover-class" @tap.stop="$refs.popup.close()">
					<text>关闭</text>
				</button>
				<!-- 确定修改按钮 -->
				<button class="copy-confirm-btn" plain :style="{background:'#ffffff'}" hover-class="btn-hover-class" @tap.stop="handleSure" v-if="selects.length">
					<text>复制选中</text>
				</button>
				<button class="copy-confirm-btn toggle-all" :style="{background:bgColor}" plain hover-class="btn-hover-class" @tap.stop="handleToggleAll" v-if="lists.length">
					<text :style="{color:textColor}">全{{selects.length == lists.length ? '不' : ''}}选</text>
				</button>
			</view>
		</popup>
	</view>
</template>

<script>
	import popup from '@/components/popup/popup.vue'
	import pikachu from '@/components/pikachu/pikachu.vue'
	import uniGrid from "@/components/uni-grid/uni-grid.vue"
	import Qiniu from '@/common/upload.js'
	import uniCard from '@/components/uni-card/uni-card.vue'
	export default {
		components: {
			popup,
			pikachu,
			uniCard
		},
		data() {
			return {
				lists: [],
				bgColor: '#ffffff',
				textColor: '#73b9a2',
				gridsData: [{
					id: 1,
					lists: [{
						type: 'click',
						text: '身份证',
						icon: 'icon-id-card',
						mode: 'idcard'
					}, {
						type: 'click',
						text: '银行卡',
						icon: 'icon-shuaqiaqiapianyinhangqia',
						mode: 'bankcard'
					}, {
						type: 'click',
						text: '营业执照',
						icon: 'icon-yingyezhizhao',
						mode: 'bizlicense'
					}, {
						type: 'click',
						text: '驾驶证',
						icon: 'icon-jiashizheng',
						mode: 'drivinglicense'
					}, {
						type: 'click',
						text: '行驶证',
						icon: 'icon-hangshizheng',
						mode: 'driving'
					}, {
						type: 'click',
						text: '文字识别',
						icon: 'icon-wenzishibie___',
						mode: 'comm'
					}]
				}]
			};
		},
		computed: {
			selects() {
				return this.lists.filter(item => item.active).sort((a, b) => (a.id - b.id)).map(item => item.text)
			}
		},
		watch: {
			selects(nv) {
				if (nv.length === this.lists.length) {
					this.bgColor = '#73b9a2'
					this.textColor = '#ffffff'
				} else {
					this.textColor = '#73b9a2'
					this.bgColor = '#ffffff'
				}
			}
		},
		methods: {
			toggleSelect(item) {
				const items = this.lists.slice()
				items[item.id].active = !items[item.id].active
				this.lists = items
			},
			handleToggleAll() {
				let flag = false
				let items = this.lists.slice()
				items.forEach((item) => {
					if (item.active === false) {
						flag = true
					}
				})
				if (flag) {
					this.lists = items.map(item => {
						item.active = true
						return item
					})
				} else {
					this.lists = items.map(item => {
						item.active = false
						return item
					})
				}
			},
			handleSure() {
				const vx = this
				const text = this.selects.join('')
				uni.setClipboardData({
					data: text,
					success() {
						vx.$gd.uniToast({
							title: '复制成功',
							icon: 'success'
						})
					},
					fail() {
						vx.$gd.uniToast({
							title: '平台不支持复制到剪贴板'
						})
					}
				})
			},
			ocrWord(obj) {
				const vx = this
				const mode = obj.item.mode //comm,idcard,bankcard,bizlicense,drivinglicense,driving
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					success(res) {
						uni.showLoading({
							title: '识别中...'
						})
						Qiniu.upload(res.tempFilePaths[0], (res) => {
							vx.$gd.uniRequest({
								url: 'cornucopia/ocr/photo',
								isGet: false,
								notAuth: true,
								data: {
									imgUrl: res.imageURL,
									type: mode
								}
							}).then(res => {
								uni.hideLoading()
								if (res.data.errmsg === 'ok') {
									vx.$refs.popup.open()
									let lists = []
									switch (mode){
										case 'comm':
										lists = res.data.items.map((item, i) => {
											return {
												text: item.text,
												id: i,
												active: false
											}
										})
											break;
										default:
										const data = Object.keys(res.data).filter(item => item !== 'errcode' && item !== 'errmsg' && (typeof res.data[item] !== 'object'))
										lists = data.map((item, i) => {
											return {
												text: res.data[item],
												id: i,
												active: false
											}
										})
											break;
									}
									if (lists.length) {
										vx.lists = lists
									} else {
										vx.$gd.uniToast({
											title: '未识别到有效内容'
										})
									}
								} else {
									vx.$gd.uniToast({
										title: res.data.errmsg || '未识别到有效内容'
									})
								}
							}).catch(() => uni.hideLoading())
						}, (err) => {
							uni.hideLoading()
							vx.$gd.uniToast({
								title: err.errmsg || '上传失败，请稍后再试'
							})
						}, {
							region: 'NCN',
							domain: 'https://ifile.jialekoi.cn',
							uptokenURL: 'cornucopia/uploadToken',
							key: 'scan'
						}, () => {
							// 取消上传
						}, () => {
							// `before` 上传前执行的操作
						}, (err) => {
							// `complete` 上传接受后执行的操作(无论成功还是失败都执行)
						})
					}
				})
			},
			scanCode() {
				const vx = this
				uni.scanCode({
					success(res) {
						if (res.result) {
							vx.$gd.uniModal({
								title: '扫码结果',
								content: res.result,
								showCancel: true,
								confirmText: '复制',
								confirm: () => {
									uni.setClipboardData({
										data: res.result,
										success() {
											vx.$gd.uniToast({
												title: '复制成功',
												icon: 'success'
											})
										},
										fail() {
											vx.$gd.uniToast({
												title: '平台不支持复制到剪贴板'
											})
										}
									})
								}
							})
						} else if (res.path) {
							vx.$gd.uniModal({
								title: '小程序码路径',
								content: res.path
							})
						}
					},
					fail(err) {
						vx.$gd.uniToast({
							title: err.errMsg || '扫描失败'
						})
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	.scan-container {
		overflow: hidden;
	}

	.scan-bg-box {
		opacity: 0.1;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;
	}

	.copy-confirm-btn {
		position: fixed;
		bottom: 30rpx;
		left: 240rpx;
		height: 70rpx;
		border-radius: 35rpx;
		box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 5;
		font-size: 20rpx;
		&.toggle-all {
			left: 50rpx;

			&.active {
				background-color: var(--base-color);
				color: #fff;
			}
		}
		&.close {
			background-color: var(--base-color);
			color: #fff;
			left: 600rpx;
		}

		>text {
			color: var(--base-color);
			font-size: 32rpx;
		}
	}

	.scan-grid-box {
		position: relative;
		z-index: 2;
	}
	.scan-content-wrap {
		overflow-y: auto;
		overflow-x: hidden;
		height: 100vh;
		padding-bottom: 100rpx;
		box-sizing: border-box;
	}

	.scan-list-wrap {
		position: relative;
		z-index: 2;
		width: 100%;
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		flex-wrap: wrap;
		padding: 30rpx;

		>.list-item {
			padding: 0 15rpx;
			border-radius: 4rpx;
			margin: 10rpx 6rpx;
			line-height: 60rpx;
			background-color: #fff;
			font-size: 26rpx;
			color: #4a4a4a;
			max-width: 100%;
			box-sizing: border-box;

			&.active {
				background-color: var(--base-color);
				color: #fff;
			}
		}
	}
</style>
