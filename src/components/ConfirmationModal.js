// client/src/components/ConfirmationModal.js
export default function ConfirmationModal({ title, message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '400px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#1b5e20' }}>{title}</h3>
        <p style={{ marginBottom: '20px' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <button
            onClick={onConfirm}
            style={{
              backgroundColor: '#1b5e20',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Да
          </button>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Нет
          </button>
        </div>
      </div>
    </div>
  );
}