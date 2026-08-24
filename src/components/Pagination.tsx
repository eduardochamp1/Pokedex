interface Props {
  page: number;
  totalPages: number;
  onLeftClick: () => void;
  onRightClick: () => void;
}

const Pagination = ({ page, totalPages, onLeftClick, onRightClick }: Props) => {
  return (
    <div className="pagination-container">
      <button onClick={onLeftClick} aria-label="Página anterior">
        <div>🢀</div>
      </button>
      <div>
        {page} de {totalPages}
      </div>
      <button onClick={onRightClick} aria-label="Próxima página">
        <div>🢂</div>
      </button>
    </div>
  );
};

export default Pagination;
