import React, { useMemo, useState } from 'react'
import { CiSearch } from "react-icons/ci";

const pageSizes = [5, 10, 20, 50]

const SmartDataTable = ({ columns = [], data = [], pagination = true, customStyles = {}, className = '' }) => {
  const [filterText, setFilterText] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const normalizedColumns = useMemo(() => {
    return columns.map((col, index) => ({
      id: index + 1,
      sortable: !!col.sortable,
      width: col.width,
      name: col.name,
      selector: col.selector,
      cell: col.cell,
      center: col.center,
    }))
  }, [columns])

  const onHeaderClick = (col, index) => {
    if (!col.sortable) return
    const key = col.selector ? `__selector_${index}` : `__cell_${index}`
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const getValueForSort = (row, col) => {
    try {
      if (col.selector) return col.selector(row)
      if (col.cell) {
        // Best-effort: fall back to string of cell if not primitive
        const v = col.cell(row)
        if (typeof v === 'string' || typeof v === 'number') return v
        return ''
      }
      return ''
    } catch { return '' }
  }

  const filtered = useMemo(() => {
    if (!filterText) return data || []
    const text = filterText.toLowerCase()
    return (data || []).filter((row) => {
      try {
        // Try column values first
        const columnHit = normalizedColumns.some((col) => {
          const val = getValueForSort(row, col)
          return String(val || '').toLowerCase().includes(text)
        })
        if (columnHit) return true
        // Fallback to searching the raw row object
        const raw = JSON.stringify(row || {})
        return raw.toLowerCase().includes(text)
      } catch { return false }
    })
  }, [data, filterText, normalizedColumns])

  const sorted = useMemo(() => {
    if (!sortConfig.key) return filtered
    const index = parseInt(sortConfig.key.split('_').pop(), 10)
    const col = normalizedColumns[index - 1]
    if (!col) return filtered
    const arr = [...filtered]
    arr.sort((a, b) => {
      const va = getValueForSort(a, col)
      const vb = getValueForSort(b, col)
      if (va == null && vb == null) return 0
      if (va == null) return -1
      if (vb == null) return 1
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortConfig.direction === 'asc' ? va - vb : vb - va
      }
      const sa = String(va).toLowerCase()
      const sb = String(vb).toLowerCase()
      if (sa < sb) return sortConfig.direction === 'asc' ? -1 : 1
      if (sa > sb) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [filtered, sortConfig, normalizedColumns])

  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  const pageData = pagination ? sorted.slice(start, end) : sorted

  const styles = {
    table: { backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)' },
    head: { backgroundColor: '#F9FAFB', color: '#374151', borderBottom: '1px solid #E5E7EB' },
    th: { fontSize: 14, fontWeight: 600, padding: '12px 16px', whiteSpace: 'nowrap' },
    td: { fontSize: 14, color: '#374151', padding: '12px 16px', borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle' },
    actions: { padding: 12 },
    ...customStyles
  }

  return (
    <div style={styles.table} className={`w-100 ${className}`}>
      <div className="d-flex justify-content-between align-items-center px-3 py-2 sdt-toolbar" style={{ borderBottom: '1px solid #E5E7EB' }}>
        <div className="small text-muted">Showing {pagination ? `${start + 1}-${Math.min(end, total)} of ${total}` : total}</div>
        <div className='position-relative'>
          <input
          type="text"
          className="form-control search_input"
          placeholder="Search..."
          value={filterText}
          onChange={(e) => { setFilterText(e.target.value); setPage(1) }}
          style={{ maxWidth: 240 }}
        />
        <CiSearch className="position-absolute top-50 translate-middle-y" style={{left: 8}} size={20}/>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table mb-0 sdt-table" style={{ tableLayout: 'auto' }}>
          <thead style={styles.head}>
            <tr>
              {normalizedColumns.map((col, i) => (
                <th
                  key={i}
                  style={{ ...styles.th, width: col.width }}
                  onClick={() => onHeaderClick(col, i)}
                >
                  <span className="d-inline-flex align-items-center" style={{ cursor: col.sortable ? 'pointer' : 'default' }}>
                    {col.name}
                    {col.sortable && (
                      <span className="ms-2 small text-muted">
                        {sortConfig.key === (col.selector ? `__selector_${i+1}` : `__cell_${i+1}`) ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 && (
              <tr>
                <td colSpan={normalizedColumns.length} className="text-center text-muted" style={{ padding: '24px' }}>No records found</td>
              </tr>
            )}
            {pageData.map((row, rIndex) => (
              <tr key={rIndex}>
                {normalizedColumns.map((col, cIndex) => (
                  <td key={cIndex} style={{ ...styles.td, textAlign: col.center ? 'center' : 'left' }}>
                    {col.cell ? col.cell(row, rIndex) : (col.selector ? col.selector(row, rIndex) : '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && (
        <div className="d-flex justify-content-between align-items-center px-3 py-2 sdt-pagination" style={{ borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Rows per page</span>
            <select className="form-select form-select-sm" style={{ width: 80 }} value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1) }}>
              {pageSizes.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(1)} disabled={currentPage === 1}>{'⏮'}</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>{'‹'}</button>
            <span className="small">Page {currentPage} of {totalPages}</span>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>{'›'}</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>{'⏭'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartDataTable


