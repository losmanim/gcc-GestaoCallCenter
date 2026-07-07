(async function() {
    'use strict';

    if (!window.Auth) return;
    if (!(await Auth.requireAuth())) return;

    var loadingEl = document.getElementById('loadingOverlay');
    window.currentUser = await Auth.getUser();

    await carregarTudoAppwrite();
    processarAprovacoes();
    seedData();

    if (loadingEl) loadingEl.classList.add('hidden');

    initSidebar();
    renderDashboard();
    renderLeads();
    updateLeadsBadge();

})();
