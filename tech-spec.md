# IoT Vision 3D — Especificacao Tecnica

## Dependencias

### Runtime

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| react | ^18.2.0 | Framework UI |
| react-dom | ^18.2.0 | Renderizacao DOM |
| react-router-dom | ^6.20.0 | Routing multi-pagina (/, /login, /dashboard) |
| three | ^0.160.0 | Motor 3D — cena de particulas hero + workspace 3D |
| @react-three/fiber | ^8.15.0 | React renderer para Three.js (canvas 3D declarativo) |
| @react-three/drei | ^9.92.0 | Helpers R3F: OrbitControls, Grid, TransformControls, Environment |
| three-noise | ^1.1.2 | Gerador Simplex noise para campo de particulas |
| gsap | ^3.12.0 | Motor de animacao — timelines, tweens, ScrollTrigger |
| lenis | ^1.1.0 | Smooth scroll com inercia |
| lucide-react | ^0.294.0 | Icones SVG consistentes (2200+ icones) |
| recharts | ^2.10.0 | Graficos de dados em tempo real (dashboard) |
| zustand | ^4.4.0 | Gerenciamento de estado global (simulacao, auth, workspace) |

### Dev

| Pacote | Versao | Proposito |
|--------|--------|-----------|
| vite | ^5.0.0 | Bundler e dev server |
| @vitejs/plugin-react | ^4.2.0 | Plugin React para Vite (SWC) |
| tailwindcss | ^3.4.0 | Utilitario CSS |
| postcss | ^8.4.0 | Processador CSS |
| autoprefixer | ^10.4.0 | Prefixos vendor CSS |
| typescript | ^5.3.0 | Tipagem estatica |
| @types/react | ^18.2.0 | Tipos React |
| @types/react-dom | ^18.2.0 | Tipos React DOM |
| @types/three | ^0.160.0 | Tipos Three.js |

### Fontes (CDN / npm)

- PP Neue Montreal — fonte principal (sans-serif)
- JetBrains Mono — fonte monospace para terminal/logs/dados

---

## Inventario de Componentes

### Layout (compartilhados entre paginas do dashboard)

| Componente | Fonte | Notas |
|------------|-------|-------|
| Sidebar | Custom | Navegacao fixa 240px, colapsa para 60px (icones). Overlay full-screen no mobile. Contem nav sections dinamicas (turmas) |
| TopBar | Custom | Barra sticky com breadcrumb, botoes de acao, indicadores de status. Muda conforme workspace ativo |
| PageTransition | Custom | Wrapper animado ao redor de `<Outlet>` — fade + slide entre rotas do dashboard |

### Paginas (rotas)

| Pagina | Rota | Notas |
|--------|------|-------|
| HomePage | / | Marketing single-page: hero com particulas 3D, galeria horizontal scroll, video showcase, footer |
| LoginPage | /login, /register | Split-screen: painel esquerdo com animacao CSS + form direito com abas login/registro |
| DashboardLayout | /dashboard | Layout com sidebar + topbar, outlet para views filhas |
| Workspace3DView | /dashboard/workspace/3d | Canvas 3D (R3F) + painel de propriedades + timeline de dados |
| CircuitEditorView | /dashboard/workspace/circuit | Canvas 2D custom (HTML5 Canvas API) + biblioteca de componentes + painel de propriedades |
| DataDashboardView | /dashboard/workspace/data | Grid de cards: status, graficos, logs, alertas, consumo |
| ClassesView | /dashboard/classes | Cards de turmas (aluno) / gerenciamento (professor) |
| ProjectsView | /dashboard/projects | Grid de projetos com busca, filtros, criacao |

### Secoes (page-level, nao reutilizaveis)

**HomePage:**
- Navigation — barra fixa com backdrop-blur, visivel apos scroll
- HeroSection — viewport completo, canvas Three.js + texto overlay com mix-blend-mode
- ShowcaseSection — scroll horizontal pin (3000px), 3 cards glass-morphism
- VideoSection — container expansivo com video autoplay + overlay scanline
- FooterSection — 4 colunas com links e icones sociais

**LoginPage:**
- LeftPanel — grid CSS animado + formas flutuantes
- LoginForm / RegisterForm — formularios com validacao, forca de senha, selecao de papel

**Dashboard:**
- ClassesView — cards de turma com abas (atividades/alunos/progresso) para professores
- ProjectsView — grid de projeto com busca, filtros por categoria, modal de criacao

### Componentes Reutilizaveis (design system)

