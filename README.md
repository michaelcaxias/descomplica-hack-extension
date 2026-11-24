# 🚀 Descomplica Override

Esta extensão unificada foi construída para a plataforma Aulas Descomplica, oferecendo diferentes modos de interceptação que auxiliam nos estudos através de _Auto-Select_ e detecção avançada de gabaritos diretos no front-end. O projeto agora funciona como uma **Suíte**, possuindo um menu interativo (Popup) e duas engines (códigos nucleares diferentes) que podem ser alternados em tempo de execução sem pesar no navegador.

---

<img width="419" height="572" alt="image" src="https://github.com/user-attachments/assets/1d1fef99-dc6b-486a-877a-8d88f536f8e7" />


## 💻 Como Instalar (Modo Desenvolvedor)

Siga estas instruções abaixo para instalar uma extensão local/não-oficial (_unpacked_) de forma nativa e segura baseada em seus navegadores Chromium:

### No Google Chrome / Brave / Edge:

1. Abra o navegador e acesse a página interna de extensões colando um dos links na barra de Endereçamento:
   - **Chrome:** `chrome://extensions/`
   - **Brave:** `brave://extensions/`
   - **Edge:** `edge://extensions/`
2. No canto **Superior Direito** da tela, localize e **Ligue a Chave** chamada **"Modo do desenvolvedor"** (_Developer mode_).
3. Isso fará aparecer uma nova barra de opções no topo esquerdo. Recorra ao botão e clique em **"Carregar sem compactação"** (_Load unpacked_).
4. Uma janela do seu Explorador de Arquivos local se abrirá. Navegue até o diretório exato que abraça tudo (diretório `complica-extension`) e confirme a seleção.
5. A Extensão vai nascer na sua lista de itens ativos. Fixe o ícone do Puzzle 🧩 no navegador para facilitar seu acesso a ela!

## 🖱️ Utilizando o Menu Interativo (Popup)

Ao abrir uma Lista de exercícios ou página do Descomplica, você pode clicar no ícone da nossa Extensão no seu menu superior direito!
Dentre as opções, ao ser selecionada o próprio `Service Worker` guardará a escolha nas bases de dados locais da instalação sem intervenção:
- **V2 - VueJS Observer:** Engatilha o modo avançado de Design Patterns com clicks e iluminação moderna responsiva de UX (vem por Padrão Ativado).
- **Desligar Extensão:** Precisa "estudar na raça" sem precisar desligar a extensão indo até opções de browser? Selecionar esse menu faz o JavaScript da plataforma simplesmente não ser interrompido e você joga limpo de acordo com as regras triviais como se fosse uma conta convencional (Recomendamos ao checar aprendizado bruto após leitura teórica de PDFs dos tutoriais)!

### ⚡ Otimizar página (opcional)
Um checkbox à parte, independente do motor escolhido (e do modo "Desligar"), que deixa o site mais leve. Vem **desligado** por padrão; recarregue a página (F5) depois de mudar.
- Bloqueia scripts de terceiros que não são usados (HubSpot, smartbanner, VLibras, Mixpanel).
- Carrega o player Kaltura (~750 KB, antes bloqueante no `<head>`) só nas aulas.
- Dá cache longo aos JS/CSS com hash no nome.
- Faz **Voltar/Avançar** do navegador navegarem entre as etapas da aula (antes saía da aula direto) e adiciona os atalhos `[` e `]` (etapa anterior/próxima).

Nas medições (Brave 153, carga fria) o DOMContentLoaded caiu ~40% e a página de disciplinas baixou ~16% menos bytes. O chunk principal do site (~5 MB) não dá para remover pela extensão.

> **🔄 Ao trocar de modo:** recarregue a tela (F5) do Descomplica para a mudança valer.

## ⚙️ O Motor (Architecture)

A extensão usa o motor abaixo, escolhido/desligado pelo Popup Menu:

### 🌟 V2 - VueJS Observer (Recomendado)
A nova e brilhante versão _monkey-patching_. Ela opera diretamente no **Virtual DOM do VueJS** interceptando as funções de UI do Front-End da plataforma, sem gerar volume pesado no terminal nativo de rede (Tab _Network_), deixando as requisições HTTPS e GraphQL seguirem normalmente e hackeando apenas a renderização dos componentes na tela do estudante.

**Vantagens do Modo Atual:**
- **Invisível e Perfeito:** Injeta uma estilização CSS (Degradê Animado) suave.
- **Auto-Resposta Dinâmica:** Como um opcional apenas desse modo, após aplicar o destaque verde na interface de resposta certa nos questionários nativos (`DescoQuestions`), você pode optar por permitir a "Auto-Confirmação", fazendo a Extensão simular cliques contínuos pra você ("Responder" e "Próxima") engatando a marcha automática sobre as lições para otimização de tempo.
- **Design Pattern:** Utiliza arquitetura Limpa e Isolada (_Strategy Factory_) cobrindo nativamente e sem quebras visuais 4 tipos de cenários Descomplica: `DescoQuestions` (Exercícios da aula), `RevisionQuestion` (Listas de Revisão), `ObjectiveTrivia` (Fixações Extras) e `ClozeQuestion` (Questões Lacunares de múltiplas opões de seleção Dropdown).

---
