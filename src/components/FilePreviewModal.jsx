const BACKEND_BASE_URL = 'http://localhost:3000';

const buildUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BACKEND_BASE_URL}${path}`;
};

const isImageFile = (path = '') => /\.(png|jpe?g|webp|gif)$/i.test(path);
const isPdfFile = (path = '') => /\.pdf$/i.test(path);

export default function FilePreviewModal({ isOpen, filePath, title = 'Vista previa', onClose }) {
  if (!isOpen || !filePath) return null;

  const url = buildUrl(filePath);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded bg-gray-300 px-4 py-2 text-gray-700"
          >
            Cerrar
          </button>
        </div>

        {isImageFile(filePath) && (
          <img
            src={url}
            alt={title}
            className="max-h-[75vh] w-full rounded-lg object-contain"
          />
        )}

        {isPdfFile(filePath) && (
          <iframe
            src={url}
            title={title}
            className="h-[75vh] w-full rounded-lg border"
          />
        )}

        {!isImageFile(filePath) && !isPdfFile(filePath) && (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">
            No hay previsualizacion disponible para este archivo.
          </div>
        )}
      </div>
    </div>
  );
}
