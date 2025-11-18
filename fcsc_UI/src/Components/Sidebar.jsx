
import axios from "axios";
import React, { useState, useRef, useEffect,useContext } from "react";
import { FiCopy, FiX } from "react-icons/fi";
import { HiChevronRight, HiChevronDown } from "react-icons/hi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTranslation } from 'react-i18next';
import { AppContext } from "./context/AppContext";
import App from "../App";

// export default function Sidebar({ isOpen, queryHistory = [], setQueryHistory, handleProcess }) {
export default function Sidebar({ isOpen, handleProcess }) {
  const [queryHistory, setQueryHistory] = useState([]);
  const [showSchema, setShowSchema] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [schemaText, setSchemaText] = useState('');
  const [loadingSchema, setLoadingSchema] = useState(false);
  const {role}=useContext(AppContext)

      const { t } = useTranslation();
  // Make fetchSchema reusable and accessible across component
  const fetchSchema = async () => {
    try {
      setLoadingSchema(true);
      const res = await axios.get("http://127.0.0.1:8000/schema");
      setSchemaText(res.data.schema_content || "No schema found.");
    } catch (error) {
      setSchemaText("❌ Failed to load schema.");
    } finally {
      setLoadingSchema(false);
    }
  };

  useEffect(() => {
    fetchSchema(); // call on mount
  }, []);



// useEffect(() => {
//   const roleKey = role === 'admin' ? 'adminQueryHistory' : 'userQueryHistory';
//   const storedHistory = JSON.parse(localStorage.getItem(roleKey) || '[]');
//   setQueryHistory(storedHistory);
// }, [role]);

useEffect(() => {
  const roleKey = role === 'admin' ? 'adminQueryHistory' : 'userQueryHistory';

  const updateHistory = () => {
    const storedHistory = JSON.parse(localStorage.getItem(roleKey) || '[]');
    setQueryHistory(storedHistory);
  };

  // Initial load
  updateHistory();

  // Set interval to update every 5 seconds
  const interval = setInterval(updateHistory, 4000);

  // Clear interval on component unmount
  return () => clearInterval(interval);
}, [role]);



  const handleCopy = () => {
    navigator.clipboard.writeText(schemaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFileUpload = (fileList) => {
    const newFiles = Array.from(fileList);
    const validFiles = [];
    let duplicateFound = false;
    let invalidTypeFound = false;

    newFiles.forEach((file) => {
      const isDuplicate = uploadedFiles.some((f) => f.name === file.name);
      const isCsv = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");

      if (isDuplicate) {
        duplicateFound = true;
        toast.error(`File "${file.name}" already uploaded`, {
          position: "bottom-center",
          autoClose: 3000,
        });
        return;
      }

      if (!isCsv) {
        invalidTypeFound = true;
        toast.error(`Invalid file type: ${file.name}`, {
          position: "bottom-center",
          autoClose: 3000,
        });
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles]);
      setFiles((prev) => [...prev, ...validFiles]);
      toast.success("File(s) uploaded successfully", {
        position: "bottom-center",
        autoClose: 3000,
      });
      setUploadSuccess(true);
    }
  };

  // handle table creation and uploading files
  const handleTableCreation = async () => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const headers = {
          "Content-Type": "multipart/form-data"
        };

        const { data } = await axios.post("http://127.0.0.1:8000/upload-csv", formData, { headers });

        toast.success(`Table '${data?.table_name}' created`, {
          position: "bottom-center",
          autoClose: 3000,
        });

        // After successful upload, re-fetch the schema
        await fetchSchema();
      } catch (err) {
        toast.error("Failed to create table.");
      }
    }
  };

  // const handleRemoveHistory = (reverseIndex) => {
  //   const originalIndex = queryHistory.length - 1 - reverseIndex;
  //   const updatedHistory = queryHistory.filter((_, i) => i !== originalIndex);

  //   setQueryHistory(updatedHistory);
  //   localStorage.setItem("queryHistory", JSON.stringify(updatedHistory));
  // };


  const handleRemoveHistory = (reverseIndex) => {
  const roleKey = role === 'admin' ? 'adminQueryHistory' : 'userQueryHistory';
  const originalIndex = queryHistory.length - 1 - reverseIndex;
  const updatedHistory = queryHistory.filter((_, i) => i !== originalIndex);

  setQueryHistory(updatedHistory);
  localStorage.setItem(roleKey, JSON.stringify(updatedHistory));
};

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
    if (uploadedFiles.length === 1) {
      setUploadSuccess(false);
    }
  };

  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-300 px-6 py-6 z-30 transition-transform duration-300 ease-in-out transform ${
        isOpen ? "translate-x-0 w-80" : "-translate-x-full w-80"
      } font-sans text-gray-800 text-[15px] leading-relaxed overflow-y-auto`}
    >
      {/* About Section */}
      {role==="admin" && <div className="mb-6">
        <h2 className="text-[18px] font-semibold mb-2"  style={{ color: '##000000' }}>📝 {t('About')}</h2>
        <p>
          {t('matter')}
         
        </p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>
            <strong>{t('Schema Loader')}:</strong>{t('fmater')}
          </li>
          <li>
            <strong>{t('Selector Agent')}:</strong>{t('smater')} .
          </li>
          <li>
            <strong>{t('Decomposer Agent')}:</strong> {t('tmater')}.
          </li>
          <li>
            <strong>{t('Refiner Agent')}:</strong> {t('frmater')}.
          </li>
          <li>
            <strong>{t('Visualization Agent')}:</strong> {t('fimater')}.
          </li>
        </ul>
      </div>}
      {/*Database Status*/}
      {role==="admin" && schemaText && !loadingSchema && (
        <>
          <p>
            <strong  style={{ color: '##000000' }}>{t('Database Status')}:</strong>
          </p>
          <div className="mb-2 p-3 bg-blue-100 text-green-600 rounded text-md font-semibold">
           {t('schema loaded')}
          </div>
        </>
      )}

      {/* Schema Section */}
      {role==="admin" && <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded shadow-sm">
        <div
          className="flex justify-between items-center cursor-pointer group"
          onClick={() => {
            setShowSchema(!showSchema);
            if (!showSchema && !schemaText) fetchSchema(); 
          }}
        >
          <span className="font-light text-gray-700 group-hover:text-orange-500 transition-colors">
            View Schema
          </span>
          <span className="group-hover:text-orange-500 transition-colors">
            {showSchema ? <HiChevronDown /> : <HiChevronRight />}
          </span>
        </div>

        {showSchema && (
          <div className="mt-2 relative bg-white border border-gray-200 p-2 rounded text-sm max-h-48 overflow-y-auto">
            <pre className="text-gray-800 whitespace-pre-wrap">
              {loadingSchema ? "🔄 Loading schema..." : schemaText}
            </pre>
            <div className="absolute top-2 right-2 flex items-center">
              {copied ? (
                <span className="text-green-600 text-xs font-semibold">
                  Copied!
                </span>
              ) : (
                <button
                  onClick={handleCopy}
                  className="text-blue-500 hover:text-orange-500"
                  title="Copy"
                >
                  <FiCopy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>}

      {/* File Upload Section */}
      {role=== "admin" &&<div className="mb-6">
        <h2 className="text-[18px] font-semibold mb-2"  style={{ color: '##000000' }}>📁 {t('files')}</h2>
        <p className="text-sm mb-2 text-gray-600">{t('Upload CSV files')}</p>

        <ToastContainer />

        {/* File upload UI */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current.click()}
          className="p-4 rounded-md text-center text-sm mb-2 transition-all duration-300 ease-in-out border border-gray-400 text-gray-700 bg-gray-50 shadow-sm cursor-pointer hover:bg-gray-100"
        >
          Drag and drop files here or click to browse
          <br />
          <span className="text-xs text-gray-400">
            Limit 200MB per file • CSV only
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <div className="text-center ">
          <button
            onClick={() => fileInputRef.current.click()}
            className="w-full mt-1 px-3 py-2 bg-[##000000] text-white text-sm rounded hover:bg-blue-00"
          >
     {t('browse')}
          </button>
        </div>

        {/* Button for creating table from uploaded files */}
        {uploadedFiles.length > 0 && (
          <button
            onClick={handleTableCreation}
            className="border border-black text-black bg-white rounded px-4 py-1.5 mt-2
             hover:text-orange-500 hover:border-orange-500 transition-colors duration-200"
          >
         {t('create table')}
          </button>
        )}

        {/* Uploaded files list with remove option */}
        <div className="mt-2">
          {uploadedFiles.length === 0 && (
            <p className="text-xs text-gray-500 italic">
              {/* No files uploaded yet. */}
            </p>
          )}

          {uploadedFiles.map((file, index) => (
            <div
              key={file.name + index}
              className="flex items-center justify-between bg-gray-100 p-1 my-1 rounded"
            >
              <span className="text-sm p-1 truncate max-w-[180px]">
                {file.name}
              </span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="text-gray-500 hover:text-red-600"
                title="Remove file"
              >
                <FiX />
              </button>
            </div>
          ))}
        </div>
      </div>}

      {/* Query History Section */}
    {
      role==="admin" &&  <div className="mb-6">
        <h2 className="text-[18px] font-semibold mb-2"  style={{ color: '##000000' }}>🕑{t('History')}</h2>
        <div className="flex flex-col space-y-3 max-h-60 overflow-y-auto">
          {[...queryHistory]
            .slice(0)
            .reverse()
            .map((item, index) => (
              <div
                key={index}
                className="cursor-pointer rounded border border-gray-200 px-3 py-2 hover:bg-orange-50 flex justify-between items-start"
                onClick={() => handleProcess(item)}
              >
                <div className="max-w-[85%]">
                  <span>{item}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveHistory(index);
                  }}
                  className="text-gray-500 hover:text-red-600 ml-2"
                  title="Delete query"
                >
                  <FiX />
                </button>
              </div>
            ))}
        </div>
      </div> 
    }

    {
      role==="user"
      &&
       <div className="mb-6">
        <h2 className="text-[18px] font-semibold mb-2"  style={{ color: '##000000' }}>🕑{t('History')}</h2>
        <div className="flex flex-col space-y-3 ">
          {[...queryHistory]
            .slice(0)
            .reverse()
            .map((item, index) => (
              <div
                key={index}
                className="cursor-pointer rounded border border-gray-200 px-3 py-2 hover:bg-orange-50 flex justify-between items-start"
                onClick={() => handleProcess(item)}
              >
                <div className="max-w-[85%]">
                  <span>{item}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveHistory(index);
                  }}
                  className="text-gray-500 hover:text-red-600 ml-2"
                  title="Delete query"
                >
                  <FiX />
                </button>
              </div>
            ))}
        </div>
      </div> 
    }
{/* 
         <div className="mb-6">
  <h2 className="text-[18px] font-semibold mb-2" style={{ color: '##000000' }}>
    🕑{t('History')}
  </h2>

  <div
    className={`flex flex-col space-y-3 ${
      role === 'admin' ? 'max-h-60 overflow-y-auto' : ''
    }`}
  >
    {[...queryHistory]
      .slice(0)
      .reverse()
      .map((item, index) => (
        <div
          key={index}
          className="cursor-pointer rounded border border-gray-200 px-3 py-2 hover:bg-orange-50 flex justify-between items-start"
          onClick={() => handleProcess(item)}
        >
          <div className="max-w-[85%]">
            <span>{item}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveHistory(index);
            }}
            className="text-gray-500 hover:text-red-600 ml-2"
            title="Delete query"
          >
            <FiX />
          </button>
        </div>
      ))}
  </div>
</div> */}

    </div>
  );
}