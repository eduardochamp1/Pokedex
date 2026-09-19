import { lazy } from "react";

/**
 * A ficha continua carregada sob demanda, mas a carta da grade precisa poder
 * pedir o modulo ANTES de navegar: a transicao de virada fotografa a tela
 * nova no instante da navegacao, e sem o modulo em maos ela fotografaria o
 * esqueleto do Suspense no lugar do hero.
 */
const loadDetailPage = () => import("./DetailPage");

export const DetailPage = lazy(loadDetailPage);
export const preloadDetailPage = loadDetailPage;
