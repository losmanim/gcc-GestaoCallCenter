(function() {
    'use strict';

    window.renderRelatorios = function() {
        var clientes = getClientes();
        var servicos = getServicos();
        var contratos = getContratos();
        var topEl = document.getElementById('topClientes');
        var recEl = document.getElementById('receitaOperadora');

        var gastos = {};
        contratos.filter(function(c) { return c.estado === 'Ativo'; }).forEach(function(c) {
            var cl = clientes.find(function(x) { return x.id === c.clienteId; });
            if (cl) {
                gastos[cl.id] = gastos[cl.id] || { nome: cl.nome, total: 0, contratos: 0 };
                gastos[cl.id].total += parseFloat(c.valor) || 0;
                gastos[cl.id].contratos++;
            }
        });
        var rank = Object.values(gastos).sort(function(a, b) { return b.total - a.total; }).slice(0, 5);
        topEl.innerHTML = rank.length ? rank.map(function(r, i) { return '<div class="ranking-item"><div class="ranking-pos">' + (i + 1) + '</div><div class="ranking-info"><div class="ranking-nome">' + esc(r.nome) + '</div><div class="ranking-sub">' + r.contratos + ' contrato(s)</div></div><div class="ranking-valor">' + r.total.toFixed(2) + '&euro;</div></div>'; }).join('') : '<p class="small" style="color:var(--slate-400)">Nenhum contrato ativo</p>';

        var recOp = {};
        contratos.filter(function(c) { return c.estado === 'Ativo'; }).forEach(function(c) {
            var s = servicos.find(function(x) { return x.id === c.servicoId; });
            var op = s ? s.operadora : 'Outro';
            recOp[op] = (recOp[op] || 0) + (parseFloat(c.valor) || 0);
        });
        var totalRec = Object.values(recOp).reduce(function(a, b) { return a + b; }, 0);
        recEl.innerHTML = Object.keys(recOp).length ? Object.entries(recOp).map(function(e) {
            var op = e[0], val = e[1];
            var pct = totalRec ? (val / totalRec * 100).toFixed(0) : 0;
            return '<div class="bar-item"><span class="bar-label">' + op + '</span><div class="bar-track"><div class="bar-fill ' + op.toLowerCase() + '" style="width:' + pct + '%">' + val.toFixed(2) + '&euro; (' + pct + '%)</div></div></div>';
        }).join('') : '<p class="small" style="color:var(--slate-400)">Nenhuma receita</p>';
    };

    window.exportarCSV = function(tipo) {
        var data, headers, filename;
        if (tipo === 'clientes') {
            data = getClientes();
            headers = ['ID', 'Nome', 'Email', 'Telefone', 'NIF', 'Operadora', 'Morada', 'CodPostal', 'Estado', 'Notas'];
            filename = 'clientes_gcc.csv';
        } else if (tipo === 'servicos') {
            data = getServicos();
            headers = ['ID', 'Nome', 'Operadora', 'Tipo', 'Velocidade', 'Preco', 'Canais', 'Moveis', 'Descricao'];
            filename = 'servicos_gcc.csv';
        } else {
            var clientes = getClientes();
            var servicos = getServicos();
            data = getContratos().map(function(c) {
                var cl = clientes.find(function(x) { return x.id === c.clienteId; });
                var s = servicos.find(function(x) { return x.id === c.servicoId; });
                return { id: c.id, cliente: cl ? cl.nome : '\u2014', servico: s ? s.nome : '\u2014', dataInicio: c.dataInicio, dataFim: c.dataFim, valor: c.valor, estado: c.estado };
            });
            headers = ['ID', 'Cliente', 'Servico', 'DataInicio', 'DataFim', 'Valor', 'Estado'];
            filename = 'contratos_gcc.csv';
        }
        var csv = [headers.join(';'), ...data.map(function(r) { return headers.map(function(h) { var v = r[h.toLowerCase()] !== undefined ? r[h.toLowerCase()] : (r[h] !== undefined ? r[h] : ''); return '"' + String(v).replace(/"/g, '""') + '"'; }).join(';'); })].join('\n');
        var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        var link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        toast('Ficheiro exportado: ' + filename, 'success');
    };

})();
