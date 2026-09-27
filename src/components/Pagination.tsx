import { useT } from "../i18n/lang";

interface Props {
  page: number;
  totalPages: number;
  onLeftClick: () => void;
  onRightClick: () => void;
}

const Pagination = ({ page, totalPages, onLeftClick, onRightClick }: Props) => {
  const isFirst = page <= 1;
  const isLast = page >= totalPages;
  const t = useT();

  return (
    <div className="pagination-container">
      <button
        type="button"
        onClick={onLeftClick}
        disabled={isFirst}
        aria-label={t("Página anterior", "Previous page")}
      >
        <div>🢀</div>
      </button>
      <div>
        {page} {t("de", "of")} {totalPages}
      </div>
      <button
        type="button"
        onClick={onRightClick}
        disabled={isLast}
        aria-label={t("Próxima página", "Next page")}
      >
        <div>🢂</div>
      </button>
    </div>
  );
};

export default Pagination;
