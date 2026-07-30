(function () {
  const TOKEN_KEY = "roiAccountToken";
  const app = cloudbase.init({
    env: "cloud1-d1g32jup6bf0a71b3",
    region: "ap-shanghai"
  });
  const auth = typeof app.auth === "function" ? app.auth() : app.auth;
  let authReady;

  async function ensureCloudbaseLogin() {
    if (authReady) return authReady;
    authReady = (async function () {
      if (!auth) throw new Error("云开发身份认证初始化失败，请稍后重试。");

      if (typeof auth.getLoginState === "function") {
        const loginState = await auth.getLoginState();
        if (loginState) return;
      }

      if (typeof auth.signInAnonymously === "function") {
        const response = await auth.signInAnonymously();
        if (response && response.error) throw response.error;
        return;
      }

      if (typeof auth.anonymousAuthProvider === "function") {
        await auth.anonymousAuthProvider().signIn();
        return;
      }

      throw new Error("当前云开发 SDK 不支持匿名登录。");
    })().catch(function (error) {
      authReady = null;
      throw error;
    });
    return authReady;
  }

  async function request(action, payload) {
    await ensureCloudbaseLogin();
    const token = localStorage.getItem(TOKEN_KEY) || "";
    const response = await app.callFunction({
      name: "roiAccount",
      data: {
        action,
        token,
        ...(payload || {})
      }
    });
    const result = response && response.result ? response.result : {};
    const data = result && result.data ? result.data : {};
    if (result.statusCode < 200 || result.statusCode >= 300) {
      throw new Error(data.message || "账号服务连接失败，请稍后重试。");
    }
    if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
    return data;
  }

  window.roiCloudRequest = request;
  window.roiCloudClearSession = function () {
    localStorage.removeItem(TOKEN_KEY);
  };
})();
