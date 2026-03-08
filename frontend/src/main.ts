import { createApp } from "vue";
import 'vuetify/styles';
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import vuetify from "./plugins/vuetify";
import { useAuthStore } from "./stores/auth";
import { logger } from "./utils/logger";

const app = createApp(App);
const pinia = createPinia();

app.config.errorHandler = (error, instance, info) => {
  logger.error("Global Vue error:", error, info, instance);
};

app.use(pinia);
app.use(router);
app.use(vuetify);

async function bootstrap() {
  const authStore = useAuthStore(pinia);
  await authStore.initSession();
  await router.isReady();
  app.mount("#app");
}

bootstrap();
