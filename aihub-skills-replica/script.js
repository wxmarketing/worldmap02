const skillsData = [
  {
    name: "AutoCoder Pro",
    category: "代码生成",
    description: "由 GPT-4 驱动的高级代码生成和重构工具。支持 30 多种语言。",
    rating: "4.9",
    icon: "</>",
    iconClass: "purple",
    users: "+2k",
  },
  {
    name: "Visionary AI",
    category: "图像 AI",
    description: "直接在您的设计工作流中进行高保真图像生成和编辑。",
    rating: "4.8",
    icon: "\uD83D\uDCF7",
    iconClass: "green",
    users: "+1.5k",
  },
  {
    name: "DataSense",
    category: "数据分析",
    description: "自动化的数据分析和可视化。几秒钟内将原始 CSV 转换为交互式仪表板。",
    rating: "4.7",
    icon: "\u25D5",
    iconClass: "orange",
    users: "+800",
  },
];

const uploadsData = [
  {
    name: "ChatAssist Pro",
    version: "v2.1.0",
    status: "活跃",
    downloads: "1,240",
  },
];

const cardsEl = document.getElementById("skills-cards");
const tabsEl = document.getElementById("skills-tabs");
const uploadListEl = document.getElementById("upload-list");
const dropZoneEl = document.getElementById("drop-zone");
const dropTitleEl = document.getElementById("drop-title");
const browseFileEl = document.getElementById("browse-file");
const fileInputEl = document.getElementById("file-input");

function renderSkills(filter) {
  const list =
    filter === "all"
      ? skillsData
      : skillsData.filter((item) => item.category === filter);

  if (list.length === 0) {
    cardsEl.innerHTML = '<div class="empty-state">暂无该分类的 Skills</div>';
    return;
  }

  cardsEl.innerHTML = list
    .map(
      (item) => `
      <article class="card">
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
          <button class="install">安装 ↓</button>
        </div>
      </article>
    `
    )
    .join("");
}

function renderUploads() {
  uploadListEl.innerHTML = uploadsData
    .map(
      (item) => `
      <div class="upload-item">
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
          <button class="pill">更新</button>
          <button class="trash">🗑</button>
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
  const filter = target.dataset.filter || "all";
  setActiveTab(target);
  renderSkills(filter);
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

dropZoneEl.addEventListener("drop", (event) => {
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;
  dropTitleEl.textContent = `已选择 ${files[0].name}`;
});

browseFileEl.addEventListener("click", (event) => {
  event.preventDefault();
  fileInputEl.click();
});

fileInputEl.addEventListener("change", () => {
  if (!fileInputEl.files || fileInputEl.files.length === 0) return;
  dropTitleEl.textContent = `已选择 ${fileInputEl.files[0].name}`;
});

renderSkills("all");
renderUploads();
