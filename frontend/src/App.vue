<template>
  <!-- 根组件只负责路由出口，页面结构由各个 view 自己决定 -->
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<!--
  文件说明：应用根组件
  页面对应：整个前端应用的最外层入口
  作用：提供页面切换过渡动画，挂载当前路由对应的页面
-->

<style>
/* 页面切换过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}

.page-enter-to,
.page-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
