const skillsData = [
  {
    id: "autocoder-pro",
    name: "AutoCoder Pro",
    category: "代码生成",
    description: "由 GPT-4 驱动的高级代码生成和重构工具。支持 30 多种语言。",
    rating: "4.9",
    icon: "</>",
    iconClass: "purple",
    users: "+2k",
    fileName: "autocoder-pro.skill.json",
  },
  {
    id: "visionary-ai",
    name: "Visionary AI",
    category: "图像 AI",
    description: "直接在您的设计工作流中进行高保真图像生成和编辑。",
    rating: "4.8",
    icon: "\uD83D\uDCF7",
    iconClass: "green",
    users: "+1.5k",
    fileName: "visionary-ai.skill.json",
  },
  {
    id: "datasense",
    name: "DataSense",
    category: "数据分析",
    description: "自动化的数据分析和可视化。几秒钟内将原始 CSV 转换为交互式仪表板。",
    rating: "4.7",
    icon: "\u25D5",
    iconClass: "orange",
    users: "+800",
    fileName: "datasense.skill.json",
  },
  {
    id: "promptforge",
    name: "PromptForge",
    category: "代码生成",
    description: "将自然语言需求快速转为结构化提示词模板，适配多模型调用。",
    rating: "4.6",
    icon: "✦",
    iconClass: "purple",
    users: "+1.1k",
    fileName: "promptforge.skill.json",
  },
  {
    id: "pixelpilot",
    name: "PixelPilot",
    category: "图像 AI",
    description: "支持批量图像增强、风格迁移和素材统一调色，提升品牌视觉一致性。",
    rating: "4.7",
    icon: "🖼",
    iconClass: "green",
    users: "+960",
    fileName: "pixelpilot.skill.json",
  },
  {
    id: "sheetmind",
    name: "SheetMind",
    category: "数据分析",
    description: "将表格数据自动生成可解释图表，并输出关键洞察摘要与建议动作。",
    rating: "4.8",
    icon: "◔",
    iconClass: "orange",
    users: "+1.3k",
    fileName: "sheetmind.skill.json",
  },
  {
    id: "briefgenie",
    name: "BriefGenie",
    category: "代码生成",
    description: "根据产品文档自动生成开发任务清单、接口草案和验收检查项。",
    rating: "4.5",
    icon: "{}",
    iconClass: "purple",
    users: "+700",
    fileName: "briefgenie.skill.json",
  },
  {
    id: "visionboard-ai",
    name: "VisionBoard AI",
    category: "图像 AI",
    description: "一键生成活动主视觉方案，支持多尺寸导出与设计规范检查。",
    rating: "4.6",
    icon: "🎞",
    iconClass: "green",
    users: "+880",
    fileName: "visionboard-ai.skill.json",
  },
];

let uploadsData = [
  {
    id: "chatassist-pro",
    name: "ChatAssist Pro",
    version: "v2.1.0",
    status: "活跃",
    downloads: "1,240",
  },
];

const cardsEl = document.getElementById("skills-cards");
const tabsEl = document.getElementById("skills-tabs");
const moreBtnEl = document.getElementById("skills-more-btn");
const uploadListEl = document.getElementById("upload-list");
const searchInputEl = document.getElementById("skills-search");
const dropZoneEl = document.getElementById("drop-zone");
const dropTitleEl = document.getElementById("drop-title");
const browseFileEl = document.getElementById("browse-file");
const fileInputEl = document.getElementById("file-input");
const dropProgressEl = document.getElementById("drop-progress");
const dropProgressBarEl = document.getElementById("drop-progress-bar");
const authBtnEl = document.getElementById("auth-btn");
const authGateEl = document.getElementById("auth-gate");
const authGateBtnEl = document.getElementById("auth-gate-btn");
const dashboardContentEl = document.getElementById("dashboard-content");
const authModalEl = document.getElementById("auth-modal");
const authFormEl = document.getElementById("auth-form");
const authEmailEl = document.getElementById("auth-email");
const authPasswordEl = document.getElementById("auth-password");
const authSubmitBtnEl = document.getElementById("auth-submit-btn");
const authSwitchBtnEl = document.getElementById("auth-switch-btn");
const authCloseBtnEl = document.getElementById("auth-close-btn");
const authModeHintEl = document.getElementById("auth-mode-hint");
const authModalTitleEl = document.getElementById("auth-modal-title");
const profileNameEl = document.getElementById("profile-name");
const profileSubtitleEl = document.getElementById("profile-subtitle");