| Componente | Uso | Notas |
|------------|-----|-------|
| Button | Global | 4 variantes: Primary, Secondary, Ghost, Danger. Suporta estado loading (spinner) |
| Panel | Global | Container padrao: Charcoal bg, Border, border-radius 8px. Hover interativo opcional |
| Card | Global | Extensao de Panel com padding e estrutura de conteudo |
| Input | Login, forms dashboard | Text, email, password. Estados: default, focus, error. Inclui toggle de visibilidade para password |
| Modal | Global | Overlay + container animado. Foco trapping, ESC para fechar. 3 tamanhos |
| Toast | Global | Stack top-right, 4 tipos (success/warning/error/info), auto-dismiss com barra de progresso |
| Badge | Dashboard, classes | Pill com cor semantica (Amber pendente, Azure em andamento, Emerald entregue, Red atrasado) |
| Select | Forms | Dropdown custom estilizado com estados focus/hover |
| Checkbox | Forms, termos | Quadrado 16px com animacao de check |
| Tabs | Login, classes | Abas horizontais com indicador animado |
| SparklineChart | Dashboard timeline | Mini grafico de linha para timeline de dados (reutiliza recharts) |
| LineChart | Dashboard | Grafico de linha com area fill para temperatura/umidade |
| DonutChart | Dashboard | Grafico de anel para consumo de energia |
| TerminalLog | Dashboard | Scroll de logs estilo terminal com auto-scroll e filtros |
| ComponentCard | Circuit library | Card de componente arrastavel com icone SVG e nome |
| ProjectCard | Projects view | Card 4:3 com thumbnail, nome, tipo, metadados |
| ClassCard | Classes view | Card com abas internas (atividades/alunos/progresso) |
| DataTimeline | Workspace 3D | Faixa colapsavel com sparklines de sensores em tempo real |
| PropertiesPanel | 3D + Circuit | Painel lateral direito com formulario dinamico baseado no tipo de componente selecionado |
| ToastContainer | Global | Container posicionado top-right que gerencia stack de toasts |

### Hooks

| Hook | Proposito |
|------|-----------|
| useScrollAnimation | Wrapper de IntersectionObserver para animacoes de entrada (fade + translateY) |
| useSimulation | Loop de simulacao: gera dados de sensores, atualiza estado de componentes, alimenta charts/logs |
| useAutoSave | Salva projeto no localStorage a cada 30s de inatividade |
| useToast | API imperativa para criar/descartar toasts do Zustand store |
| useAuth | Estado de autenticacao + login/logout/registro |
| useKeyboardShortcuts | Registro global de atalhos de teclado (Ctrl+S, Delete, etc.) |

---

## Plano de Animacoes

| Animacao | Biblioteca | Abordagem | Complexidade |
|----------|------------|-----------|--------------|
| Campo de particulas 3D (hero) | Three.js + three-noise | Canvas WebGL raw: 1000 meshes de esfera com sistema orbital baseado em Simplex noise. Mouse reativo para parallax de camera. **Nao usa R3F** — renderizacao imperativa direta no canvas para maximo controle | **Alta** |
| Hero text reveal | GSAP | SplitType para quebrar texto em palavras, stagger de translateY(100%) para 0 com opacity. Timeline atrelada a ScrollTrigger | Media |
| Hero pin + unpin | GSAP ScrollTrigger | ScrollTrigger pin com duracao de 150vh. Canvas continua animando durante pin | Media |
| Scroll suave | Lenis | Instancia global, wired no ticker do GSAP para sincronia com ScrollTrigger | Baixa |
| Galeria horizontal scroll | GSAP ScrollTrigger | ScrollTrigger pin (3000px) + scrub de xPercent: 0 para -100 no track interno. Barra de progresso sincronizada | Media |
| Cards glass-morphism entrada | GSAP | Cada card desliza de translateX(100vw) para 0 com opacity, scrubbed ao scroll horizontal | Baixa |
| Video container expansao | GSAP ScrollTrigger | ScrollTrigger scrub: width 60% para 100% ao entrar na secao | Baixa |
| Scroll indicator hero | GSAP | Loop infinito de translateY + opacity. Desaparece apos 200px de scroll | Baixa |
| Entrada de elementos (.entrance) | CSS + IntersectionObserver | Classe CSS com transition padrao. IO adiciona classe .visible quando intersecta. Stagger via transition-delay incremental | Baixa |
| Badge flutuante entrada | CSS + IntersectionObserver | Mesmo padrao de entrance com stagger de 80ms entre badges | Baixa |
| Transicao de pagina | GSAP | Fade + slide entre rotas. Outgoing: opacity 1->0, translateY 0->-20px. Incoming: opacity 0->1, translateY 20px->0 | Baixa |
| Tab switch login | CSS/JS | Slide: outgoing opacity+translateX(-20px), incoming opacity+translateX(20px). 200ms cada | Baixa |
| Animacao grid login (CSS) | CSS @keyframes | Repeating-linear-gradient com translateY infinito. Formas geometricas com drift + rotacao via CSS puro. **Nenhuma biblioteca** | Baixa |
| Form field entrance | CSS | Stagger de 50ms por campo, translateY(20px)+opacity para 0+1 | Baixa |
| Toast enter/exit | CSS | translateX(100%) para 0 (enter), translateX(0) para 100% (exit). Barra de progresso com CSS animation de width | Baixa |
| Modal open/close | CSS | Overlay opacity, modal scale(0.95)+opacity para scale(1)+opacity. 250ms | Baixa |
| Placing component 3D | R3F useFrame | Escala 0->1 com easing bounce via lerp no useFrame. Flash Cyan emissive | Media |
| Selecao bounding box | R3F useFrame | Wireframe box com pulso de opacity (0.3->0.6) via useFrame + Math.sin | Baixa |
| Camera preset transitions | GSAP | Interpolacao da posicao da camera ao longo de 800ms | Media |
| Wire draw animation | Canvas 2D | Path tracing: desenha segmento por segmento ao longo de 300ms via requestAnimationFrame | Media |
| Simulacao pulso de fios | Canvas 2F / R3F | Pontos de luz viazando ao longo do path do wire. No canvas 2D: requestAnimationFrame. No 3D: useFrame com posicao interpolada | Media |
| LED glow simulation | R3F | Material emissive intensity variavel baseado em sinal de entrada, via useFrame | Baixa |
| Motor rotation | R3F useFrame | Rotacao continua de mesh proporcional ao valor do sinal | Baixa |
| Sparkline atualizacao | Recharts | Atualizacao de dados a 10fps via setInterval. Recharts re-renderiza automaticamente | Baixa |
| Circuit ghost drag | HTML5 DnD | Opacidade 50% no card, preview fantasma segue cursor. Nenhuma biblioteca extra | Baixa |
| Sidebar collapse | CSS | Width transition 240px->60px, labels com opacity 0. Tooltip CSS puro no hover | Baixa |
| Save indicator | CSS | Troca de texto com transition de opacity (Salvando->Salvo) | Baixa |

