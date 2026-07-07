(function() {
    'use strict';

    function popularSelectContrato() {
        var clientes = getClientes();
        var servicos = getServicos();
        var selCli = document.getElementById('contrCli');
        var selServ = document.getElementById('contrServ');
        selCli.innerHTML = '<option value="">Selecionar cliente</option>' + clientes.map(function(c) { return '<option value="' + c.id + '">' + esc(c.nome) + ' (' + c.operadora + ')</option>'; }).join('');
        selServ.innerHTML = '<option value="">Selecionar servi\u00e7o</option>' + servicos.map(function(s) { return '<option value="' + s.id + '">' + esc(s.nome) + ' \u2014 ' + s.operadora + ' (' + parseFloat(s.preco).toFixed(2) + '&euro;)</option>'; }).join('');
    }

    window.renderContratos = function() {
        var clientes = getClientes();
        var servicos = getServicos();
        var contratos = getContratos();
        var aprovacoes = getAprovacoes();
        var f = (document.getElementById('filtroContr') ?.value || '').toLowerCase();
        var est = document.getElementById('filtroContrEst') ?.value || '';
        var el = document.getElementById('tabelaContratos');
        var lista = contratos.filter(function(c) {
            if (est && c.estado !== est) return false;
            if (f) { var cl = clientes.find(function(x) { return x.id === c.clienteId; }); if (!cl || !cl.nome.toLowerCase().includes(f)) return false; }
            return true;
        });
        if (!lista.length) { el.innerHTML = '<tr><td colspan="8" class="text-center" style="color:var(--slate-400);padding:2rem">Nenhum contrato encontrado</td></tr>'; return; }
        el.innerHTML = lista.map(function(c) {
            var cl = clientes.find(function(x) { return x.id === c.clienteId; });
            var s = servicos.find(function(x) { return x.id === c.servicoId; });
            var nm = cl ? esc(cl.nome) : '\u2014';
            var sn = s ? esc(s.nome) : '\u2014';
            var op = s ? s.operadora : '\u2014';
            var aprov = aprovacoes.find(function(a) { return a.contratoId === c.id; });
            var acoes = '<button class="btn btn-sm btn-secondary" onclick="editarContrato(' + c.id + ')">Editar</button> <button class="btn btn-sm btn-danger" onclick="eliminarContrato(' + c.id + ')">Eliminar</button>';
            if (c.estado === 'Pendente' && !aprov) {
                acoes += ' <button class="btn btn-sm btn-primary" onclick="enviarAprovacao(' + c.id + ')"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Enviar</button>';
            }
            if (aprov) {
                var stAprov = aprov.status === 'aprovado' ? 'badge-aprovado' : (aprov.status === 'rejeitado' ? 'badge-rejeitado' : 'badge-pendente');
                var stLabel = aprov.status === 'aprovado' ? 'Aprovado' : (aprov.status === 'rejeitado' ? 'Rejeitado' : 'A Aguardar');
                acoes += ' <span class="badge ' + stAprov + '">' + stLabel + '</span>';
            }
            return '<tr><td class="td-bold">' + nm + '</td><td>' + sn + '</td><td><span class="tag-op tag-' + op.toLowerCase() + '">' + op + '</span></td><td class="td-bold">' + (parseFloat(c.valor) || 0).toFixed(2) + '&euro;</td><td class="small">' + fmtData(c.dataInicio) + '</td><td class="small">' + fmtData(c.dataFim) + '</td><td><span class="badge badge-' + c.estado.toLowerCase() + '">' + c.estado + '</span></td><td style="white-space:nowrap">' + acoes + '</td></tr>';
        }).join('');
    };

    window.enviarAprovacao = async function(contratoId) {
        var contratos = getContratos();
        var clientes = getClientes();
        var servicos = getServicos();
        var c = contratos.find(function(x) { return x.id === contratoId; });
        if (!c) return;
        var cl = clientes.find(function(x) { return x.id === c.clienteId; });
        var s = servicos.find(function(x) { return x.id === c.servicoId; });
        if (!cl || !s) { toast('Cliente ou servi\u00e7o n\u00e3o encontrado', 'error'); return; }

        var token = 'aprov_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        var link = window.location.origin + '/gestao/aprovacao.html?token=' + token;

        var aprovacoes = getAprovacoes();
        aprovacoes.push({ token: token, contratoId: c.id, status: 'pendente', dataEnvio: today(), clienteNome: cl.nome, servicoNome: s.nome, operadora: s.operadora, valor: c.valor });
        saveAprovacoes(aprovacoes);

        try {
            await emailjs.send(
                'service_mail_gcc',
                'template_yodp801',
                {
                    clienteNome: cl.nome,
                    servicoNome: s.nome,
                    operadora: s.operadora,
                    valor: c.valor,
                    link: link,
                    to_email: cl.email
                }
            );
            toast('Email enviado para ' + cl.nome, 'success');
        } catch (error) {
            console.error('Erro email:', error);
            toast('Erro ao enviar email: ' + (error.text || error.message || 'desconhecido'), 'error');
            var preview = document.getElementById('emailPreview');
            document.getElementById('emailPreviewCliente').textContent = cl.nome;
            document.getElementById('emailPreviewEmail').textContent = cl.email || '\u2014';
            document.getElementById('emailPreviewLink').textContent = link;
            document.getElementById('emailPreviewLink').href = link;
            preview.classList.remove('hidden');
            preview.style.display = 'flex';
        }

        renderContratos();
    };

    window.fecharPreviewEmail = function() {
        document.getElementById('emailPreview').classList.add('hidden');
    };

    window.abrirFormContrato = function(id) {
        var contratos = getContratos();
        popularSelectContrato();
        document.getElementById('modalContratoTitulo').textContent = id ? 'Editar Contrato' : 'Novo Contrato';
        document.getElementById('contrId').value = id || '';
        if (id) {
            var c = contratos.find(function(x) { return x.id === id; });
            if (!c) return;
            document.getElementById('contrCli').value = c.clienteId || '';
            document.getElementById('contrServ').value = c.servicoId || '';
            document.getElementById('contrInicio').value = c.dataInicio || '';
            document.getElementById('contrFim').value = c.dataFim || '';
            document.getElementById('contrValor').value = c.valor || '';
            document.getElementById('contrEst').value = c.estado || 'Ativo';
        } else {
            document.getElementById('contrCli').value = '';
            document.getElementById('contrServ').value = '';
            document.getElementById('contrInicio').value = today();
            document.getElementById('contrFim').value = '';
            document.getElementById('contrValor').value = '';
            document.getElementById('contrEst').value = 'Pendente';
        }
        document.getElementById('modalContrato').classList.add('open');
    };

    window.editarContrato = function(id) { abrirFormContrato(id); };

    window.salvarContrato = function() {
        var id = document.getElementById('contrId').value;
        var d = {
            clienteId: parseInt(document.getElementById('contrCli').value) || 0,
            servicoId: parseInt(document.getElementById('contrServ').value) || 0,
            dataInicio: document.getElementById('contrInicio').value,
            dataFim: document.getElementById('contrFim').value,
            valor: parseFloat(document.getElementById('contrValor').value) || 0,
            estado: document.getElementById('contrEst').value,
        };
        if (!d.clienteId || !d.servicoId) { toast('Seleciona um cliente e um servi\u00e7o.', 'error'); return; }
        var contratos = getContratos();
        if (id) { var i = contratos.findIndex(function(c) { return c.id === parseInt(id); }); if (i >= 0) contratos[i] = { ...contratos[i], ...d }; } else {
            d.id = newId(contratos);
            contratos.push(d);
        }
        saveContratos(contratos);
        closeModal('modalContrato');
        renderContratos();
        renderDashboard();
        toast(id ? 'Contrato actualizado' : 'Contrato criado', 'success');
    };

    window.eliminarContrato = function(id) {
        if (!confirm('Eliminar este contrato?')) return;
        var contratos = getContratos();
        contratos = contratos.filter(function(c) { return c.id !== id; });
        saveContratos(contratos);
        var aprovacoes = getAprovacoes();
        aprovacoes = aprovacoes.filter(function(a) { return a.contratoId !== id; });
        saveAprovacoes(aprovacoes);
        renderContratos();
        renderDashboard();
        toast('Contrato eliminado', 'info');
    };

})();
