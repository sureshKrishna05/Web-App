import React from 'react';

const ExportModal = ({ isOpen, onClose, onExport }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center">
                <h2 className="text-xl font-bold mb-4">Choose Export Format</h2>
                <p className="text-gray-600 mb-6">Select the format you would like to export the sales data to.</p>
                <div className="flex justify-center space-x-4">
                    <button 
                        onClick={() => onExport('csv')}
                        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    >
                        Export as CSV
                    </button>
                    <button 
                        onClick={() => onExport('xlsx')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                        Export as XLSX
                    </button>
                </div>
                <button 
                    onClick={onClose}
                    className="mt-6 text-sm text-gray-500 hover:underline"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ExportModal;