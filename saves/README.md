# Seus saves

Esta pasta é o **backup em disco** dos seus saves. O emulador escreve aqui
automaticamente a cada vez que o jogo grava, e você pode restaurar de volta com
um clique em `/jogar`.

Por que ela existe: dentro do navegador os saves ficam em IndexedDB, que
sobrevive a recarregar a página e a fechar o navegador — mas **não é garantido**.
O navegador pode descartar sob pressão de disco, e "limpar dados do site" apaga.
Arquivo em disco não tem esse problema.

O que aparece aqui:

- `<jogo>.sav` — save de bateria (o "save" do jogo em si)
- `<jogo>.ss1` … `.ss9` — save states, se você importar algum

Como a pasta `roms/`, esta é ignorada pelo git e servida só em `npm run dev` e
`npm run preview` — não vai para `dist/`.

Para levar um save para outra máquina, basta copiar o `.sav`.
