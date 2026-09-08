interface Props {
  page: number;
  totalPages: number;
  onLeftClick: () => void;
  onRightClick: () => void;
}

const Pagination = ({ page, totalPages, onLeftClick, onRightClick }: Props) => {
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <div className="pagination-container">
      <button
        type="button"
        onClick={onLeftClick}
        disabled={isFirst}
        aria-label="Página anterior"
      >
        <div>🢀</div>
      </button>
      <div>
        {page} de {totalPages}
      </div>
      <button
        type="button"
        onClick={onRightClick}
        disabled={isLast}
        aria-label="Próxima página"
      >
        <div>🢂</div>
      </button>
    </div>
  );
};

export default Pagination;