---

## Estado e Logica — Decisoes Arquiteturais

### Por que Zustand em vez de Context

A simulacao gera dados a 60fps (buffer em ref) e sincroniza com UI a 10fps. Context causaria re-renderizacoes em cascata desnecessarias. Zustand oferece seletores granulares — componentes so re-renderizam quando sua fatia de estado especifica muda. Auth e sidebar tambem usam Zustand para simplicidade (um store, multiplas fatias).

### Por que Canvas 2D raw para o Circuit Editor

O circuit editor usa HTML5 Canvas API diretamente (nao SVG nem DOM). Motivos: (1) performance com >100 componentes + wires — canvas e uma unica camada de rasterizacao, (2) necessidade de pan/zoom fluido via transformacoes de canvas, (3) wire routing com A* requer pixel-level control, (4) animacao de pontos viajando em wires e mais eficiente em canvas. O componente e encapsulado em um React wrapper que sincroniza estado React -> canvas via refs.

### Por que Three.js imperativo no Hero (sem R3F)

O campo de particulas do hero e um canvas WebGL standalone fora do React tree. R3F adicionaria overhead de reconciliacao React para 1000 meshes individuais com animacao de frame. O canvas e inicializado via useEffect, gerenciado imperativamente, e destruido no cleanup. ScrollTrigger controla visibilidade/pin — o loop de animacao roda via requestAnimationFrame independente do React render cycle.

### Por que recharts para Dashboard (e nao Chart.js)

Recharts e puramente React — componentes declarativos que se integram naturalmente com o ciclo de vida React. Chart.js requer refs imperativos e manual update/destroy. Para sparklines e graficos simples do dashboard, recharts e suficiente e evita boilerplate de wrapper.

### Estrategia de Splitting

- **Route-level**: React.lazy() para /dashboard/* rotas (3D workspace, circuit editor, data dashboard)
- **Library-level**: recharts carregado sob demanda no DataDashboardView
- **Three.js no hero**: import dinamico do bundle three.js — so carrega quando a secao hero e visivel (via IntersectionObserver)
- **R3F + drei**: importados apenas nas rotas de workspace 3D

### Simulacao: Arquitetura de Dados

```
useFrame (60fps) → Data Buffer (ref, ring buffer 1000 amostras/sensor)
                          ↓
                   setInterval 100ms → Zustand Store (10fps)
                          ↓
                   Re-render → Charts, Labels, Logs
```

O buffer e um ref (useRef) para evitar re-renderizacoes a 60fps. O intervalo de 100ms le o buffer e atualiza o store Zustand, disparando re-renderizacoes dos componentes de UI a uma taxa gerenciavel.

### Undo/Redo: Command Pattern

Ambos os editores (3D e circuit) usam uma pilha de comandos:
- Cada acao (mover, adicionar, deletar, conectar) cria um objeto `Command` com `execute()` e `undo()`
- Pilha limitada a 50 comandos
- Historico persistido em localStorage por projeto
- Atalhos: Ctrl+Z (undo), Ctrl+Shift+Z (redo)
