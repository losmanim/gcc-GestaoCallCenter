(function() {
    'use strict';

    window.renderDashboard = function() {
        var clientes = getClientes();
        var servicos = getServicos();
        var contratos = getContratos();
        var totalCli = clientes.length;
        var cAtivos = contratos.filter(function(c) { return c.estado === 'Ativo'; });
        var receita = cAtivos.reduce(function(s, c) { return s + (parseFloat(c.valor) || 0); }, 0);
        var pendentes = contratos.filter(function(c) { return c.estado === 'Pendente'; }).length;

        document.getElementById('kpiClientes').textContent = totalCli;
        document.getElementById('kpiContratos').textContent = cAtivos.length;
        document.getElementById('kpiReceita').innerHTML = receita.toFixed(2) + '&euro; <span class="small">/m&ecirc;s</span>';
        document.getElementById('kpiPendentes').textContent = pendentes;

        var leads = getLeads();
        var leadsNaoLidos = leads.filter(function(l) { return !l.lido; }).length;
        var kpiLeads = document.getElementById('kpiLeads');
        if (kpiLeads) {
            kpiLeads.textContent = leadsNaoLidos;
            kpiLeads.className = 'kpi-value' + (leadsNaoLidos > 0 ? ' amber' : '');
        }

        updateLeadsBadge();
        renderGraficoOperadoras();
        renderGraficoServicos();
        renderUltimosClientes();
    };

    function renderGraficoOperadoras() {
        var contratos = getContratos();
        var servicos = getServicos();
        var el = document.getElementById('graficoOperadoras');
        var count = {};
        contratos.filter(function(c) { return c.estado === 'Ativo'; }).forEach(function(c) {
            var s = servicos.find(function(x) { return x.id === c.servicoId; });
            var op = s ? s.operadora : 'Outro';
            count[op] = (count[op] || 0) + 1;
        });
        var total = Object.values(count).reduce(function(a, b) { return a + b; }, 0);
        if (!Object.keys(count).length) { el.innerHTML = '<p class="small" style="color:var(--slate-400)">Nenhum contrato ativo</p>'; return; }
        el.innerHTML = Object.entries(count).map(function(e) {
            var op = e[0], qtd = e[1];
            var pct = total ? (qtd / total * 100).toFixed(0) : 0;
            return '<div class="bar-item"><span class="bar-label">' + op + '</span><div class="bar-track"><div class="bar-fill ' + op.toLowerCase() + '" style="width:' + pct + '%">' + qtd + ' (' + pct + '%)</div></div></div>';
        }).join('');
    }

    function renderGraficoServicos() {
        var contratos = getContratos();
        var servicos = getServicos();
        var el = document.getElementById('graficoServicos');
        var count = {};
        contratos.filter(function(c) { return c.estado === 'Ativo'; }).forEach(function(c) {
            var s = servicos.find(function(x) { return x.id === c.servicoId; });
            var t = s ? (s.tipo || 'Outro') : 'Outro';
            count[t] = (count[t] || 0) + 1;
        });
        var total = Object.values(count).reduce(function(a, b) { return a + b; }, 0);
        if (!Object.keys(count).length) { el.innerHTML = '<p class="small" style="color:var(--slate-400)">Nenhum contrato ativo</p>'; return; }
        el.innerHTML = Object.entries(count).map(function(e) {
            var t = e[0], qtd = e[1];
            var pct = total ? (qtd / total * 100).toFixed(0) : 0;
            return '<div class="bar-item"><span class="bar-label">' + t + '</span><div class="bar-track"><div class="bar-fill accent" style="width:' + pct + '%">' + qtd + ' (' + pct + '%)</div></div></div>';
        }).join('');
    }

    function renderUltimosClientes() {
        var clientes = getClientes();
        var contratos = getContratos();
        var servicos = getServicos();
        var el = document.getElementById('tabelaUltimos');
        var ultimos = clientes.slice().reverse().slice(0, 5);
        if (!ultimos.length) { el.innerHTML = '<tr><td colspan="5" class="text-center" style="color:var(--slate-400);padding:2rem">Nenhum cliente registado</td></tr>'; return; }
        el.innerHTML = ultimos.map(function(c) {
            var ct = contratos.filter(function(x) { return x.clienteId === c.id; });
            var sNome = ct.length ? (servicos.find(function(x) { return x.id === ct[0].servicoId; }) ?.nome || '\u2014') : '\u2014';
            var valor = ct.length ? (parseFloat(ct[0].valor) || 0).toFixed(2) + '&euro;' : '\u2014';
            var est = ct.length ? ct[0].estado : 'Sem contrato';
            return '<tr><td class="td-bold">' + esc(c.nome) + '</td><td><span class="tag-op tag-' + c.operadora.toLowerCase() + '">' + c.operadora + '</span></td><td>' + esc(sNome) + '</td><td>' + valor + '</td><td><span class="badge badge-' + est.toLowerCase() + '">' + est + '</span></td></tr>';
        }).join('');
    }

})();
