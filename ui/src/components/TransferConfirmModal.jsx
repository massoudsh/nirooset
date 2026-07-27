import ConfirmActionModal from './ConfirmActionModal'

export default function TransferConfirmModal({ open, onClose, onConfirm, recipient, amount }) {
  return (
    <ConfirmActionModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Confirm transfer"
    >
      <p className="text-gray-400 text-sm mb-1">Recipient</p>
      <p className="text-white font-mono truncate">{recipient}</p>
      <p className="text-gray-400 text-sm mt-2 mb-1">Amount</p>
      <p className="text-white font-semibold">{amount} kWh</p>
    </ConfirmActionModal>
  )
}
