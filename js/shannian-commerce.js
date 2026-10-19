(() => {
  // ai.northcity.top is reachable from mainland China; *.workers.dev is not.
  // Keep both: the first working base is reused for the rest of the page.
  const API_CANDIDATES = (() => {
    const configured = Array.isArray(window.SHANNIAN_API_BASES) ? window.SHANNIAN_API_BASES : [];
    return [...new Set([
      ...configured,
      window.SHANNIAN_API_BASE,
      'https://ai.northcity.top',
      'https://waffo-webhook.chenxi19930623.workers.dev',
    ].filter(Boolean))];
  })();
  let activeApiBase = API_CANDIDATES[0];
  const SESSION_KEY = 'shannian.web.session.v1';
  const PENDING_PAYMENT_KEY = 'shannian.web.pending-payment.v1';
  const state = { user: null, activePlanId: null, codeTimers: new Map() };
  const isEnglish = () => document.documentElement.lang.toLowerCase().startsWith('en');
  const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  // Auth modal panels grouped by top-level tab; pills switch panels inside a group.
  const AUTH_PANEL_GROUPS = { sms: 'code', email: 'code', password: 'password', 'email-reset': 'password', register: 'register', 'email-register': 'register' };
  const AUTH_TAB_DEFAULTS = { code: 'sms', password: 'password', register: 'register' };
  const storage = (() => {
    try {
      // localStorage survives Waffo redirect and www/apex same-site hops better than sessionStorage.
      const probe = '__shannian_storage_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return window.localStorage;
    } catch {
      return window.sessionStorage;
    }
  })();

  // Migrate older sessionStorage values once so payment return pages still see login/pending.
  try {
    [SESSION_KEY, PENDING_PAYMENT_KEY].forEach((key) => {
      if (storage.getItem(key)) return;
      const legacy = window.sessionStorage.getItem(key);
      if (legacy) storage.setItem(key, legacy);
    });
  } catch (_) {}

  const readJson = (key) => {
    try { return JSON.parse(storage.getItem(key) || 'null'); } catch { return null; }
  };
  const writeJson = (key, value) => {
    storage.setItem(key, JSON.stringify(value));
  };
  const getSession = () => readJson(SESSION_KEY);
  const saveSession = (user) => {
    state.user = user;
    writeJson(SESSION_KEY, user);
    syncAccountUi();
  };
  const clearSession = () => {
    state.user = null;
    storage.removeItem(SESSION_KEY);
    syncAccountUi();
  };
  const UNAVAILABLE_STATUSES = new Set([404, 405, 501, 502, 503, 504]);
  const api = async (path, options = {}) => {
    const method = String(options.method || 'GET').toUpperCase();
    const headers = { ...(options.headers || {}) };
    // Avoid unnecessary CORS preflight on public GETs (e.g. /api/plans).
    if (method !== 'GET' && method !== 'HEAD' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const activeUser = state.user || getSession();
    if (options.auth !== false && activeUser?.sessionToken) headers.Authorization = `Bearer ${activeUser.sessionToken}`;
    const { auth: _auth, timeoutMs = 12000, ...fetchOptions } = options;
    const bases = [activeApiBase, ...API_CANDIDATES.filter((base) => base !== activeApiBase)];
    let lastError = null;
    for (let index = 0; index < bases.length; index += 1) {
      const base = bases[index];
      const isLast = index === bases.length - 1;
      const controller = new AbortController();
      // A blocked workers.dev connection hangs until timeout; probe faster
      // when another candidate is still available.
      const timer = window.setTimeout(() => controller.abort(), isLast ? timeoutMs : Math.min(timeoutMs, 7000));
      let response;
      try {
        response = await fetch(`${base}${path}`, { ...fetchOptions, method, headers, signal: controller.signal });
      } catch (error) {
        lastError = error;
        // Never replay a non-idempotent request after a timeout: it may have
        // reached the server (duplicate SMS code or checkout order).
        if (error?.name === 'AbortError' && method !== 'GET' && method !== 'HEAD') break;
        continue;
      } finally {
        window.clearTimeout(timer);
      }
      const unavailable = UNAVAILABLE_STATUSES.has(response.status);
      if (unavailable && !isLast) continue;
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) {
        if (unavailable && !isLast) continue;
        throw new Error(payload.error || '请求失败，请稍后重试');
      }
      activeApiBase = base;
      return payload;
    }
    if (lastError?.name === 'AbortError') throw new Error(isEnglish() ? 'Request timed out' : '请求超时，请稍后重试');
    throw new Error(isEnglish() ? 'Network error. Check your connection and try again.' : '网络连接失败，请检查网络后重试');
  };
  const toast = (message, type = '') => {
    const node = document.querySelector('.commerce-toast');
    if (!node) return;
    node.textContent = message;
    node.className = `commerce-toast ${type}`;
    node.hidden = false;
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => { node.hidden = true; }, 3400);
  };
  const openModal = (id) => { const node = document.getElementById(id); if (node) node.hidden = false; };
  const closeModal = (id) => { const node = document.getElementById(id); if (node) node.hidden = true; };
  const formatMembership = (user) => {
    if (!user?.isPro || !user.proType) return isEnglish() ? 'Free account' : '免费用户';
    if (user.proType === 'lifetime' || user.proType === 'lifetime_early_bird') return isEnglish() ? 'Lifetime member' : '终身会员';
    const names = isEnglish()
      ? { monthly: 'Monthly member', quarterly: 'Quarterly member', yearly: 'Yearly member' }
      : { monthly: '月度会员', quarterly: '季度会员', yearly: '年度会员' };
    const date = user.proExpireDate ? ` · 至 ${new Date(user.proExpireDate).toLocaleDateString('zh-CN')}` : '';
    return `${names[user.proType] || (isEnglish() ? 'Member' : '会员')}${date}`;
  };
  const loginLabel = () => isEnglish() ? 'Log in / Sign up' : '登录 / 注册';
  const syncAccountUi = () => {
    const trigger = document.getElementById('account-trigger');
    const summary = document.getElementById('account-summary');
    const name = state.user?.nickname || state.user?.username || state.user?.mobilePhoneNumber || (window.i18n ? window.i18n.t('nav.brand') : '闪念用户');
    const avatarUrl = state.user?.avatarUrl || '';
    const defaultAvatar = (trigger?.dataset.defaultAvatar)
      || (document.querySelector('.brand-mark')?.getAttribute('src'))
      || 'assets/icons/Appicon.png';
    const setAvatar = (container, image, { allowHide = false } = {}) => {
      if (!container || !image) return;
      const hasPhoto = Boolean(avatarUrl);
      if (allowHide && !state.user) {
        container.hidden = true;
        return;
      }
      container.hidden = false;
      container.classList.toggle('is-photo', hasPhoto);
      image.src = hasPhoto ? avatarUrl : defaultAvatar;
      image.alt = hasPhoto ? `${name}的头像` : '闪念';
    };
    if (trigger) {
      trigger.querySelector('[data-account-label]').textContent = state.user ? name : loginLabel();
      setAvatar(trigger.querySelector('[data-account-avatar]'), trigger.querySelector('[data-account-avatar-image]'));
    }
    if (summary) {
      if (!state.user) return;
      summary.querySelector('[data-account-name]').textContent = name;
      summary.querySelector('[data-account-phone]').textContent = state.user.mobilePhoneNumber || state.user.email || state.user.username || '';
      const membership = summary.querySelector('[data-membership]');
      membership.textContent = formatMembership(state.user);
      membership.classList.toggle('free', !state.user.isPro);
      setAvatar(summary.querySelector('[data-profile-avatar]'), summary.querySelector('[data-profile-avatar-image]'));
    }
  };
  const refreshUser = async ({ clearOnError = true } = {}) => {
    const saved = getSession();
    if (!saved?.sessionToken || !saved?.objectId) return;
    state.user = saved;
    try {
      const { user } = await api(`/api/auth/me?objectId=${encodeURIComponent(saved.objectId)}`);
      saveSession({ ...saved, ...user, sessionToken: saved.sessionToken });
    } catch {
      // Keep the local session during payment verification; a transient /me failure
      // must not wipe credentials before verifyPayment can activate membership.
      if (clearOnError) clearSession();
    }
  };
  const setAuthPanel = (name) => {
    const group = AUTH_PANEL_GROUPS[name] || name;
    document.querySelectorAll('[data-auth-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.authTab === group));
    document.querySelectorAll('[data-auth-methods]').forEach((node) => { node.hidden = node.dataset.authMethods !== group; });
    document.querySelectorAll('[data-auth-method]').forEach((button) => button.classList.toggle('is-active', button.dataset.authMethod === name));
    document.querySelectorAll('[data-auth-form]').forEach((form) => { form.hidden = form.dataset.authForm !== name; });
  };
  const startCodeCountdown = (button) => {
    if (!button.dataset.idleLabel) button.dataset.idleLabel = button.textContent;
    const idleLabel = button.dataset.idleLabel;
    let remaining = 60;
    const label = () => (isEnglish() ? `Retry in ${remaining}s` : `${remaining}s 后重发`);
    button.textContent = label();
    const timer = window.setInterval(() => {
      remaining -= 1;
      button.textContent = remaining > 0 ? label() : idleLabel;
      if (remaining <= 0) { window.clearInterval(timer); button.disabled = false; }
    }, 1000);
  };
  const requestSms = async (button) => {
    const form = button.closest('form');
    const phone = form?.querySelector('input[name="phone"]')?.value || '';
    button.disabled = true;
    try {
      await api('/api/auth/send-sms', { method: 'POST', body: JSON.stringify({ phone }), auth: false });
      toast(isEnglish() ? 'Code sent. Check your SMS.' : '验证码已发送，请查收短信', 'success');
      startCodeCountdown(button);
    } catch (error) { toast(error.message, 'error'); button.disabled = false; }
  };
  const requestEmailCode = async (button) => {
    const form = button.closest('form');
    const email = String(form?.querySelector('input[name="email"]')?.value || '').trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) { toast(isEnglish() ? 'Enter a valid email address' : '请输入正确的邮箱地址', 'error'); return; }
    const purpose = form?.dataset.emailPurpose === 'reset' ? 'reset' : 'login';
    button.disabled = true;
    try {
      await api('/api/auth/send-email-code', { method: 'POST', body: JSON.stringify({ email, purpose }), auth: false });
      toast(isEnglish() ? 'Code sent to your email. Valid for 5 minutes.' : '验证码已发送至邮箱，5 分钟内有效', 'success');
      startCodeCountdown(button);
    } catch (error) { toast(error.message, 'error'); button.disabled = false; }
  };
  const validateAuthValues = (mode, values) => {
    if (typeof values.email === 'string') {
      values.email = values.email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(values.email)) return isEnglish() ? 'Enter a valid email address' : '请输入正确的邮箱地址';
    }
    if ((mode === 'email' || mode === 'email-register' || mode === 'email-reset') && !/^\d{6}$/.test(String(values.code || ''))) {
      return isEnglish() ? 'Enter the 6-digit code' : '请输入 6 位验证码';
    }
    if (typeof values.password === 'string' && (values.password.length < 6 || values.password.length > 16)) {
      return isEnglish() ? 'Password must be 6-16 characters' : '密码长度需为 6-16 位';
    }
    return null;
  };
  const submitAuth = async (form) => {
    const values = Object.fromEntries(new FormData(form));
    const mode = form.dataset.authForm;
    const invalidMessage = validateAuthValues(mode, values);
    if (invalidMessage) { toast(invalidMessage, 'error'); return; }
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      if (mode === 'email-reset') {
        // Password reset issues no session; jump back to password login prefilled.
        await api('/api/auth/reset-password-email', { method: 'POST', body: JSON.stringify(values), auth: false });
        toast(isEnglish() ? 'Password reset. Log in with your new password.' : '密码已重置，请使用新密码登录', 'success');
        const accountInput = document.querySelector('[data-auth-form="password"] input[name="account"]');
        if (accountInput) accountInput.value = values.email;
        form.reset();
        setAuthPanel('password');
        return;
      }
      let response;
      if (mode === 'sms') response = await api('/api/auth/login-sms', { method: 'POST', body: JSON.stringify(values), auth: false });
      if (mode === 'email') response = await api('/api/auth/login-email', { method: 'POST', body: JSON.stringify(values), auth: false });
      if (mode === 'password') response = await api('/api/auth/login-password', { method: 'POST', body: JSON.stringify(values), auth: false });
      if (mode === 'register') response = await api('/api/auth/register-password', { method: 'POST', body: JSON.stringify(values), auth: false });
      if (mode === 'email-register') response = await api('/api/auth/register-email', { method: 'POST', body: JSON.stringify(values), auth: false });
      saveSession(response.user);
      closeModal('auth-modal');
      toast(isEnglish() ? 'Logged in. Welcome back!' : '登录成功，欢迎回来', 'success');
      if (state.activePlanId) { const planId = state.activePlanId; state.activePlanId = null; await startCheckout(planId); }
    } catch (error) { toast(error.message, 'error'); } finally { button.disabled = false; }
  };
  const startCheckout = async (planId) => {
    if (!state.user) { state.activePlanId = planId; openModal('auth-modal'); return; }
    const button = document.querySelector(`[data-plan-id="${planId}"]`);
    if (button) { button.disabled = true; button.textContent = isEnglish() ? 'Creating secure order…' : '正在创建安全订单…'; }
    try {
      const { session } = await api('/api/checkout', { method: 'POST', body: JSON.stringify({ planId, objectId: state.user.objectId }) });
      writeJson(PENDING_PAYMENT_KEY, { planId, since: Date.now() });
      window.location.assign(session.checkoutUrl);
    } catch (error) {
      toast(error.message, 'error');
      if (button) { button.disabled = false; button.textContent = isEnglish() ? 'Buy securely' : '安全购买'; }
    }
  };
  const loadPlans = async () => {
    if (!document.querySelector('[data-price-plan]')) return;
    const note = document.getElementById('pricing-live-note');
    try {
      // Prices are public; login is only required when starting checkout.
      const { plans } = await api('/api/plans', { auth: false, timeoutMs: 10000 });
      document.querySelectorAll('[data-price-plan]').forEach((node) => {
        const plan = plans[node.dataset.pricePlan];
        if (!plan) return;
        const price = node.querySelector('[data-price]');
        const period = node.querySelector('[data-period]');
        if (price) { price.textContent = plan.displayPrice || `${plan.amount} ${plan.currency}`; price.classList.remove('loading'); }
        if (period) {
          period.textContent = isEnglish()
            ? (node.dataset.pricePlan === 'yearly' ? '/ year' : node.dataset.pricePlan === 'monthly' ? '/ month' : 'one time')
            : (node.dataset.pricePlan === 'yearly' ? '/年' : node.dataset.pricePlan === 'monthly' ? '/月' : '一次性');
        }
      });
      if (note) note.textContent = isEnglish()
        ? 'Prices are synced live from Waffo. Sign in only when you buy; checkout shows the final amount and taxes.'
        : '价格已同步自 Waffo。浏览无需登录，购买时再登录；税费以结算页为准。';
    } catch (error) {
      // Keep fallback prices visible and leave buy buttons enabled (checkout still requires login).
      if (note) note.textContent = isEnglish()
        ? 'Showing list prices. Live sync is temporarily unavailable; final amount appears at checkout after sign-in.'
        : '当前展示列表价。实时价格暂时不可用，登录购买时以收银台金额为准。';
    }
  };
  const bind = () => {
    document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', () => closeModal(button.dataset.closeModal)));
    document.querySelectorAll('.commerce-modal').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) modal.hidden = true; }));
    document.querySelectorAll('[data-auth-tab]').forEach((button) => button.addEventListener('click', () => setAuthPanel(AUTH_TAB_DEFAULTS[button.dataset.authTab] || button.dataset.authTab)));
    document.querySelectorAll('[data-auth-method]').forEach((button) => button.addEventListener('click', () => setAuthPanel(button.dataset.authMethod)));
    document.querySelectorAll('[data-auth-goto]').forEach((button) => button.addEventListener('click', () => setAuthPanel(button.dataset.authGoto)));
    document.querySelectorAll('[data-send-sms]').forEach((button) => button.addEventListener('click', () => requestSms(button)));
    document.querySelectorAll('[data-send-email-code]').forEach((button) => button.addEventListener('click', () => requestEmailCode(button)));
    document.querySelectorAll('[data-auth-form]').forEach((form) => form.addEventListener('submit', (event) => { event.preventDefault(); submitAuth(form); }));
    document.querySelectorAll('[data-plan-id]').forEach((button) => button.addEventListener('click', () => startCheckout(button.dataset.planId)));
    document.getElementById('account-trigger')?.addEventListener('click', () => openModal(state.user ? 'account-modal' : 'auth-modal'));
    document.getElementById('logout-button')?.addEventListener('click', () => { clearSession(); closeModal('account-modal'); toast('已安全退出登录'); });
  };
  const initialize = async () => {
    if (window.__shannianCommerceInitialized) return;
    window.__shannianCommerceInitialized = true;
    bind();
    syncAccountUi();
    // Load public prices immediately; user session refresh is independent.
    await Promise.all([refreshUser(), loadPlans()]);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else window.queueMicrotask(initialize);
  document.addEventListener('i18nchange', syncAccountUi);
  window.ShanNianWeb = { api, getSession, saveSession, refreshUser, toast, PENDING_PAYMENT_KEY };
})();