const state = {
  activeFilter: "all",
  keyword: "",
  showAllSkills: false,
  user: null,
  authMode: "signin",
};

let uploadProgressTimer = null;
const DEFAULT_VISIBLE_SKILLS = 3;
let supabase = null;
let supabaseReady = false;

function createToast(message) {
  const toastEl = document.createElement("div");
  toastEl.className = "toast";
  toastEl.textContent = message;
  document.body.appendChild(toastEl);

  requestAnimationFrame(() => toastEl.classList.add("show"));
  setTimeout(() => {
    toastEl.classList.remove("show");
    setTimeout(() => toastEl.remove(), 220);
  }, 1800);
}

async function getSupabaseClient() {
  if (supabaseReady) return supabase;
  supabaseReady = true;
  try {
    const module = await import("./supabase.client.js");
    supabase = module.supabase ?? null;
  } catch (error) {
    supabase = null;
  }
  return supabase;
}

function updateAuthModeUI() {
  const isSignIn = state.authMode === "signin";
  authModalTitleEl.textContent = isSignIn ? "登录 AIHub" : "注册 AIHub";
  authModeHintEl.textContent = isSignIn
    ? "使用邮箱和密码登录后即可管理上传内容。"
    : "注册后即可解锁上传管理功能。";
  authSubmitBtnEl.textContent = isSignIn ? "登录" : "注册";
  authSwitchBtnEl.textContent = isSignIn ? "没有账号？去注册" : "已有账号？去登录";
}

function openAuthModal(mode = "signin") {
  state.authMode = mode;
  updateAuthModeUI();
  authModalEl.classList.remove("is-hidden");
  authEmailEl.focus();
}

function closeAuthModal() {
  authModalEl.classList.add("is-hidden");
  authFormEl.reset();
}

function updateAuthUI() {
  const isAuthed = !!state.user;
  authGateEl.classList.toggle("is-hidden", isAuthed);
  dashboardContentEl.classList.toggle("is-hidden", !isAuthed);
  authBtnEl.textContent = isAuthed ? "退出登录" : "登录";

  if (isAuthed) {
    const email =
      state.user?.email ||
      state.user?.user_metadata?.email ||
      state.user?.identities?.[0]?.identity_data?.email ||
      "";
    const displayName = email.includes("@") ? email.split("@")[0] : "已登录用户";
    profileNameEl.textContent = displayName || "已登录用户";
    profileSubtitleEl.textContent = email || "已登录账号";
  } else {
    profileNameEl.textContent = "user";
    profileSubtitleEl.textContent = "专业创作者";
  }
}

function getFilteredSkills() {
  const keyword = state.keyword.trim().toLowerCase();

  return skillsData.filter((item) => {
    const categoryMatched =
      state.activeFilter === "all" || item.category === state.activeFilter;

    const textMatched =
      keyword.length === 0 ||
      `${item.name} ${item.description}`.toLowerCase().includes(keyword);

    return categoryMatched && textMatched;
  });
}

function renderSkills() {
  const list = getFilteredSkills();
  const visibleList = state.showAllSkills
    ? list
    : list.slice(0, DEFAULT_VISIBLE_SKILLS);

  cardsEl.innerHTML =
    list.length === 0
      ? '<div class="empty-state">暂无匹配的 Skills，请尝试其它关键词。</div>'
      : visibleList
          .map((item) => {
            return `
              <article class="card" data-skill-id="${item.id}">
                <div class="card-head">
                  <span class="skill-icon ${item.iconClass}">${item.icon}</span>
                  <span class="rating">⭐ ${item.rating}</span>
                </div>
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="card-footer">
                  <div class="avatars">
                    <span class="mini-avatar"></span>
                    <span class="mini-avatar"></span>
                    <span class="mini-count">${item.users}</span>
                  </div>
                  <button class="install" data-install-id="${item.id}">安装 ↓</button>
                </div>
              </article>
            `;
          })
          .join("");

  if (list.length <= DEFAULT_VISIBLE_SKILLS) {
    moreBtnEl.classList.add("is-hidden");
  } else {
    moreBtnEl.classList.remove("is-hidden");
    moreBtnEl.textContent = state.showAllSkills ? "收起Skills" : "查看所有Skills";
  }

  cardsEl.classList.add("cards-enter");
  setTimeout(() => cardsEl.classList.remove("cards-enter"), 300);
}

