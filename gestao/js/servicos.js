(function() {
    'use strict';

    window.renderServicos = function() {
        var servicos = getServicos();
        var op = document.getElementById('filtroServOp') ?.value || '';
        var tp = document.getElementById('filtroServTp') ?.value || '';
        var el = document.getElementById('gradeServicos');
        var lista = servicos.filter(function(s) {
            if (op && s.operadora !== op) return false;
            if (tp && s.tipo !== tp) return false;
            return true;
        });
        if (!lista.length) { el.innerHTML = '<p style="color:var(--slate-400);text-align:center;padding:2rem;grid-column:1/-1">Nenhum servi\u00e7o encontrado</p>'; return; }
        el.innerHTML = lista.map(function(s) {
            return '<div class="servico-card"><div style="display:flex;justify-content:space-between;align-items:start"><div><span class="tag-op tag-' + s.operadora.toLowerCase() + '">' + s.operadora + '</span> <h4 style="display:inline;margin-left:0.25rem">' + esc(s.nome) + '</h4></div><div class="preco">' + parseFloat(s.preco).toFixed(2) + '&euro;</div></div><div class="detalhe"><i class="bi bi-tag-fill"></i> ' + (s.tipo || '\u2014') + '</div>' + (s.velocidade ? '<div class="detalhe"><i class="bi bi-speedometer2"></i> ' + esc(s.velocidade) + '</div>' : '') + (s.canais ? '<div class="detalhe"><i class="bi bi-tv"></i> ' + esc(s.canais) + ' canais</div>' : '') + (s.moveis ? '<div class="detalhe"><i class="bi bi-phone"></i> ' + esc(s.moveis) + '</div>' : '') + (s.descricao ? '<div class="detalhe" style="margin-top:0.25rem">' + esc(s.descricao) + '</div>' : '') + '<div class="acoes"><button class="btn btn-sm btn-secondary" onclick="editarServico(' + s.id + ')">Editar</button> <button class="btn btn-sm btn-danger" onclick="eliminarServico(' + s.id + ')">Eliminar</button></div></div>';
        }).join('');
    };

    window.abrirFormServico = function(id) {
        var servicos = getServicos();
        document.getElementById('modalServicoTitulo').textContent = id ? 'Editar Servi\u00e7o' : 'Novo Servi\u00e7o';
        document.getElementById('servId').value = id || '';
        if (id) {
            var s = servicos.find(function(x) { return x.id === id; });
            if (!s) return;
            document.getElementById('servNome').value = s.nome || '';
            document.getElementById('servOp').value = s.operadora || '';
            document.getElementById('servTipo').value = s.tipo || '';
            document.getElementById('servVel').value = s.velocidade || '';
            document.getElementById('servPreco').value = s.preco || '';
            document.getElementById('servCanais').value = s.canais || '';
            document.getElementById('servMoveis').value = s.moveis || '';
            document.getElementById('servDesc').value = s.descricao || '';
        } else {
            ['servNome', 'servVel', 'servPreco', 'servCanais', 'servMoveis', 'servDesc'].forEach(function(x) { document.getElementById(x).value = ''; });
            document.getElementById('servOp').value = '';
            document.getElementById('servTipo').value = '';
        }
        document.getElementById('modalServico').classList.add('open');
    };

    window.editarServico = function(id) { abrirFormServico(id); };

    window.salvarServico = function() {
        var id = document.getElementById('servId').value;
        var d = {
            nome: document.getElementById('servNome').value.trim(),
            operadora: document.getElementById('servOp').value,
            tipo: document.getElementById('servTipo').value,
            velocidade: document.getElementById('servVel').value.trim(),
            preco: parseFloat(document.getElementById('servPreco').value) || 0,
            canais: document.getElementById('servCanais').value.trim(),
            moveis: document.getElementById('servMoveis').value.trim(),
            descricao: document.getElementById('servDesc').value.trim(),
        };
        if (!d.nome || !d.operadora || !d.tipo) { toast('Nome, operadora e tipo s\u00e3o obrigat\u00f3rios.', 'error'); return; }
        var servicos = getServicos();
        if (id) { var i = servicos.findIndex(function(s) { return s.id === parseInt(id); }); if (i >= 0) servicos[i] = { ...servicos[i], ...d }; } else {
            d.id = newId(servicos);
            servicos.push(d);
        }
        saveServicos(servicos);
        closeModal('modalServico');
        renderServicos();
        renderDashboard();
        toast(id ? 'Servi\u00e7o actualizado' : 'Servi\u00e7o criado', 'success');
    };

    window.eliminarServico = function(id) {
        if (!confirm('Eliminar este servi\u00e7o?')) return;
        var servicos = getServicos();
        servicos = servicos.filter(function(s) { return s.id !== id; });
        saveServicos(servicos);
        renderServicos();
        renderDashboard();
        toast('Servi\u00e7o eliminado', 'info');
    };

})();
