Projeto: animação de trem estilo terminal Linux (referência: comando `sl` /
Sudo apt install sl, https://itsfoss.com/ubuntu-terminal-train/), como SVG
animado pro README do perfil, entre a seção de contatos e a de tech stack.

Não existe fork base - não achei nenhum projeto pronto que gere isso pra
GitHub. Construir do zero, mas reaproveitando a técnica já validada no
space-invaders-contributions: SVG com animação 100% CSS via @keyframes, sem
JS, loop contínuo e determinístico (calcula tudo antes, não é interativo).
Não precisa de dados de contribuição do GitHub - é decorativo, roda
independente.

Comportamento:
- Trem entra por um lado da tela, atravessa, some do outro lado
- Depois de um intervalo de "silêncio" (tela vazia), o trem passa de novo -
  não é loop contínuo sem pausa, tem que ter respiro entre as passagens
- Fumacinha saindo da locomotiva (partículas simples via CSS, ex: pequenos
  círculos com fade + drift pra cima, atraso escalonado)
- Locomotiva na frente: pode ter pequenas variações visuais entre execuções,
  mas sem fugir muito do modelo base (não é livre, é variação sutil)
- Vagões atrás da locomotiva: quantidade E ordem aleatórias a cada geração
  (gerar um pool de 4-6 tipos de vagão diferentes, sortear quantos e em que
  ordem aparecem no trem daquela rodada)
- Cor: usar a mesma cor de destaque (accent color) configurada no projeto do
  gh-ascii, pra ficar visualmente consistente com o resto do README (mesma
  paleta usada nos títulos do card ASCII e no tema geral do perfil)

Entrega: gerar como SVG, regenerado periodicamente via GitHub Action (mesmo
padrão do snake/space invaders - cron diário, commit na branch output), já
que a composição de vagões deve mudar a cada regeneração.

Meu handle do GitHub: UltimateStrength
