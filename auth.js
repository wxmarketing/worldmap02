import { supabase, supabaseUrl, supabaseAnonKey } from './supabase.js';

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
  const authReportsToggle = document.getElementById('auth-reports-toggle');
  const userInfo = document.getElementById('user-info');
  const adminToggle = document.getElementById('admin-toggle');
  const footerLogoutBtn = document.getElementById('footer-logout-btn');
  const changePwdBtn = document.getElementById('change-password-btn');
  
  if (currentUser) {
    // 已登录状态 - 显示报告列表按钮
    if (authReportsToggle) {
      authReportsToggle.textContent = '报告列表';
      authReportsToggle.classList.remove('auth-btn');
    }
    
    if (userInfo) {
      userInfo.textContent = `欢迎，${currentUser.email}`;
      userInfo.classList.remove('hidden');
    }
    
    if (footerLogoutBtn) {
      footerLogoutBtn.classList.remove('hidden');
    }
    if (changePwdBtn) {
      changePwdBtn.classList.remove('hidden');
    }
    
    // 显示管理面板按钮
    if (adminToggle) adminToggle.style.display = 'inline-block';
  } else {
    // 未登录状态 - 显示登录按钮
    if (authReportsToggle) {
      authReportsToggle.textContent = '登录';
      authReportsToggle.classList.add('auth-btn');
    }
    
    if (userInfo) {
      userInfo.classList.add('hidden');
    }
    
    if (footerLogoutBtn) {
      footerLogoutBtn.classList.add('hidden');
    }
    if (changePwdBtn) {
      changePwdBtn.classList.add('hidden');
    }
    
    // 隐藏管理面板按钮
    if (adminToggle) adminToggle.style.display = 'none';
  }
}

// 显示认证模态框（仅支持登录）
export function showAuthModal(mode = 'login') {
  const overlay = document.getElementById('auth-overlay');
  const modal = document.getElementById('auth-modal');
  const title = document.getElementById('auth-title');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const submitBtn = loginForm.querySelector('.auth-submit-btn');
  const authSwitch = loginForm.querySelector('.auth-switch');
  const formGroups = loginForm.querySelectorAll('.form-group');
  
  // 根据登录状态调整模态框内容
  if (currentUser) {
    // 已登录 - 显示账号信息和登出按钮
    title.textContent = '账号管理';
    formGroups.forEach(group => group.classList.add('hidden'));
    submitBtn.classList.add('hidden');
    // 在 authSwitch 中显示用户邮箱
    authSwitch.innerHTML = `<span style="font-size: 16px; font-weight: 500;">当前登录账号：${currentUser.email}</span>`;
    authSwitch.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
  } else {
    // 未登录 - 显示登录表单
    title.textContent = '用户登录';
    formGroups.forEach(group => group.classList.remove('hidden'));
    submitBtn.classList.remove('hidden');
    authSwitch.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
  }
  
  loginForm.classList.remove('hidden');
  overlay.classList.remove('hidden');
  modal.classList.remove('hidden');
}

// 隐藏认证模态框
export function hideAuthModal() {
  const overlay = document.getElementById('auth-overlay');
  const modal = document.getElementById('auth-modal');
  const loginForm = document.getElementById('login-form');
  const authSwitch = loginForm.querySelector('.auth-switch');
  
  overlay.classList.add('hidden');
  modal.classList.add('hidden');
  
  // 清空表单
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  
  // 恢复 authSwitch 原始内容
  if (authSwitch) {
    authSwitch.innerHTML = '<span>请联系管理员获取账号</span>';
  }
  
  // 隐藏消息
  const message = document.getElementById('auth-message');
  message.classList.add('hidden');
  message.textContent = '';
}

// 显示认证消息
export function showAuthMessage(message, type = 'error') {
  const messageEl = document.getElementById('auth-message');
  messageEl.textContent = message;
  messageEl.className = `auth-message ${type}`;
  messageEl.classList.remove('hidden');
}

// 初始化认证事件监听
export function initAuthEventListeners() {
  const authReportsToggle = document.getElementById('auth-reports-toggle');
  const authClose = document.getElementById('auth-close');
  const authOverlay = document.getElementById('auth-overlay');
  const loginForm = document.getElementById('login-form');
  
  // 认证/报告按钮点击
  authReportsToggle.addEventListener('click', async () => {
    if (currentUser) {
      // 已登录 - 打开报告列表
      if (window.openReportsDrawer) {
        window.openReportsDrawer();
      }
    } else {
      // 未登录 - 显示登录模态框
      showAuthModal('login');
    }
  });
  
  // 修改密码
  const changePwdBtn = document.getElementById('change-password-btn');
  if (changePwdBtn) {
    changePwdBtn.onclick = async () => {
      if (!currentUser) { showAuthModal('login'); return; }
      const pwd = prompt('请输入新密码（至少6位）');
      if (!pwd) return;
      if (pwd.length < 6) { alert('密码至少6位'); return; }
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) alert('修改失败：' + error.message);
      else alert('修改成功，请使用新密码重新登录');
    };
  }
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
  
  // 登出按钮点击（模态框内的）
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      logoutBtn.disabled = true;
      logoutBtn.textContent = '登出中...';
      
      const result = await signOut();
      
      logoutBtn.disabled = false;
      logoutBtn.textContent = '登出';
      
      if (result.success) {
        showAuthMessage('已成功登出', 'success');
        setTimeout(hideAuthModal, 1500);
      } else {
        showAuthMessage('登出失败：' + result.error, 'error');
      }
    });
  }
  
  // 页脚登出按钮点击
  const footerLogoutBtn = document.getElementById('footer-logout-btn');
  if (footerLogoutBtn) {
    footerLogoutBtn.addEventListener('click', async () => {
      footerLogoutBtn.disabled = true;
      footerLogoutBtn.textContent = '登出中...';
      
      const result = await signOut();
      
      footerLogoutBtn.disabled = false;
      footerLogoutBtn.textContent = '登出';
      
      if (result.success) {
        // 页脚登出不需要显示模态框消息，直接登出即可
        console.log('已成功登出');
      } else {
        alert('登出失败：' + result.error);
      }
    });
  }
  
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
