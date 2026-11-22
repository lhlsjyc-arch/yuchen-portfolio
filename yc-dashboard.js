const ycReadingProgress = document.querySelector("[data-yc-reading-progress]");
const ycDemo = document.querySelector("[data-yc-demo]");
const ycDemoPanel = document.querySelector("[data-yc-demo-panel]");
const ycStepButtons = [...document.querySelectorAll("[data-yc-step]")];
const ycNextButton = document.querySelector("[data-yc-next]");
const ycReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updateYcReadingProgress() {
  if (!ycReadingProgress) return;
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
  ycReadingProgress.style.transform = `scaleX(${progress})`;
}

updateYcReadingProgress();
window.addEventListener("scroll", updateYcReadingProgress, { passive: true });
window.addEventListener("resize", updateYcReadingProgress);

const ycDemoStates = {
  capture: {
    status: "Listening to your intent",
    pill: "CAPTURING",
    overline: "VOICE INPUT · 00:18",
    primary: "“先把 YC Dashboard 的页面做了。它比较简单，但要讲清楚我为什么需要一个自己的 AI 工作台。”",
    showWave: true,
    understandingTitle: "SYSTEM UNDERSTANDING",
    understandingMeta: "Review before sending",
    rows: [
      ["01", "Intent", "制作 YC Dashboard 作品集页面"],
      ["02", "Constraint", "个人实验，不包装成商业产品"],
      ["03", "Outcome", "可浏览、可演示、移动端可读"],
    ],
    secondary: "保存为笔记",
    primaryAction: "确认并委托",
    assumption: "页面先作为个人实验入口，不占三个商业案例的主位置。",
  },
  clarify: {
    status: "Waiting for one decision",
    pill: "NEEDS INPUT",
    overline: "CLARIFICATION · 1 QUESTION",
    primary: "你希望语音输入只是快速记录，还是要在确认意图后直接创建并委托任务？",
    showWave: false,
    understandingTitle: "WHY THIS MATTERS",
    understandingMeta: "Your answer changes the flow",
    rows: [
      ["A", "Save only", "保留语音与转写，稍后再整理"],
      ["B", "Create task", "确认项目与目标后继续委托"],
      ["C", "Ask every time", "每次都让用户选择，不替用户假定"],
    ],
    secondary: "只保存记录",
    primaryAction: "选择 B 并继续",
    assumption: "当前采用“确认后委托”；系统不会把每段语音自动变成任务。",
  },
  working: {
    status: "Building the case page",
    pill: "WORKING",
    overline: "CURRENT STEP · 2 OF 3",
    primary: "正在把语音输入从一个入口，提升为案例的核心功能。",
    showWave: false,
    understandingTitle: "LIVE ACTIVITY",
    understandingMeta: "Pause or take over anytime",
    rows: [
      ["✓", "Evidence", "已读取项目细节与现有网站结构"],
      ["02", "Now", "设计语音原文与系统理解的分层"],
      ["03", "Next", "验证桌面、移动端与 reduced motion"],
    ],
    secondary: "暂停任务",
    primaryAction: "查看当前工作",
    assumption: "所有需要真实产品图的区域只保留占位，不生成替代插画。",
  },
  review: {
    status: "Ready for your review",
    pill: "REVIEW",
    overline: "OUTPUT · CASE PAGE V1",
    primary: "页面已经可以浏览。现在需要确认故事是否准确，以及哪些真实素材可以替换占位内容。",
    showWave: false,
    understandingTitle: "REVIEW CHECKLIST",
    understandingMeta: "2 decisions remain",
    rows: [
      ["✓", "Story", "语音输入成为案例主线"],
      ["!", "Evidence", "需要补真实界面与使用记录"],
      ["!", "Naming", "YC 的公开全称仍待确认"],
    ],
    secondary: "提出修改",
    primaryAction: "接受这一版",
    assumption: "接受页面不等同于声明产品已上线；项目状态始终显示为 WIP。",
  },
};

function createYcUnderstandingRow([index, label, value]) {
  const item = document.createElement("li");
  const marker = document.createElement("i");
  const copy = document.createElement("span");
  const title = document.createElement("b");

  marker.textContent = index;
  title.textContent = label;
  copy.append(title, document.createTextNode(value));
  item.append(marker, copy);
  return item;
}

function setYcDemoState(step, options = {}) {
  const state = ycDemoStates[step];
  if (!state || !ycDemo || !ycDemoPanel) return;

  ycDemo.dataset.activeStep = step;
  ycDemoPanel.dataset.step = step;

  ycStepButtons.forEach((button) => {
    const active = button.dataset.ycStep === step;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
    if (active) ycDemoPanel.setAttribute("aria-labelledby", button.id);
  });

  const agentStatus = ycDemoPanel.querySelector("[data-yc-agent-status]");
  const statusPill = ycDemoPanel.querySelector("[data-yc-status-pill]");
  const overline = ycDemoPanel.querySelector("[data-yc-overline]");
  const primary = ycDemoPanel.querySelector("[data-yc-primary]");
  const wave = ycDemoPanel.querySelector("[data-yc-wave]");
  const understanding = ycDemoPanel.querySelector("[data-yc-understanding]");
  const understandingHeader = understanding?.querySelector("header span");
  const understandingMeta = understanding?.querySelector("header b");
  const list = ycDemoPanel.querySelector("[data-yc-list]");
  const assumption = ycDemoPanel.querySelector("[data-yc-assumption]");
  const actionButtons = ycDemoPanel.querySelectorAll("[data-yc-actions] button");

  if (agentStatus) agentStatus.textContent = state.status;
  if (statusPill) statusPill.textContent = state.pill;
  if (overline) overline.textContent = state.overline;
  if (primary) primary.textContent = state.primary;
  if (wave) wave.hidden = !state.showWave;
  if (understandingHeader) understandingHeader.textContent = state.understandingTitle;
  if (understandingMeta) understandingMeta.textContent = state.understandingMeta;
  if (assumption) assumption.textContent = state.assumption;
  if (actionButtons[0]) actionButtons[0].textContent = state.secondary;
  if (actionButtons[1]) {
    actionButtons[1].replaceChildren(document.createTextNode(`${state.primaryAction} `));
    const arrow = document.createElement("span");
    arrow.textContent = "→";
    actionButtons[1].append(arrow);
  }

  if (list) list.replaceChildren(...state.rows.map(createYcUnderstandingRow));

  if (options.focus) {
    ycStepButtons.find((button) => button.dataset.ycStep === step)?.focus();
  }
}

