const domainInput = document.getElementById('domainInput');
const addDomainBtn = document.getElementById('addDomain');
const exclusionList = document.getElementById('exclusionList');
const autoCollapse = document.getElementById('autoCollapse');
const removeDuplicates = document.getElementById('removeDuplicates');

const DEFAULT_SETTINGS = {
  autoGroup: true,
  excludedDomains: [],
  autoCollapse: false,
  removeDuplicates: false,
  customRules: []
};

const rulePattern = document.getElementById('rulePattern');
const ruleName = document.getElementById('ruleName');
const ruleColor = document.getElementById('ruleColor');
const addRuleBtn = document.getElementById('addRule');
const ruleList = document.getElementById('ruleList');

// 設定の読み込みと表示
async function loadSettings() {
    const data = await chrome.storage.local.get(['settings']);
    const settings = data.settings || DEFAULT_SETTINGS;

    autoCollapse.checked = settings.autoCollapse;
    removeDuplicates.checked = settings.removeDuplicates;
    
    renderExclusionList(settings.excludedDomains);
    renderRuleList(settings.customRules || []);
}

// 除外リストの描画
function renderExclusionList(domains) {
    exclusionList.innerHTML = '';
    domains.forEach(domain => {
        const li = document.createElement('li');
        li.className = 'exclusion-item';
        li.innerHTML = `
            <span>${domain}</span>
            <span class="btn-remove" data-domain="${domain}">削除</span>
        `;
        exclusionList.appendChild(li);
    });
}

// カスタムルールリストの描画
function renderRuleList(rules) {
    ruleList.innerHTML = '';
    rules.forEach((rule, index) => {
        const li = document.createElement('li');
        li.className = 'exclusion-item';
        li.innerHTML = `
            <div>
                <span style="font-weight: bold; color: ${rule.color === 'grey' ? '#64748b' : rule.color};">●</span>
                <span title="${rule.pattern}">${rule.name}</span>
                <span style="font-size: 11px; color: #64748b; margin-left: 8px;">(${rule.pattern})</span>
            </div>
            <span class="btn-remove-rule" data-index="${index}" style="color: #ef4444; cursor: pointer; font-size: 14px;">削除</span>
        `;
        ruleList.appendChild(li);
    });
}

// 設定の保存
async function updateSettings(updates) {
    const data = await chrome.storage.local.get(['settings']);
    const settings = data.settings || DEFAULT_SETTINGS;
    const newSettings = { ...settings, ...updates };
    await chrome.storage.local.set({ settings: newSettings });
    return newSettings;
}

// イベントリスナー
autoCollapse.addEventListener('change', () => {
    updateSettings({ autoCollapse: autoCollapse.checked });
});

removeDuplicates.addEventListener('change', () => {
    updateSettings({ removeDuplicates: removeDuplicates.checked });
});

addDomainBtn.addEventListener('click', async () => {
    const domain = domainInput.value.trim().toLowerCase();
    if (domain) {
        const data = await chrome.storage.local.get(['settings']);
        const settings = data.settings || DEFAULT_SETTINGS;
        
        if (!settings.excludedDomains.includes(domain)) {
            const newList = [...settings.excludedDomains, domain];
            const updated = await updateSettings({ excludedDomains: newList });
            renderExclusionList(updated.excludedDomains);
            domainInput.value = '';
        }
    }
});

exclusionList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-remove')) {
        const domainToRemove = e.target.dataset.domain;
        const data = await chrome.storage.local.get(['settings']);
        const settings = data.settings || DEFAULT_SETTINGS;
        
        const newList = settings.excludedDomains.filter(d => d !== domainToRemove);
        const updated = await updateSettings({ excludedDomains: newList });
        renderExclusionList(updated.excludedDomains);
    }
});

// イベントリスナー
addRuleBtn.addEventListener('click', async () => {
    const pattern = rulePattern.value.trim().toLowerCase();
    const name = ruleName.value.trim();
    const color = ruleColor.value;

    if (pattern && name) {
        const data = await chrome.storage.local.get(['settings']);
        const settings = data.settings || DEFAULT_SETTINGS;
        const customRules = settings.customRules || [];
        
        const newRules = [...customRules, { pattern, name, color }];
        const updated = await updateSettings({ customRules: newRules });
        renderRuleList(updated.customRules);
        
        rulePattern.value = '';
        ruleName.value = '';
    }
});

ruleList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-remove-rule')) {
        const index = parseInt(e.target.dataset.index);
        const data = await chrome.storage.local.get(['settings']);
        const settings = data.settings || DEFAULT_SETTINGS;
        
        const newRules = settings.customRules.filter((_, i) => i !== index);
        const updated = await updateSettings({ customRules: newRules });
        renderRuleList(updated.customRules);
    }
});

// 初期化
loadSettings();
