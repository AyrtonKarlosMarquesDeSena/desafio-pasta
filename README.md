# Leitura de pastas e subpastas

Aplicação de terminal em **Node.js** que lista arquivos e pastas em forma de árvore, a partir da pasta onde o script está salvo. O usuário escolhe se as subpastas serão percorridas e se os arquivos serão filtrados por nome ou por extensão.

Usa apenas os módulos nativos `fs` e `path`: **sem instalação de pacotes e sem servidor Express**.

## Sumário

- [Funcionalidades](#funcionalidades)
- [Requisitos](#requisitos)
- [Como executar](#como-executar)
- [Parâmetros](#parâmetros)
- [Regras do filtro de busca](#regras-do-filtro-de-busca)
- [Exemplos de uso](#exemplos-de-uso)
- [Tratamento de erros](#tratamento-de-erros)
- [Como o código funciona](#como-o-código-funciona)
- [Decisões técnicas](#decisões-técnicas)
- [Como testar](#como-testar)
- [Estrutura do projeto](#estrutura-do-projeto)

## Funcionalidades

- Exibe a hierarquia de pastas e arquivos com recuo proporcional ao nível.
- Percorre subpastas por **recursão implementada manualmente** (opcional).
- Filtra arquivos por **extensão exata** ou por **nome** (com expressão regular).
- Ignora diferenças entre maiúsculas e minúsculas em qualquer filtro.
- Mantém os nomes das pastas visíveis, mesmo quando nenhum arquivo delas combina com o filtro.
- Trata erros de leitura de pasta e expressões regulares inválidas sem interromper o programa.

## Requisitos

- [Node.js](https://nodejs.org/) instalado (versão 14 ou superior).

Para conferir:

```bash
node -v
```

## Como executar

1. Clone o repositório:

```bash
git clone https://github.com/SEU-USUARIO/desafio-pasta.git
cd desafio-pasta
```

2. Execute o programa:

```bash
node index.js <percorrerSubpastas> [busca]
```

## Parâmetros

| Posição | Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|---|
| 1 | `percorrerSubpastas` | `true` ou `false` | Não | `true` lê o conteúdo das subpastas por recursão. Qualquer outro valor (ou nenhum) equivale a `false`. |
| 2 | `busca` | texto | Não | Define o filtro aplicado aos arquivos. Se omitido, mostra todos. |

> Os argumentos são lidos de `process.argv`. No terminal, tudo chega como texto, por isso `true` é comparado com a string `'true'`.

## Regras do filtro de busca

| Busca | Comportamento |
|---|---|
| Vazia | Aceita todos os arquivos. |
| Começa com `.` (ex: `.txt`) | Compara a **extensão exata**, obtida com `path.extname`. |
| Qualquer outro texto | Aplica **expressão regular** no nome do arquivo, criada com `new RegExp(busca, 'i')`. |

Em todos os casos, maiúsculas e minúsculas são ignoradas (`.txt` encontra `.TXT`).

### Símbolos úteis nas buscas por nome

| Busca | Significado |
|---|---|
| `texto` | Nome que **contém** "texto" em qualquer posição. |
| `^texto` | Nome que **começa** com "texto". |
| `texto$` | Nome que **termina** com "texto". |

> Use aspas em buscas com símbolos especiais (`"^a"`, `"js$"`) para o terminal não interpretá-los.

## Exemplos de uso

Considerando esta estrutura:

```
desafio-pasta/
├── a.txt
├── b.js
├── index.js
└── sup/
    └── c.TXT
```

### Sem subpastas

```bash
node index.js false
```

```
📁 desafio-pasta/
  📄 a.txt
  📄 b.js
  📄 index.js
  📁 sup/
```

### Com subpastas

```bash
node index.js true
```

```
📁 desafio-pasta/
  📄 a.txt
  📄 b.js
  📄 index.js
  📁 sup/
    📄 c.TXT
```

### Filtro por extensão

```bash
node index.js true .txt
```

```
📁 desafio-pasta/
  📄 a.txt
  📁 sup/
    📄 c.TXT
```

### Filtro por nome (começa com "a")

```bash
node index.js true "^a"
```

```
📁 desafio-pasta/
  📄 a.txt
  📁 sup/
```

### Busca sem resultados

```bash
node index.js true zzz
```

```
📁 desafio-pasta/
  📁 sup/
```

## Tratamento de erros

| Situação | Comportamento |
|---|---|
| Pasta inexistente ou sem permissão de leitura | Exibe uma mensagem com o nome da pasta e o motivo, e continua lendo as demais. |
| Expressão regular inválida (ex: `"[abc"`) | Exibe `Busca inválida: ...` e encerra sem quebrar. |
| Pasta vazia ou busca sem resultados | Não gera erro. |

Exemplo de regex inválida:

```bash
node index.js true "[abc"
```

```
Busca inválida: Invalid regular expression: /[abc/i: Unterminated character class
```

## Como o código funciona

O arquivo `index.js` tem três funções:

### `criarFiltro(busca)`

Recebe o texto da busca e **devolve uma função** que responde `true` ou `false` para um nome de arquivo.

- Busca vazia: devolve uma função que sempre responde `true`.
- Busca iniciada por `.`: compara `path.extname(nome).toLowerCase()` com a extensão digitada em minúsculas.
- Demais casos: cria `new RegExp(busca, 'i')` e usa `regex.test(nome)`.

### `lerPasta(caminho, nivel, percorrerSubpastas, filtro)`

Lê uma pasta e imprime seu conteúdo.

1. Calcula o recuo com `'  '.repeat(nivel)`.
2. Lê as entradas com `fs.readdirSync(caminho, { withFileTypes: true })`, dentro de um `try/catch`.
3. Para cada entrada:
   - **Pasta:** imprime o nome e, se `percorrerSubpastas` for `true`, chama a si mesma com `nivel + 1` (recursão).
   - **Arquivo:** imprime apenas se passar no filtro.

### `listar(percorrerSubpastas, busca)`

Função principal.

1. Cria o filtro dentro de um `try/catch` (a regex inválida é capturada aqui).
2. Imprime o nome da pasta raiz.
3. Inicia a leitura em `__dirname`, no nível 1.

## Decisões técnicas

- **`__dirname` como ponto de partida:** é a pasta do script e não muda conforme o terminal de onde o programa é executado (diferente de `process.cwd()`).
- **Recursão manual:** a opção `{ recursive: true }` do `readdirSync` não é usada, conforme a restrição do desafio.
- **Caminho como parâmetro:** cada chamada de `lerPasta` recebe seu próprio `caminho`, então nenhuma execução herda o caminho da anterior e não é necessário restaurar estado com `finally`.
- **`try/catch` por pasta:** a falha na leitura de uma subpasta não interrompe a leitura das demais.
- **Filtro como função:** o filtro é criado uma única vez e reaproveitado em todos os arquivos.
- **Sem flag `g` na regex:** com `g`, o método `test` guarda estado entre chamadas e pode gerar resultados inconsistentes.
- **Extensão sem regex:** a comparação por extensão usa `path.extname` e `===`, o que evita problemas com o `.` (caractere especial em regex).

## Como testar

Prepare uma pasta com dois arquivos de extensões diferentes e uma subpasta com mais um arquivo, e confira:

| Teste | Comando | Resultado esperado |
|---|---|---|
| Sem recursão | `node index.js false` | Conteúdo da subpasta não aparece. |
| Com recursão | `node index.js true` | Conteúdo da subpasta aparece no nível correto. |
| Busca vazia | `node index.js true` | Todos os arquivos aparecem. |
| Extensão | `node index.js true .txt` | Só `.txt`, incluindo `.TXT`. |
| Nome (qualquer posição) | `node index.js true b` | Arquivos com "b" no nome. |
| Nome (início) | `node index.js true "^a"` | Só nomes que começam com "a". |
| Sem resultados | `node index.js true zzz` | Só as pastas, sem erro. |
| Regex inválida | `node index.js true "[abc"` | Mensagem de busca inválida. |
| Chamadas consecutivas | Rodar duas vezes seguidas | Sempre começa pela mesma pasta. |

> A pasta `.git`, quando existe, também é percorrida com `true`. Isso é esperado, pois o desafio não pede para ignorar nenhuma pasta.

## Estrutura do projeto

```
desafio-pasta/
├── index.js     # código da aplicação
└── README.md    # documentação
```