ycStepButtons.forEach((button, index) => {
  button.addEventListener("click", () => setYcDemoState(button.dataset.ycStep));
  button.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let nextIndex = index;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + ycStepButtons.length) % ycStepButtons.length;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % ycStepButtons.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = ycStepButtons.length - 1;
    setYcDemoState(ycStepButtons[nextIndex].dataset.ycStep, { focus: true });
  });
});

ycNextButton?.addEventListener("click", () => {
  const activeIndex = Math.max(0, ycStepButtons.findIndex((button) => button.getAttribute("aria-selected") === "true"));
  const nextIndex = Math.min(ycStepButtons.length - 1, activeIndex + 1);
  setYcDemoState(ycStepButtons[nextIndex].dataset.ycStep);
});

setYcDemoState("capture");

const ycVoiceCard = document.querySelector("[data-yc-voice-card]");
const ycVoiceToggle = document.querySelector("[data-yc-voice-toggle]");
const ycVoiceLabel = document.querySelector("[data-yc-voice-label]");
const ycVoiceTime = document.querySelector("[data-yc-voice-time]");
const ycVoiceReset = document.querySelector("[data-yc-voice-reset]");
const ycVoiceConfirm = document.querySelector("[data-yc-voice-confirm]");
const ycEditTranscript = document.querySelector("[data-yc-edit-transcript]");
const ycVoiceTranscript = document.querySelector("[data-yc-voice-result] section > p");
let ycVoiceSeconds = 0;
let ycVoiceTimer = 0;

function formatYcVoiceTime(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainder = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function stopYcVoiceTimer() {
  window.clearInterval(ycVoiceTimer);
  ycVoiceTimer = 0;
}

function setYcVoiceState(state) {
  if (!ycVoiceCard || !ycVoiceToggle || !ycVoiceLabel || !ycVoiceTime || !ycVoiceConfirm) return;
  ycVoiceCard.dataset.state = state;
  const recording = state === "recording";
  const ready = state === "ready" || state === "confirmed";

  ycVoiceToggle.setAttribute("aria-pressed", String(recording));
  ycVoiceToggle.setAttribute("aria-label", recording ? "停止语音输入" : "开始语音输入");
  ycVoiceConfirm.disabled = !ready;

  if (state === "idle") {
    ycVoiceLabel.textContent = "点击开始说话";
    ycVoiceSeconds = 0;
    ycVoiceTime.textContent = "00:00";
    ycVoiceConfirm.replaceChildren(document.createTextNode("确认并创建任务 "));
    const arrow = document.createElement("span");
    arrow.textContent = "→";
    ycVoiceConfirm.append(arrow);
  }

  if (recording) {
    ycVoiceLabel.textContent = "正在保留你的原始表达 · 点击停止";
    stopYcVoiceTimer();
    ycVoiceTimer = window.setInterval(() => {
      ycVoiceSeconds += 1;
      ycVoiceTime.textContent = formatYcVoiceTime(ycVoiceSeconds);
    }, 1000);
  } else {
    stopYcVoiceTimer();
  }

  if (state === "ready") {
    ycVoiceLabel.textContent = "转写完成 · 请检查系统理解";
    if (ycVoiceSeconds < 8) {
      ycVoiceSeconds = 18;
      ycVoiceTime.textContent = "00:18";
    }
  }

  if (state === "confirmed") {
    ycVoiceLabel.textContent = "任务已创建，并保留原始语音";
    ycVoiceConfirm.textContent = "已委托 ✓";
  }
}

ycVoiceToggle?.addEventListener("click", () => {
  const currentState = ycVoiceCard?.dataset.state || "idle";
  if (currentState === "recording") {
    setYcVoiceState("ready");
    return;
  }
  setYcVoiceState("recording");
});

ycVoiceReset?.addEventListener("click", () => setYcVoiceState("idle"));
ycVoiceConfirm?.addEventListener("click", () => {
  if (!ycVoiceConfirm.disabled) setYcVoiceState("confirmed");
});

ycEditTranscript?.addEventListener("click", () => {
  if (!ycVoiceTranscript) return;
  const editing = ycVoiceTranscript.contentEditable === "true";
  ycVoiceTranscript.contentEditable = String(!editing);
  ycEditTranscript.textContent = editing ? "编辑" : "完成";
  if (!editing) {
    ycVoiceTranscript.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(ycVoiceTranscript);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
});

if (ycReducedMotion.matches) {
  document.documentElement.dataset.ycReducedMotion = "true";
}
