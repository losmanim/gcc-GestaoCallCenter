const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT = '6a4a96ae00150f4aa36a';
const APPWRITE_DATABASE = '6a4a97150006afe07f8a';

const sdk = new Appwrite.Client();
sdk
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT);

const database = new Appwrite.Databases(sdk);

const COLLECTIONS = {
  clientes: 'clientes',
  servicos: 'servicos',
  contratos: 'contratos',
  aprovacoes: 'aprovacoes',
  leads: 'leads',
};
