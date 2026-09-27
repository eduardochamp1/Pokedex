/**
 * Os testes rodam com o site em português.
 *
 * O idioma padrão sai do navegador, e o jsdom se apresenta como "en-US": sem
 * isto, qualquer teste em jsdom veria o site em inglês e as asserções sobre
 * texto em português falhariam por motivo errado. Quem quer testar o inglês
 * passa o idioma explicitamente (`tr("en", …)`, `loreFor("en")`).
 */
try {
  localStorage.setItem("pokedex:lang", "pt");
} catch {
  // ambiente node, sem localStorage: a detecção já cai em português
}
