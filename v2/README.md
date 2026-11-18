# Sobrescrita Descomplica

Uma extensão para navegadores (baseada em Manifest V3) que automatiza a detecção de respostas corretas na plataforma Descomplica. A extensão interage dinamicamente com os componentes Vue.js das páginas de exercícios e listas de revisão, destacando e selecionando automaticamente a alternativa correta, poupando o tempo do aluno e garantindo o aprendizado ativo. O usuário apenas confirma a submissão, mantendo a interatividade com a plataforma.

## 🚀 Como Funciona

A plataforma Descomplica utiliza Vue.js no Front-End. Em vez de simplesmente injetar estilos engessados, a extensão utiliza um _MutationObserver_ moderno para escutar as mudanças do DOM. Quando os componentes educacionais são instanciados, as nossas "Estratégias" (_Design Pattern Strategy_) interceptam o funcionamento original do VueJS em tempo de execução (_.JS Prototypes Monkey-Patching_).

A extensão realiza duas ações primárias quando detecta a interface:

1. **Destaca a alternativa correta:** Substitui internamente as classes no Virtual DOM do Vue para a nossa classe animada de estilo verde fluorescente pulsante (`question__alternative--correct-animated`).
2. **Auto-Select:** Executa um click automático (*fireEvent*) no exato momento que a alternativa é revelada usando um event queue (setTimeout de 100ms) forçando a plataforma a ativar o botão "Confirmar", transferindo o poder de envio direto para o estudante.

## 🏗️ Arquitetura Orientada a Objetos

O projeto foi refatorado utilizando os pilares de **Clean Code**, de modo a nunca quebrar o fluxo original de roteamento, focando na flexibilidade e resiliência das regras de negócio (_Single Responsibility Principle_). A estrutura é organizada da seguinte maneira:

- **`content.js`**: Age como Orchestrador, monitorando o DOM da tela e disparando a ação inicial sem conhecer as lógicas por trás.
- **`StrategyFactory.js`**: Aplica o Padrão _Factory_ (Fábrica). Ela absorve a extração da _Tag Virtual_ do Vue gerada (`vm.$vnode.componentOptions.tag`) e escolhe o melhor objeto Estrategista para o tipo de questão aberta (Ex: Lista ou Exercício Módulo).
- **`QuestionStrategy.js` e `RevisionQuestionStrategy.js`**: Camadas exclusivas de injeção. Elas alteram independentemente como o JavaScript da interface lidará com cores ou interações caso a caso. O acoplamento é mantido baixo usando implementações sob o _type()_ assinado por uma fonte enum imutável (`StrategyType.js`).

## ⚙️ Funcionalidades e Cenários Cobertos

No momento, temos quatro abordagens documentadas:

### 1. `DescoQuestions` (Exercícios de final de aula)
Acionado em lições básicas. Modifica o handler `getAlternativeClass` do modelo principal, intercepta qual alternativa possue o metadado `e.correct`, coloriza o _li_ HTML injetando um box-shadow por css, e em sequência realiza o click virtual para expandir as opções de verificação para o usuário. 

### 2. `RevisionQuestion` (Listas de Revisão)
Possui uma engenharia nativa diferente da página regular de exercícios que exige monitoramento de propriedades como a _answered_, _userReply_ e falhas passadas para injetar e exibir em verde. O componente `RevisionQuestionStrategy` sobrescreve precisamente a camada reativa desta listagem específica previnindo travamentos ou _Infinite Render Loops_.

### 3. `ObjectiveTrivia` (Trivias e Fixações Variadas)
Utilizado em cenários onde a validação das questões recai sobre funções nativas executadas em tempo real pelas validações de exercícios extras, usando `this.currentQuestionReply()` e `this.exerciseAlternativeId`. A `ObjectiveTriviaStrategy` engaveta toda a camada desse cenário isoladamente e também detém suporte para Auto-Select.

### 4. `ClozeQuestion` (Questões de Preenchimento / Lacunas)
Detecta cenários contendo as famosas tags `select` (_Lacunas_ de preenchimento de palavras). Como a arquitetura não usa alternativas clicáveis `li`, o rastreador usa a alternativa correta de `vm.question.alternatives` e chama o método nativo `changeSelected`. Esse método emite o ID da pergunta e o ID da alternativa para o formulário pai, atualizando `selectedOptions` e habilitando o botão de envio quando todas as lacunas estiverem preenchidas. O destaque visual é aplicado separadamente no elemento da questão.

---

## 💻 Como Instalar (Modo Desenvolvedor)

Siga estas instruções para adicionar a extensão manualmente ao seu navegador baseado em Chromium:

### No Google Chrome / Brave / Edge:

1. Abra o navegador e acesse a página de extensões através do link:
   - **Chrome:** `chrome://extensions/`
   - **Brave:** `brave://extensions/`
   - **Edge:** `edge://extensions/`
2. Ative a chave rotulada como **"Modo do desenvolvedor"** (Developer mode) localizada no canto superior direito da tela.
3. Isso fará aparecer uma nova barra de opções na parte superior. Clique no botão **"Carregar sem compactação"** (Load unpacked).
4. Uma janela do seu diretório aparecerá. Navegue até o local onde esta pasta da extensão foi salva (o diretório que contém o `manifest.json`) e selecione-o.
5. Pronto! A extensão estará ativa (você deverá ver o card da "Sobrescrita Descomplica" no painel). Basta atualizar *[F5]* qualquer página da Descomplica para ver os resultados fluindo e piscando!

> **Nota:** Se você modificar qualquer arquivo localmente como o `content.js` ou ajustar a velocidade do efeito no stylesheet, é necessário voltar à página de extensões e clicar no ícone de círculo de "Recarregar" (Reload) diretamente no cartãozinho desta extensão antes de aplicar um novo F5 no site.

--- 

## 🎨 Estilização

A marcação verde utiliza um **CSS CSS Animation Keyframe Trick** injetado em `styles.css` e embutido dinamicamente via Main Context usando as regras globais de manifestação v3 das extensões:

```css
  background: 
      linear-gradient(#ffffff, #ffffff) padding-box,
      linear-gradient(90deg, #11998e, #38ef7d, #11998e, #38ef7d) border-box !important;
```
