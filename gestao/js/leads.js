(function() {
    'use strict';

    window.renderLeads = function() {
        var f = (document.getElementById('filtroLeads') ?.value || '').toLowerCase();
        var op = document.getElementById('filtroLeadsOp') ?.value || '';
        var filtroLido = document.getElementById('filtroLeadsLido') ?.value || '';
        var leads = getLeads();
        var el = document.getElementById('tabelaLeads');
        var ct = document.getElementById('totalLeadsCount');

        var lista = leads.filter(function(l) {
            if (f && !l.nome.toLowerCase().includes(f) && !l.email.toLowerCase().includes(f)) return false;
            if (op && l.operadora !== op) return false;
            if (filtroLido === 'nao' && l.lido) return false;
            if (filtroLido === 'sim' && !l.lido) return false;
            return true;
        });

        if (!lista.length) {
            el.innerHTML = '<tr><td colspan="8" class="text-center" style="color:var(--slate-400);padding:2rem">Nenhum lead encontrado</td></tr>';
            ct.textContent = '0 leads';
            return;
        }

        el.innerHTML = lista.map(function(l) {
            var rowClass = !l.lido ? ' class="lead-nao-lido"' : '';
            var dataStr = l.data ? new Date(l.data.includes('T') ? l.data : l.data + 'T12:00:00').toLocaleString('pt-PT') : '\u2014';
            var opTag = l.operadora && l.operadora !== 'N\u00e3o especificada' && l.operadora !== '\u2014' ?
                '<span class="tag-op tag-' + l.operadora.toLowerCase() + '">' + esc(l.operadora) + '</span>' :
                '<span style="color:var(--slate-400)">\u2014</span>';
            var lidoHtml = l.lido ?
                '<span style="color:var(--slate-400);font-size:0.75rem">Lido</span>' :
                '<button class="btn btn-sm btn-primary lead-btn-lido" onclick="marcarLeadLido(' + l.id + ')">Marcar lido</button>';
            return '<tr' + rowClass + '><td class="small">' + dataStr + '</td><td class="td-bold">' + esc(l.nome) + '</td><td class="small">' + esc(l.email) + '</td><td class="small">' + esc(l.telefone) + '</td><td>' + opTag + '</td><td class="small" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(l.mensagem || '\u2014') + '</td><td>' + lidoHtml + '</td><td><button class="btn btn-sm btn-secondary" onclick="adicionarLeadCliente(' + l.id + ')" title="Adicionar como cliente"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:2px"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> Cliente</button></td></tr>';
        }).join('');
        ct.textContent = lista.length + ' lead(s)';

        updateLeadsBadge();
    };

    window.marcarLeadLido = function(id) {
        var leads = getLeads();
        var idx = leads.findIndex(function(l) { return l.id === id; });
        if (idx === -1) return;
        leads[idx].lido = true;
        saveLeads(leads);
        renderLeads();
        renderDashboard();
    };

    window.adicionarLeadCliente = function(id) {
        var leads = getLeads();
        var lead = leads.find(function(l) { return l.id === id; });
        if (!lead) return;
        var clientes = getClientes();
        var dados = {
            id: newId(clientes),
            nome: lead.nome,
            email: lead.email || '',
            telefone: lead.telefone || '',
            nif: '',
            operadora: (lead.operadora && lead.operadora !== 'N\u00e3o especificada') ? lead.operadora : '',
            morada: '',
            codPostal: '',
            estado: 'Ativo',
            notas: 'Lead do site. Msg: ' + (lead.mensagem || '\u2014'),
        };
        if (!dados.operadora) dados.operadora = 'NOS';
        clientes.push(dados);
        saveClientes(clientes);
        marcarLeadLido(id);
        toast('Lead adicionado como cliente: ' + dados.nome, 'success');
        renderClientes();
    };

    window.exportarLeadsCSV = function() {
        var leads = getLeads();
        var headers = ['ID', 'Data', 'Nome', 'Email', 'Telefone', 'Operadora', 'Mensagem', 'Lido'];
        var csv = [headers.join(';')];
        leads.forEach(function(l) {
            csv.push(headers.map(function(h) {
                var key = h.toLowerCase();
                var val = l[key] !== undefined ? l[key] : '';
                return '"' + String(val).replace(/"/g, '""') + '"';
            }).join(';'));
        });
        var blob = new Blob(['\uFEFF' + csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'leads_gcc.csv';
        link.click();
        URL.revokeObjectURL(link.href);
        toast('Leads exportados', 'success');
    };

})();
