(function() {
    'use strict';

    window.renderClientes = function() {
        var clientes = getClientes();
        var f = (document.getElementById('filtroCli') ?.value || '').toLowerCase();
        var op = document.getElementById('filtroCliOp') ?.value || '';
        var est = document.getElementById('filtroCliEst') ?.value || '';
        var el = document.getElementById('tabelaClientes');
        var ct = document.getElementById('totalClientesCount');

        var lista = clientes.filter(function(c) {
            if (f && !c.nome.toLowerCase().includes(f) && !(c.email || '').toLowerCase().includes(f) && !(c.nif || '').includes(f)) return false;
            if (op && c.operadora !== op) return false;
            if (est && c.estado !== est) return false;
            return true;
        });

        if (!lista.length) {
            el.innerHTML = '<tr><td colspan="9" class="text-center" style="color:var(--slate-400);padding:2rem">Nenhum cliente encontrado</td></tr>';
            ct.textContent = '0 clientes';
            return;
        }
        el.innerHTML = lista.map(function(c) {
            var iban = c.iban ? esc(c.iban) : '\u2014';
            var cvp = c.cvp ? esc(c.cvp) : '\u2014';
            if (iban.length > 12) iban = '...' + iban.slice(-12);
            return '<tr><td class="td-bold">' + esc(c.nome) + '</td><td class="small">' + esc(c.email || '\u2014') + '</td><td class="small">' + esc(c.nif || '\u2014') + '</td><td class="small">' + esc(c.telefone || '\u2014') + '</td><td><span class="tag-op tag-' + c.operadora.toLowerCase() + '">' + c.operadora + '</span></td><td class="small" style="font-family:monospace;font-size:0.75rem">' + iban + '</td><td class="small" style="font-family:monospace;font-size:0.75rem">' + cvp + '</td><td><span class="badge badge-' + c.estado.toLowerCase() + '">' + c.estado + '</span></td><td><button class="btn btn-sm btn-secondary" onclick="editarCliente(' + c.id + ')">Editar</button> <button class="btn btn-sm btn-danger" onclick="eliminarCliente(' + c.id + ')">Eliminar</button></td></tr>';
        }).join('');
        ct.textContent = lista.length + ' cliente(s)';
    };

    window.abrirFormCliente = function(id) {
        var clientes = getClientes();
        document.getElementById('modalClienteTitulo').textContent = id ? 'Editar Cliente' : 'Novo Cliente';
        document.getElementById('cliId').value = id || '';
        if (id) {
            var c = clientes.find(function(x) { return x.id === id; });
            if (!c) return;
            document.getElementById('cliNome').value = c.nome || '';
            document.getElementById('cliEmail').value = c.email || '';
            document.getElementById('cliTel').value = c.telefone || '';
            document.getElementById('cliNif').value = c.nif || '';
            document.getElementById('cliOp').value = c.operadora || '';
            document.getElementById('cliIban').value = c.iban || '';
            document.getElementById('cliCvp').value = c.cvp || '';
            document.getElementById('cliMorada').value = c.morada || '';
            document.getElementById('cliCp').value = c.codPostal || '';
            document.getElementById('cliEst').value = c.estado || 'Ativo';
            document.getElementById('cliNotas').value = c.notas || '';
        } else {
            ['cliNome', 'cliEmail', 'cliTel', 'cliNif', 'cliIban', 'cliCvp', 'cliMorada', 'cliCp', 'cliNotas'].forEach(function(x) { document.getElementById(x).value = ''; });
            document.getElementById('cliOp').value = '';
            document.getElementById('cliEst').value = 'Ativo';
        }
        document.getElementById('modalCliente').classList.add('open');
    };

    window.editarCliente = function(id) { abrirFormCliente(id); };

    window.salvarCliente = function() {
        var id = document.getElementById('cliId').value;
        var d = {
            nome: document.getElementById('cliNome').value.trim(),
            email: document.getElementById('cliEmail').value.trim(),
            telefone: document.getElementById('cliTel').value.trim(),
            nif: document.getElementById('cliNif').value.trim(),
            iban: document.getElementById('cliIban').value.trim(),
            cvp: document.getElementById('cliCvp').value.trim(),
            operadora: document.getElementById('cliOp').value,
            morada: document.getElementById('cliMorada').value.trim(),
            codPostal: document.getElementById('cliCp').value.trim(),
            estado: document.getElementById('cliEst').value,
            notas: document.getElementById('cliNotas').value.trim(),
        };
        if (!d.nome || !d.operadora) { toast('Nome e operadora s\u00e3o obrigat\u00f3rios.', 'error'); return; }
        var clientes = getClientes();
        if (id) { var i = clientes.findIndex(function(c) { return c.id === parseInt(id); }); if (i >= 0) clientes[i] = { ...clientes[i], ...d }; } else {
            d.id = newId(clientes);
            clientes.push(d);
        }
        saveClientes(clientes);
        closeModal('modalCliente');
        renderClientes();
        renderDashboard();
        toast(id ? 'Cliente actualizado' : 'Cliente criado', 'success');
    };

    window.eliminarCliente = function(id) {
        if (!confirm('Eliminar este cliente?')) return;
        var clientes = getClientes();
        clientes = clientes.filter(function(c) { return c.id !== id; });
        saveClientes(clientes);
        renderClientes();
        renderDashboard();
        toast('Cliente eliminado', 'info');
    };

})();
