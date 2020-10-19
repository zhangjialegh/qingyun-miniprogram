<template>
	<view class="container">
		<mescroll-uni :down="downOption" @down="downCallback" :up="upOption" @up="upCallback">
			<sideslip v-for="(item) in locationLists" :key="item.id" @remove="deleteLocation(item.id)" :options="options">
				<div class='record-item'>
					<view class='logo-box' @longpress.stop="callPhone(item)">
						<text>{{item.logo}}</text>
					</view>
					<view class='record'>
						<text class='title'>{{item.name}}</text>
						<text class='desc'>{{item.address}}</text>
					</view>
					<button class="image-box" @tap.stop='goNavigate(item)' hover-class='button-hover-class' plain>
						<image src="/static/navigate.png"></image>
					</button>
				</div>
			</sideslip>
		</mescroll-uni>

		<!-- 添加卡片按钮 -->
		<button plain class='add-btn' @tap='goAddLocation'>
			<text class='iconfont icon-plus'></text>
		</button>
	</view>
</template>

<script>
	import sideslip from '@/components/sideslip/sideslip.vue'
	import MescrollUni from 'mescroll-uni'
	import Vue from 'vue'
	export default {
		components: {
			sideslip,
			MescrollUni
		},
		data() {
			return {
				locationLists: [],
				mescroll: {},
				options: [
					{
						text: '删除',
						event: 'remove',
						type: 'warn'
					}
				],
				upOption: {
					use: true,
					auto: true,
					page: {
						num: 0,
						size: 8
					},
					noMoreSize: 10,
					empty: {
						tip: '暂无数据'
					}
				},
				downOption: {
					use: true,
					auto: false
				},
			};
		},
		computed: {

		},
		methods: {
			downCallback(mescroll) {
				mescroll.resetUpScroll()
			},
			upCallback(mescroll) {
				const token = Vue.store.state.accessToken || uni.getStorageSync(Vue.cg.STORAGE_KEY)
				if (!token) {
					mescroll.endDownScroll()
					mescroll.hideUpScroll()
					mescroll.showEmpty()
				}
				const vx = this
				let pageNum = mescroll.num; // 页码, 默认从1开始
				let pageSize = mescroll.size; // 页长, 默认每页10条
				if (mescroll.num == 1) {
					this.mescroll = mescroll
				}
				Vue.gd.uniRequest({
					url: 'location/list',
					isGet: true,
					data: {
						page: pageNum,
						limit: pageSize
					}
				}).then(res => {
					let curPageData = res.data.map(item => {
						item['updatedAt'] = Vue.gd.smartTime(item['updatedAt'])
						return item
					})
					let hasNext = res.data.length >= 8
					
					//设置列表数据
					if(mescroll.num == 1) vx.locationLists = []; //如果是第一页需手动置空列表
					vx.locationLists = vx.locationLists.concat(curPageData); //追加新数据
					mescroll.endSuccess(curPageData.length, hasNext); 
				}).catch(err => {
					mescroll.endDownScroll()
					mescroll.hideUpScroll()
					mescroll.showEmpty()
					mescroll.endErr()
				})
				
			},
			getAllLocations() {
				this.downCallback(this.mescroll)
			},
			goAddLocation() {
				let isLogin = this.$store.state.accessToken ? true : false
				// #ifdef H5
				isLogin = true
				// #endif
				if (isLogin) {
					uni.navigateTo({
						url: '/pages/navigation/location/location'
					})
				} else {
					uni.navigateTo({
						url: '/pages/sendcode/sendcode'
					})
				}
				
			},

			// 点击导航
			goNavigate(item) {
				uni.openLocation({
					longitude: item.lng,
					latitude: item.lat,
					name: item.name,
					address: item.address
				})
			},

			// 删除卡片
			deleteLocation(id) {
				const vx = this
				this.$gd.uniRequest({
					url: 'location/delete',
					isGet: true,
					data: {
						id
					}
				}).then(res => {
					if (res.success) {
						vx.locationLists = vx.locationLists.filter(item => item.id != id)
					}
				})
			},
			callPhone(item) {
				if (item.tel) {
					const phone = item.tel.split(',')[0]
					this.$gd.uniModal({
					title: phone,
					content: '拨打电话？',
					confirmText: '拨打',
					showCancel: true,
					confirm: () => {
						uni.makePhoneCall({
							phoneNumber: phone
						})
					}
				})
				}
			}
		}
	}
</script>

<style>
	.add-btn {
		width: 100rpx;
		height: 100rpx;
		position: fixed;
		bottom: 50rpx;
		right: 50rpx;
		background: #07c160 !important;
		border-radius: 50% !important;
		overflow: hidden;
		padding: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 5;
		border: none;
	}

	.add-btn>.iconfont {
		font-size: 26rpx;
		color: #fff;
	}

	.record-item {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		padding: 30rpx;
		position: relative;
		text-align: left;
		height: auto;
		line-height: 1.5;
	}
	.record-item > .image-box {
		position: absolute;
		right: 30rpx;
		top: 50%;
		transform: translateY(-50%);
		width: 70rpx;
		height: 70rpx;
		padding: 0;
		border-radius: 50%;
	}
	.record-item > .image-box > image {
		width: 100%;
		height: 100%;
	}

	.record-item>.logo-box {
		height: 100rpx;
		width: 100rpx;
		border: 1rpx solid var(--border-light-color);
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 70rpx;
		margin-right: 30rpx;
	}

	.record-item>.record {
		display: flex;
		align-items: flex-start;
		justify-content: center;
		flex-direction: column;
	}

	.record-item>.record>text {
		display: inline-block;
		width: 500rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: left;
	}

	.record-item>.record>.title {
		font-size: 32rpx;
		color: var(--text-base-color);
	}

	.record-item>.record>.desc {
		font-size: 26rpx;
		color: var(--text-grey-color);
	}

	.record-item>.operation {
		position: absolute;
		width: 80rpx;
		height: 80rpx;
		top: 50%;
		right: 30rpx;
		transform: translateY(-50%);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.record-item>.operation>.iconfont {
		font-size: 50rpx;
		color: var(--base-color);
	}

	button {
		border-radius: 0;
		text-align: left;
	}
</style>
