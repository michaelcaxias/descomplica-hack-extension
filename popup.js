document.addEventListener('DOMContentLoaded', async () => {
    const radioButtons = document.querySelectorAll('input[name="engine"]');
    const autoConfirmBox = document.getElementById('auto-confirm');
    const warning = document.getElementById('reload-warning');

    // Recupera configurações correntes gravadas na memótia local (Service Worker)
    const { version, autoConfirm, optimize } = await chrome.storage.local.get(['version', 'autoConfirm', 'optimize']);
    const optimizeBox = document.getElementById('optimize');
    optimizeBox.checked = optimize === true;
    optimizeBox.addEventListener('change', async (e) => {
        await chrome.storage.local.set({ optimize: e.target.checked });
        warning.style.display = 'block';
    });

    // Marca o rádio correspondente (por default, nossa V2)
    // O antigo modo "Legado" (v1) foi removido: quem tinha ele salvo cai no modo atual.
    const selectedRadio = document.getElementById(version === 'v1' ? 'v2' : (version || 'v2'));
    if (selectedRadio) {
        selectedRadio.checked = true;
    }

    // Marca o checkbox Auto-Confirmar se previamente gravado
    if (autoConfirm) {
        autoConfirmBox.checked = true;
    }

    // Escuta a ação em todos input radios listados para mudar contexto
    for (const radio of radioButtons) {
        radio.addEventListener('change', async (e) => {
            const newVersion = e.target.value;
            // Só avisa a Service Worker para injetar outro bloco na página principal
            await chrome.storage.local.set({ version: newVersion });

            // Exibe mensagem simpática exigindo o F5 do browser do usuário
            warning.style.display = 'block';
        });
    }

    // Escuta a ação expecífica de Auto-Confirm do checkbox da V2
    if (autoConfirmBox) {
        autoConfirmBox.addEventListener('change', async (e) => {
            await chrome.storage.local.set({ autoConfirm: e.target.checked });
            warning.style.display = 'block';
        });
    }

    // Aviso de atualização (preenchido pelo background a cada 6 h)
    const banner = document.getElementById('update-banner');
    const statusEl = document.getElementById('update-status');
    const renderUpdate = async () => {
        const { update } = await chrome.storage.local.get('update');
        if (!update) { statusEl.textContent = ''; return; }
        const current = chrome.runtime.getManifest().version;
        if (update.available) {
            document.getElementById('update-version').textContent = update.version;
            document.getElementById('update-zip').href = update.zipUrl;
            document.getElementById('update-page').href = update.pageUrl;
            banner.style.display = 'block';
            statusEl.textContent = '';
        } else {
            banner.style.display = 'none';
            statusEl.textContent = 'v' + current + ' (atualizada) ·';
        }
    };
    await renderUpdate();
    document.getElementById('update-now').addEventListener('click', async () => {
        statusEl.textContent = 'Verificando...';
        await chrome.runtime.sendMessage({ type: 'check-update' });
        await renderUpdate();
    });
});