function renderUploads() {
  uploadListEl.innerHTML = uploadsData
    .map(
      (item) => `
      <div class="upload-item" data-upload-id="${item.id}">
        <div class="upload-left">
          <div class="pkg-icon">🤖</div>
          <div>
            <strong>${item.name}</strong>
            <p>${item.version} ・ <span class="state">${item.status}</span></p>
          </div>
        </div>
        <div class="upload-right">
          <div class="downloads">
            <strong>${item.downloads}</strong>
            <span>下载量</span>
          </div>
          <button class="pill" data-action="update">更新</button>
          <button class="trash" data-action="delete">🗑</button>
        </div>
      </div>
    `
    )
    .join("");
}

function setActiveTab(tabElement) {
  tabsEl.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
  tabElement.classList.add("active");
}

tabsEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;
  state.activeFilter = target.dataset.filter || "all";
  state.showAllSkills = false;
  setActiveTab(target);
  renderSkills();
});

searchInputEl.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  state.keyword = target.value;
  state.showAllSkills = false;
  renderSkills();
});

moreBtnEl.addEventListener("click", () => {
  state.showAllSkills = !state.showAllSkills;
  cardsEl.classList.add("cards-expand");
  renderSkills();
  setTimeout(() => cardsEl.classList.remove("cards-expand"), 360);
});

authBtnEl.addEventListener("click", async () => {
  const client = await getSupabaseClient();
  if (!state.user) {
    if (!client) {
      createToast("登录服务暂不可用，请稍后重试");
      return;
    }
    openAuthModal("signin");
    return;
  }
  const { error } = await client.auth.signOut();
  if (error) {
    createToast(`退出失败：${error.message}`);
    return;
  }
  state.user = null;
  updateAuthUI();
  createToast("已退出登录");
});

authGateBtnEl.addEventListener("click", () => openAuthModal("signin"));

authSwitchBtnEl.addEventListener("click", () => {
  state.authMode = state.authMode === "signin" ? "signup" : "signin";
  updateAuthModeUI();
});

authCloseBtnEl.addEventListener("click", closeAuthModal);

authModalEl.addEventListener("click", (event) => {
  if (event.target === authModalEl) closeAuthModal();
});

authFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = authEmailEl.value.trim();
  const password = authPasswordEl.value;
  if (!email || !password) return;

  authSubmitBtnEl.disabled = true;
  const oldText = authSubmitBtnEl.textContent;
  authSubmitBtnEl.textContent = state.authMode === "signin" ? "登录中..." : "注册中...";

  const client = await getSupabaseClient();
  if (!client) {
    authSubmitBtnEl.disabled = false;
    authSubmitBtnEl.textContent = oldText || "登录";
    createToast("登录服务暂不可用，请稍后重试");
    return;
  }

  let error = null;
  let authData = null;
  if (state.authMode === "signin") {
    ({ data: authData, error } = await client.auth.signInWithPassword({ email, password }));
  } else {
    ({ data: authData, error } = await client.auth.signUp({ email, password }));
  }

  authSubmitBtnEl.disabled = false;
  authSubmitBtnEl.textContent = oldText || "登录";

  if (error) {
    createToast(`操作失败：${error.message}`);
    return;
  }

  // 兜底：不依赖 onAuthStateChange 回调，登录成功立即刷新用户态
  const userFromResp = authData?.user || authData?.session?.user || null;
  if (userFromResp) {
    state.user = userFromResp;
    updateAuthUI();
  }

  createToast(state.authMode === "signin" ? "登录成功" : "注册成功，请查收验证邮件");
  closeAuthModal();
});

document.addEventListener("keydown", (event) => {
  const isQuickSearch = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
  if (!isQuickSearch) return;
  event.preventDefault();
  searchInputEl.focus();
});

cardsEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const installBtn = target.closest("[data-install-id]");
  if (!(installBtn instanceof HTMLButtonElement)) return;
  const skillId = installBtn.dataset.installId;
  if (!skillId) return;
  if (installBtn.classList.contains("is-loading")) return;

  const skill = skillsData.find((item) => item.id === skillId);
  if (!skill) {
    createToast("未找到对应 Skill 文件");
    return;
  }

  const originalLabel = installBtn.textContent;
  installBtn.classList.add("is-loading");
  installBtn.textContent = "准备下载...";

  setTimeout(() => {
    if (skill.downloadUrl) {
      const link = document.createElement("a");
      link.href = skill.downloadUrl;
      link.download = skill.fileName || `${skill.id}.zip`;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      createToast(`开始下载：${link.download}`);
    } else {
      const packagePayload = {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        description: skill.description,
        createdAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(packagePayload, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const blobUrl = URL.createObjectURL(blob);
      const fallbackLink = document.createElement("a");
      fallbackLink.href = blobUrl;
      fallbackLink.download = skill.fileName || `${skill.id}.skill.json`;
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      fallbackLink.remove();
      URL.revokeObjectURL(blobUrl);
      createToast(`开始下载：${fallbackLink.download}`);
    }

    installBtn.classList.remove("is-loading");
    installBtn.textContent = originalLabel || "安装 ↓";
  }, 650);
});

function runMockUploadProgress() {
  if (uploadProgressTimer) {
    clearInterval(uploadProgressTimer);
    uploadProgressTimer = null;
  }

  let progress = 0;
  dropProgressEl.classList.add("show");
  dropProgressBarEl.style.width = "0%";

  uploadProgressTimer = setInterval(() => {
    progress += Math.floor(Math.random() * 24) + 8;
    if (progress >= 100) {
      progress = 100;
      clearInterval(uploadProgressTimer);
      uploadProgressTimer = null;
      setTimeout(() => dropProgressEl.classList.remove("show"), 550);
    }
    dropProgressBarEl.style.width = `${progress}%`;
  }, 120);
}

function onFilePicked(file) {
  dropTitleEl.textContent = `已选择 ${file.name}`;
  runMockUploadProgress();
  createToast(`已选择文件：${file.name}`);
}

dropZoneEl.addEventListener("drop", (event) => {
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;
  onFilePicked(files[0]);
});

browseFileEl.addEventListener("click", (event) => {
  event.preventDefault();
  fileInputEl.click();
});

fileInputEl.addEventListener("change", () => {
  if (!fileInputEl.files || fileInputEl.files.length === 0) return;
  onFilePicked(fileInputEl.files[0]);
});

renderSkills();
renderUploads();

uploadListEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const actionBtn = target.closest("[data-action]");
  if (!(actionBtn instanceof HTMLButtonElement)) return;

  const action = actionBtn.dataset.action;
  const uploadItemEl = actionBtn.closest("[data-upload-id]");
  const uploadId = uploadItemEl?.getAttribute("data-upload-id");
  if (!uploadId) return;

  if (action === "delete") {
    uploadsData = uploadsData.filter((item) => item.id !== uploadId);
    renderUploads();
    createToast("已删除插件记录");
    return;
  }

  if (action === "update") {
    uploadsData = uploadsData.map((item) => {
      if (item.id !== uploadId) return item;
      const currentPatch = Number(item.version.split(".").at(-1) || "0");
      return {
        ...item,
        version: item.version.replace(/\d+$/, String(currentPatch + 1)),
        status: "最新",
      };
    });
    renderUploads();
    createToast("插件已更新到最新版本");
  }
});

function setDropZoneState(isActive) {
  dropZoneEl.classList.toggle("is-dragging", isActive);
  dropTitleEl.textContent = isActive ? "释放即可上传技能包" : "拖放您的技能包";
}

["dragenter", "dragover"].forEach((eventName) => {
  dropZoneEl.addEventListener(eventName, (event) => {
    event.preventDefault();
    setDropZoneState(true);
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropZoneEl.addEventListener(eventName, (event) => {
    event.preventDefault();
    setDropZoneState(false);
  });
});

async function initAuth() {
  const client = await getSupabaseClient();
  if (!client) {
    state.user = null;
    updateAuthUI();
    return;
  }
  try {
    const {
      data: { session },
    } = await client.auth.getSession();
    state.user = session?.user ?? null;
    updateAuthUI();
  } catch (error) {
    createToast("认证服务暂不可用，已隐藏上传区域");
    state.user = null;
    updateAuthUI();
  }

  client.auth.onAuthStateChange((_event, session) => {
    state.user = session?.user ?? null;
    updateAuthUI();
  });
}

initAuth();

