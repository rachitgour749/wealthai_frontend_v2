import React from 'react';
import { X } from 'lucide-react';

export function CitationModal({ isOpen, onClose, citations }) {
    if (!isOpen) return null;

    return (
        <div className={`modal ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Source Citations</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="modal-body">
                    {citations.map((c, i) => (
                        <div key={i} className="citation-item">
                            <div className="citation-header">
                                <span className="citation-number">{i + 1}</span>
                                <span className="citation-title">{c.title || 'Document'}</span>
                            </div>
                            {c.snippet && (
                                <div className="citation-content">"{c.snippet}"</div>
                            )}
                            <div className="citation-source">
                                📄 {c.source || 'File Search'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
