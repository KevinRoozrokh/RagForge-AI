import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { KnowledgeFile } from '../types';
import UploadIcon from './icons/UploadIcon';
import PdfIcon from './icons/PdfIcon';
import DocxIcon from './icons/DocxIcon';
import TrashIcon from './icons/TrashIcon';
import GoogleDriveIcon from './icons/GoogleDriveIcon';
import MagnifyingGlassIcon from './icons/SearchIcon';

const MAX_FILES = 100;
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

const KnowledgeBase: React.FC = () => {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('date-desc');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDriveAuthenticated, setIsDriveAuthenticated] = useState<boolean>(false);
  const [isDriveAuthInProgress, setIsDriveAuthInProgress] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const storedFiles = localStorage.getItem('knowledgeFiles');
      if (storedFiles) {
        setFiles(JSON.parse(storedFiles));
      }
      const storedAuthState = localStorage.getItem('driveAuthenticated');
      if (storedAuthState === 'true') {
        setIsDriveAuthenticated(true);
      }
    } catch (e) {
      console.error("Failed to parse data from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('knowledgeFiles', JSON.stringify(files));
    } catch (e) {
      console.error("Failed to save knowledge files to localStorage", e);
    }
  }, [files]);

  const processFiles = useCallback((fileList: FileList) => {
    setError(null);
    const newFiles: KnowledgeFile[] = [];
    const currentFileNames = new Set(files.map(f => f.name));

    if (files.length + fileList.length > MAX_FILES) {
      setError(`You can only upload a maximum of ${MAX_FILES} files.`);
      return;
    }
    
    for (const file of Array.from(fileList)) {
        if (!ALLOWED_FILE_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.some(ext => file.name.endsWith(ext))) {
            setError(`Invalid file type: ${file.name}. Only PDF and DOCX files are allowed.`);
            return;
        }
        if (currentFileNames.has(file.name)) {
            console.warn(`Skipping duplicate file: ${file.name}`);
            continue;
        }
        newFiles.push({ name: file.name, type: file.type, size: file.size, dateAdded: Date.now() });
    }
    
    setFiles(prevFiles => [...prevFiles, ...newFiles].slice(0, MAX_FILES));
  }, [files]);

  const filteredAndSortedFiles = useMemo(() => {
    return files
      .filter(file => file.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const [sortBy, direction] = sortOrder.split('-');
        const dir = direction === 'asc' ? 1 : -1;

        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name) * dir;
          case 'size':
            return (a.size - b.size) * dir;
          case 'date':
            return (a.dateAdded - b.dateAdded) * dir;
          default:
            return 0;
        }
      });
  }, [files, searchTerm, sortOrder]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDelete = (fileName: string) => {
    setFiles(files.filter(f => f.name !== fileName));
  };
  
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleDriveAction = () => {
    if (!isDriveAuthenticated) {
      setIsDriveAuthInProgress(true);
      setTimeout(() => {
        setIsDriveAuthenticated(true);
        localStorage.setItem('driveAuthenticated', 'true');
        setIsDriveAuthInProgress(false);
        alert('Successfully connected to Google Drive!');
      }, 2000);
    } else {
      alert('This would initiate the process to save your knowledge base files to Google Drive.');
      console.log('Saving files to Google Drive:', files);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl sm:text-4xl font-sans font-medium text-on-surface">Knowledge Base</h1>
            <p className="mt-2 text-on-surface-variant">Manage documents for your custom RAGs.</p>
        </div>
        <button 
          onClick={handleDriveAction}
          disabled={isDriveAuthInProgress}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium bg-surface rounded-full text-primary border border-outline hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          <GoogleDriveIcon className="w-5 h-5 mr-2" />
          {isDriveAuthInProgress
            ? 'Connecting...'
            : isDriveAuthenticated
            ? 'Save to Google Drive'
            : 'Connect Google Drive'}
        </button>
      </div>

      <div 
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-300 ${isDragging ? 'border-primary bg-primary/10' : 'border-outline-variant hover:border-outline'}`}
      >
        <div className="flex flex-col items-center">
            <UploadIcon className="w-12 h-12 text-on-surface-variant" />
            <p className="mt-4 text-lg font-medium text-on-surface">Drag & drop files here</p>
            <p className="mt-1 text-sm text-on-surface-variant">or</p>
            <button onClick={() => fileInputRef.current?.click()} className="mt-2 px-4 py-2 text-sm font-medium text-background bg-primary rounded-full hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary">
                Browse Files
            </button>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileChange}
            />
            <p className="mt-3 text-xs text-on-surface-variant">Supports: PDF, DOCX. Max {MAX_FILES} files.</p>
        </div>
      </div>
      
      {error && <p className="mt-4 text-sm text-red-400 text-center" role="alert">{error}</p>}

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Uploaded Documents</h2>
            <span className="text-sm font-medium text-on-surface-variant">{files.length} / {MAX_FILES} files</span>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-on-surface-variant" />
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface border border-outline text-on-surface rounded-full pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                aria-label="Search documents"
              />
          </div>
           <div className="w-full sm:w-auto">
              <label htmlFor="sort-order" className="sr-only">Sort by</label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full sm:w-auto bg-surface border border-outline text-on-surface rounded-full px-3 py-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-all appearance-none"
                style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}
              >
                  <option value="date-desc">Date Added (Newest)</option>
                  <option value="date-asc">Date Added (Oldest)</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="size-desc">Size (Largest)</option>
                  <option value="size-asc">Size (Smallest)</option>
              </select>
            </div>
        </div>

        <div className="w-full bg-tertiary rounded-full h-1.5 mb-4">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(files.length / MAX_FILES) * 100}%` }}></div>
        </div>
        
        <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden">
            <ul className="divide-y divide-outline-variant">
                {filteredAndSortedFiles.length > 0 ? filteredAndSortedFiles.map(file => (
                    <li key={file.name} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors duration-200">
                        <div className="flex items-center space-x-4 min-w-0">
                            {file.name.toLowerCase().endsWith('.pdf') ? <PdfIcon className="w-6 h-6 text-red-400 flex-shrink-0" /> : <DocxIcon className="w-6 h-6 text-blue-400 flex-shrink-0" />}
                            <span className="font-medium text-on-surface truncate" title={file.name}>{file.name}</span>
                        </div>
                        <div className="flex items-center space-x-4 ml-4">
                            <span className="text-sm text-on-surface-variant hidden md:inline">{new Date(file.dateAdded).toLocaleDateString()}</span>
                            <span className="text-sm text-on-surface-variant w-20 text-right">{formatBytes(file.size)}</span>
                            <button onClick={() => handleDelete(file.name)} className="text-on-surface-variant hover:text-red-400 transition-colors p-1 rounded-full" aria-label={`Delete ${file.name}`}>
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </li>
                )) : (
                    <li className="p-8 text-center text-on-surface-variant">
                        {files.length > 0 && searchTerm ? 'No documents match your search.' : 'No documents uploaded yet.'}
                    </li>
                )}
            </ul>
        </div>
      </div>

    </div>
  );
};

export default KnowledgeBase;