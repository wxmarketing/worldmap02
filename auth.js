import { supabase, supabaseUrl, supabaseKey } from './supabase.js';

// 认证状态管理
let currentUser = null;
let authListeners = [];

// 初始化认证系统
export async function initAuth() {
  // 监听认证状态变化
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
    currentUser = session?.user || null;
    
    // 通知所有监听器
    authListeners.forEach(listener => listener(currentUser));
    
    // 更新UI
    updateAuthUI();
  });

  // 获取当前会话
  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session?.user || null;
  updateAuthUI();
}

// 添加认证状态监听器
export function onAuthStateChange(callback) {
  authListeners.push(callback);
  // 立即调用一次当前状态
  if (currentUser !== undefined) {
    callback(currentUser);
  }
}

// 获取当前用户
export function getCurrentUser() {
  return currentUser;
}

// 检查是否已登录
export function isAuthenticated() {
  return !!currentUser;
}

// 用户登录
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 用户注册功能已禁用
export async function signUp(email, password) {
  return { 
    success: false, 
    error: '注册功能已关闭，请联系管理员获取账号' 
  };
}

// 用户登出
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 更新认证UI
function updateAuthUI() {
  const authToggle = document.getElementById('auth-toggle');
  const userInfo = document.getElementById('user-info');
  const adminToggle = document.getElementById('admin-toggle');
  const globalReportsBtn = document.getElementById('global-reports-btn');
  
  if (currentUser) {
    // 已登录状态
    authToggle.textContent = '登出';
    authToggle.classList.add('logout-btn');
    
    userInfo.textContent = `欢迎，${currentUser.email}`;
    userInfo.classList.remove('hidden');
    
    // 显示管理面板和报告列表按钮
    if (adminToggle) adminToggle.style.display = 'inline-block';
    if (globalReportsBtn) globalReportsBtn.style.display = 'inline-block';
  } else {
    // 未登录状态
    authToggle.textContent = '登录';
    authToggle.classList.remove('logout-btn');
    
    userInfo.classList.add('hidden');
    
    // 隐藏管理面板和报告列表按钮
    if (adminToggle) adminToggle.style.display = 'none';
    if (globalReportsBtn) globalReportsBtn.style.display = 'none';
  }
}

// 显示认证模态框（仅支持登录）
export function showAuthModal(mode = 'login') {
  const overlay = document.getElementById('auth-overlay');
  const modal = document.getElementById('auth-modal');
  const title = document.getElementById('auth-title');
  const loginForm = document.getElementById('login-form');
  
  // 只显示登录表单
  title.textContent = '用户登录';
  loginForm.classList.remove('hidden');
  
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
}

// 隐藏认证模态框
export function hideAuthModal() {
  const overlay = document.getElementById('auth-overlay');
  const modal = document.getElementById('auth-modal');
  
  overlay.classList.add('hidden');
  modal.classList.add('hidden');
  
  // 清空表单
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  
  // 隐藏消息
  const message = document.getElementById('auth-message');
  message.classList.add('hidden');
  message.textContent = '';
}

// 显示认证消息
function showAuthMessage(message, type = 'error') {
  const messageEl = document.getElementById('auth-message');
  messageEl.textContent = message;
  messageEl.className = `auth-message ${type}`;
  messageEl.classList.remove('hidden');
}

// 初始化认证事件监听
export function initAuthEventListeners() {
  const authToggle = document.getElementById('auth-toggle');
  const authClose = document.getElementById('auth-close');
  const authOverlay = document.getElementById('auth-overlay');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const switchToRegister = document.getElementById('switch-to-register');
  const switchToLogin = document.getElementById('switch-to-login');
  
  // 认证按钮点击
  authToggle.addEventListener('click', async () => {
    if (currentUser) {
      // 登出
      const result = await signOut();
      if (result.success) {
        showAuthMessage('已成功登出', 'success');
        setTimeout(hideAuthModal, 1500);
      } else {
        showAuthMessage('登出失败：' + result.error, 'error');
      }
    } else {
      // 显示登录模态框
      showAuthModal('login');
    }
  });
  
  // 关闭模态框
  authClose.addEventListener('click', hideAuthModal);
  authOverlay.addEventListener('click', hideAuthModal);
  
  // 表单切换功能已移除（注册功能已关闭）
  
  // 登录表单提交
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const submitBtn = loginForm.querySelector('.auth-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '登录中...';
    
    const result = await signIn(email, password);
    
    submitBtn.disabled = false;
    submitBtn.textContent = '登录';
    
    if (result.success) {
      showAuthMessage('登录成功！', 'success');
      setTimeout(hideAuthModal, 1500);
    } else {
      showAuthMessage('登录失败：' + result.error, 'error');
    }
  });
  
  // 注册表单提交功能已移除
}

// 权限检查装饰器
export function requireAuth(callback) {
  return function(...args) {
    if (!isAuthenticated()) {
      showAuthModal('login');
      showAuthMessage('请先登录以访问此功能', 'error');
      return;
    }
    return callback.apply(this, args);
  };
}
