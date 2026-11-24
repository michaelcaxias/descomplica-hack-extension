// "Otimizar página": liga/desliga os rulesets DNR conforme a flag `optimize` (padrão: desligado).
async function applyOptimize() {
    const { optimize } = await chrome.storage.local.get('optimize');
    const ids = ['opt_kaltura', 'opt_block3p', 'opt_cache'];
    try {
        await chrome.declarativeNetRequest.updateEnabledRulesets(
            optimize === true ? { enableRulesetIds: ids } : { disableRulesetIds: ids }
        );
    } catch (e) { console.error('Error applying optimizer rulesets:', e); }
}
chrome.runtime.onStartup.addListener(applyOptimize);

chrome.runtime.onInstalled.addListener(async () => {
    applyOptimize();
    // Configura V2 por padrão caso não tenha nada no Local Storage
    const data = await chrome.storage.local.get('version');
    // O modo "Legado" (v1) foi removido: migra quem o tinha salvo para o modo atual.
    const version = (data.version === 'v1' ? 'v2' : data.version) || 'v2';

    if (data.version !== version) {
        await chrome.storage.local.set({ version });
    }

    updateContentScripts(version);
});

// Fica escutando as mudanças causadas quando o usuário clica no menu (popup)
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.version) {
        updateContentScripts(changes.version.newValue);
    }
    if (area === 'local' && changes.optimize) {
        applyOptimize();
    }
});

async function updateContentScripts(version) {
    // Limpa todas os scipts correntes de interceptação registradas antes
    try {
        const scripts = await chrome.scripting.getRegisteredContentScripts();
        const ids = scripts.map(s => s.id);
        if (ids.length > 0) {
            await chrome.scripting.unregisterContentScripts({ ids });
        }
    } catch (e) {
        console.error("Error clearing scripts:", e);
    }

    // Registra V2 - Roda no MAIN Object Context com Mutation Observer & Vue Factory (DOM Lifecycle Final)
    if (version === 'v2') {
        try {
            await chrome.scripting.registerContentScripts([{
                id: "v2-scripts",
                matches: ["*://aulas.descomplica.com.br/*"],
                js: [
                    "v2/enums/StrategyType.js",
                    "v2/strategies/QuestionStrategy.js",
                    "v2/strategies/RevisionQuestionStrategy.js",
                    "v2/strategies/ObjectiveTriviaStrategy.js",
                    "v2/strategies/ClozeQuestionStrategy.js",
                    "v2/factories/StrategyFactory.js",
                    "v2/content.js"
                ],
                css: ["v2/styles.css"],
                runAt: "document_end",
                world: "MAIN"
            },
            {
                id: "v2-bridge",
                matches: ["*://aulas.descomplica.com.br/*"],
                js: ["v2/isolated_bridge.js"],
                runAt: "document_start",
                world: "ISOLATED"
            }]);
            console.log("V2 (Vue Strategy Monkey Patch) Applied");
        } catch (e) { console.error('Error injecting V2:', e); }
    }

    // Se "off", nós simplismente não registramos nenhum script (apenas deixamos desregistrado e limpo em memória).
}

// ---- Aviso de atualização -------------------------------------------------
// Extensão carregada "sem compactação" não se atualiza sozinha. A cada 6 h (e ao instalar/iniciar)
// consultamos o último release público no GitHub; se for mais novo que o instalado, mostramos um aviso no popup.
// Só um GET em api.github.com: nada do usuário é enviado.
const UPDATE_API = 'https://api.github.com/repos/michaelcaxias/descomplica-hack-extension/releases/latest';
const UPDATE_ALARM = 'check-update';

function isNewer(latest, current) {
    const a = String(latest).replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);
    const b = String(current).replace(/^v/i, '').split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
    }
    return false;
}

async function checkUpdate(currentVersion = chrome.runtime.getManifest().version) {
    try {
        const res = await fetch(UPDATE_API, { headers: { Accept: 'application/vnd.github+json' } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const rel = await res.json();
        const available = isNewer(rel.tag_name, currentVersion);
        await chrome.storage.local.set({
            update: {
                available,
                version: String(rel.tag_name).replace(/^v/i, ''),
                name: rel.name || rel.tag_name,
                pageUrl: rel.html_url,
                zipUrl: rel.zipball_url,
                checkedAt: Date.now()
            }
        });
        await chrome.action.setBadgeBackgroundColor({ color: '#dd6b20' });
        await chrome.action.setBadgeText({ text: available ? '!' : '' });
        return available;
    } catch (e) {
        console.warn('Update check failed:', e);
        return false;
    }
}

function scheduleUpdateChecks() {
    chrome.alarms.create(UPDATE_ALARM, { delayInMinutes: 1, periodInMinutes: 360 });
}
chrome.alarms.onAlarm.addListener((alarm) => { if (alarm.name === UPDATE_ALARM) checkUpdate(); });
chrome.runtime.onInstalled.addListener(scheduleUpdateChecks);
chrome.runtime.onStartup.addListener(scheduleUpdateChecks);
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg && msg.type === 'check-update') { checkUpdate().then(() => sendResponse({ ok: true })); return true; }
});
