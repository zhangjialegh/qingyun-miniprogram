<template>
	<view class="sw-grid-wrap">
		<view class="grid-wrap" v-for="(list, i) in gridList" :key="i">
			<view class="grid-title" v-if="list.title">{{list.title}}</view>
			<view class="grid-item-box">
				<view class="grid-item" v-for="(item, index) in list.lists" :key="index" hover-class="hover" :style="'width:calc(100% / '+column+')'"
				 :class="{'no-border-right':(index+1)%column==0,'no-border-top':index+1>column, 'no-border-bottom':noBorderBottom(i,index), 'no-border':!border}"
				 @tap="jump(item.path, index, item)">
					<image :src="item.image" v-if="item.image"></image>
					<view class="iconfont" :class="[item.icon]" v-if="item.icon"></view>
					<view class="name">{{item.text}}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			gridList: {
				type: Array
			},
			column: {
				type: Number,
				default: 3
			},
			border: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {}
		},
		methods: {
			//最后一行-取消底部边框
			noBorderBottom(i, index) {
				let len = this.gridList[i].lists.length
				let row = parseInt(len / this.column)
				if (len % this.column === 0) {
					return index + 1 > (row - 1) * this.column
				}
				return index + 1 > row * this.column
			},
			//跳转
			jump(url, index, item) {
				//如果是点击类型的，那么就直接返回当前点击的数据以及索引回去
				if (item.type === 'click') {
					const obj = {
						item,
						index
					}
					this.$emit('tapGrid', obj)
					return
				}
				uni.navigateTo({
					url
				})
			}
		}

	};
</script>

<style scoped lang="scss">
	.grid-wrap {
		width: 96%;
		margin-left: 2%;
		background-color: rgba(255, 255, 255, 0.8);
		border-radius: 20upx;
		// box-shadow: 0 0 5upx 2upx #efefef;
		margin-top: 15upx;
		font-size: 28upx;

		.grid-title {
			padding: 30rpx;
			color: #666666;
			font-size: 26rpx;
		}

		.grid-item-box {
			display: flex;
			align-items: center;
			flex-wrap: wrap;

			.grid-item {
				text-align: center;
				padding: 35upx 0;
				width: calc(100% / 3);
				box-sizing: border-box;
				border-right: .5upx solid #eaeaea;
				border-top: .5upx solid #eaeaea;
				border-bottom: .5upx solid #eaeaea;

				image {
					width: 50rpx;
					height: 50rpx;
				}
				.iconfont {
					font-size: 50rpx;
				}

				.name {
					font-size: 24rpx;
					margin-top: 15rpx;
					color: #4a4a4a;
				}
			}

			.hover {
				background: #efefef;
			}

			.no-border-right {
				border-right: none;
			}

			.no-border-bottom {
				border-bottom: none
			}

			.no-border-top {
				border-top: none
			}

			.no-border {
				border: none !important
			}
		}
	}
</style>
