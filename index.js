const fs = require('fs');
const path = require('path');

function criarFiltro(busca) {
  const termo = busca.trim();

  
  if (termo === '') return () => true;

  
  if (termo.startsWith('.')) {
    const ext = termo.toLowerCase();
    return (nome) => path.extname(nome).toLowerCase() === ext;
  }

 
  const regex = new RegExp(termo, 'i');
  return (nome) => regex.test(nome);
}

function lerPasta(caminho, nivel, percorrerSubpastas, filtro) {
  const recuo = '  '.repeat(nivel);
  let entradas;


  try {
    entradas = fs.readdirSync(caminho, { withFileTypes: true });
  } catch (erro) {
    console.log(`${recuo}[Erro ao ler "${path.basename(caminho)}": ${erro.message}]`);
    return;
  }

  for (const entrada of entradas) {
    if (entrada.isDirectory()) {
  
      console.log(`${recuo}📁 ${entrada.name}/`);
      if (percorrerSubpastas) {
        lerPasta(path.join(caminho, entrada.name), nivel + 1, percorrerSubpastas, filtro);
      }
    } else if (filtro(entrada.name)) {
      console.log(`${recuo}📄 ${entrada.name}`);
    }
  }
}

function listar(percorrerSubpastas, busca = '') {
  let filtro;

  try {
    filtro = criarFiltro(busca);
  } catch (erro) {
    console.log(`Busca inválida: ${erro.message}`);
    return;
  }

  console.log(`📁 ${path.basename(__dirname)}/`);
  lerPasta(__dirname, 1, percorrerSubpastas, filtro);
}

const percorrerSubpastas = process.argv[2] === 'true';
const busca = process.argv[3] ?? '';

listar(percorrerSubpastas, busca);

