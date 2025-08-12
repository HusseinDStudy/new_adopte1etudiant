import React from 'react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems
}) => {
  const { t } = useTranslation();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    if (totalPages <= 1) return [1];

    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    // Handle case where totalPages is small
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
      return range;
    }

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages < 1 || totalItems === 0) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex transform items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:scale-105 hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('common.previous')}
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex transform items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:scale-105 hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('common.next')}
        </button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            {t('common.showingResults', { start: startItem, end: endItem, total: totalItems })}
          </p>
        </div>
        
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            {/* First button */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="relative inline-flex transform items-center rounded-l-md bg-white px-3 py-2 text-sm font-medium text-gray-500 ring-1 ring-inset ring-gray-300 transition-all duration-300 hover:scale-105 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              title={t('common.firstPage')}
            >
              {t('common.first')}
            </button>

            {/* Previous button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex transform items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 transition-all duration-300 hover:scale-105 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              title={t('common.previousPage')}
            >
                              <span className="sr-only">{t('common.previous')}</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Page numbers */}
            {getVisiblePages().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`relative inline-flex transform items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 transition-all duration-300 hover:scale-105 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 active:scale-95 ${
                      currentPage === page
                        ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                        : 'text-gray-900'
                    }`}
                    title={t('common.page', { page })}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex transform items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 transition-all duration-300 hover:scale-105 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              title={t('common.nextPage')}
            >
                              <span className="sr-only">{t('common.next')}</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Last button */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="relative inline-flex transform items-center rounded-r-md bg-white px-3 py-2 text-sm font-medium text-gray-500 ring-1 ring-inset ring-gray-300 transition-all duration-300 hover:scale-105 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              title={t('common.lastPage')}
            >
              {t('common.last')}
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
