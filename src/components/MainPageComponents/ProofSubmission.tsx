"use client"
import React, { useState } from 'react';
import { Upload, Link2, X, Send, ImageIcon } from 'lucide-react';

interface ProofSubmissionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proof: { images: File[], links: string[], description: string }) => void;
}

export const ProofSubmission: React.FC<ProofSubmissionProps> = ({ isOpen, onClose, onSubmit }) => {
  const [images, setImages] = useState<File[]>([]);
  const [links, setLinks] = useState<string[]>(['']);
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    setImages(prev => [...prev, ...files]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addLink = () => {
    setLinks(prev => [...prev, '']);
  };

  const updateLink = (index: number, value: string) => {
    setLinks(prev => prev.map((link, i) => i === index ? value : link));
  };

  const removeLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const filteredLinks = links.filter(link => link.trim() !== '');
    onSubmit({
      images,
      links: filteredLinks,
      description: description.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 w-full max-w-2xl border border-white/20 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Submit Proof of Completion</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-white font-medium mb-3">Upload Images</label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-purple-400 bg-purple-500/10'
                  : 'border-white/30 hover:border-white/50'
              }`}
            >
              <Upload className="w-12 h-12 text-purple-300 mx-auto mb-4" />
              <p className="text-white mb-2">Drag and drop images here, or</p>
              <label className="inline-block bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
                Browse Files
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-purple-300" />
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="text-xs text-purple-200 mt-1 truncate">{image.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <label className="block text-white font-medium mb-3">Add Links</label>
            <div className="space-y-3">
              {links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                    <Link2 className="w-4 h-4 text-purple-300 flex-shrink-0" />
                    <input
                      type="url"
                      placeholder="https://..."
                      value={link}
                      onChange={(e) => updateLink(index, e.target.value)}
                      className="flex-1 bg-transparent text-white placeholder-purple-300 outline-none"
                    />
                  </div>
                  {links.length > 1 && (
                    <button
                      onClick={() => removeLink(index)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addLink}
                className="text-purple-300 hover:text-purple-200 text-sm font-medium transition-colors"
              >
                + Add another link
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-medium mb-3">Description</label>
            <textarea
              placeholder="Describe how you completed your goal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-purple-300 outline-none focus:border-purple-400 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={images.length === 0 && links.every(link => !link.trim()) && !description.trim()}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit Proof
          </button>
        </div>
      </div>
    </div>
  );
};