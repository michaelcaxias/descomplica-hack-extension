// Ponte ISOLATED do "Otimizar página": repassa a flag `optimize` (chrome.storage.local) ao script MAIN.
// O MAIN não tem acesso a chrome.*, então a configuração viaja por CustomEvent.
let optimize = false;
const send = () => window.dispatchEvent(new CustomEvent('desco-opt-cfg', { detail: JSON.stringify({ optimize }) }));
chrome.storage.local.get('optimize', (d) => { optimize = d.optimize === true; send(); });
chrome.storage.onChanged.addListener((c, area) => { if (area === 'local' && c.optimize) { optimize = c.optimize.newValue === true; send(); } });
window.addEventListener('desco-opt-hello', send);
