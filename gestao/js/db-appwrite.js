/* ===== Appwrite CRUD ===== */
/* Substitui localStorage pelo Appwrite Database */

function formatDoc(doc) {
  return { id: doc.$id, ...doc };
}

async function listarColecao(nome) {
  try {
    var res = await database.listDocuments(APPWRITE_DATABASE, COLLECTIONS[nome]);
    return res.documents.map(formatDoc);
  } catch (e) {
    console.warn('Erro ao buscar ' + nome + ' do Appwrite:', e);
    return [];
  }
}

async function criarDocumento(nome, dados) {
  try {
    var res = await database.createDocument(
      APPWRITE_DATABASE,
      COLLECTIONS[nome],
      'unique()',
      dados
    );
    return formatDoc(res);
  } catch (e) {
    console.error('Erro ao criar ' + nome + ':', e);
    throw e;
  }
}

async function atualizarDocumento(nome, id, dados) {
  try {
    var res = await database.updateDocument(
      APPWRITE_DATABASE,
      COLLECTIONS[nome],
      id,
      dados
    );
    return formatDoc(res);
  } catch (e) {
    console.error('Erro ao atualizar ' + nome + ':', e);
    throw e;
  }
}

async function eliminarDocumento(nome, id) {
  try {
    await database.deleteDocument(
      APPWRITE_DATABASE,
      COLLECTIONS[nome],
      id
    );
  } catch (e) {
    console.error('Erro ao eliminar ' + nome + ':', e);
    throw e;
  }
}

/* ===== Helpers específicos ===== */

async function carregarTudo() {
  var [clientes, servicos, contratos, aprovacoes, leads] = await Promise.all([
    listarColecao('clientes'),
    listarColecao('servicos'),
    listarColecao('contratos'),
    listarColecao('aprovacoes'),
    listarColecao('leads'),
  ]);
  return { clientes, servicos, contratos, aprovacoes, leads };
}
