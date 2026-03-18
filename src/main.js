// 文件说明：前端启动入口
// 页面对应：所有页面共享的全局初始化代码
// 作用：统一注册状态管理、路由、UI 库和全局样式
import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import * as ElIcons from "@element-plus/icons-vue";
import "element-plus/dist/index.css";
import "highlight.js/styles/github.css";
import "@/assets/theme.css";
import App from "./App.vue";
import router from "@/router/index";

const app = createApp(App);

// 注册所有 Element Plus 图标
Object.entries(ElIcons).forEach(([name, component]) => {
  app.component(name, component);
});

// 挂载顺序：Pinia -> Router -> ElementPlus -> App
app
  .use(createPinia())
  .use(router)
  .use(ElementPlus, { locale: zhCn })
  .mount("#app");
