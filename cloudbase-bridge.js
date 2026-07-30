(function () {
  const TOKEN_KEY = "roiAccountToken";
  const app = cloudbase.init({
    env: "cloud1-d1g32jup6bf0a71b3",
    region: "ap-shanghai"
  });

  async function request(action, payload) {
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
