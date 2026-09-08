# Suas ROMs

Coloque aqui os seus arquivos `.gb`, `.gbc` ou `.gba` e eles aparecem na
biblioteca em `/jogar`, sem precisar selecionar arquivo toda vez. **Subpastas
funcionam** — pode organizar como `roms/gba/`, `roms/gbc/` etc.

Esta pasta é **ignorada pelo git** e o plugin `vite-plugin-local-roms.ts` só a
serve em `npm run dev` e `npm run preview` — ela **não** é copiada para `dist/`.
Ou seja: os arquivos ficam na sua máquina e não vão para o repositório nem para
o site publicado.

Isso é deliberado. Publicar um site que serve ROMs de jogos comerciais é
distribuição de obra protegida da Nintendo/Game Freak, e é o tipo de coisa que
recebe notificação de remoção. Jogar o seu próprio dump localmente é outra
conversa — e é o que este diretório existe para permitir.

Se você fizer deploy, confira que `dist/` não tem nenhuma ROM dentro:

```bash
find dist -iname "*.gb" -o -iname "*.gbc" -o -iname "*.gba"
```
