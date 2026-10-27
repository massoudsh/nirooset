import { useEffect, useId, useRef } from 'react'

export default function StoreDialog({ title, onClose, children }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => dialog.close()
  }, [])

  return (
    <dialog ref={dialogRef} dir="rtl" lang="fa" aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); onClose() }}
      className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto rounded-xl border border-slate-700 bg-slate-800 p-4 text-start text-slate-100 shadow-xl backdrop:bg-black/60 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
        <button type="button" autoFocus onClick={onClose} aria-label="بستن پنجره"
          className="shrink-0 rounded px-3 py-2 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-energy-green">
          بستن
        </button>
      </div>
      {children}
    </dialog>
  )
}
