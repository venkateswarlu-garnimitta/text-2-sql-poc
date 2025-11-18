
import React, { useState, useRef, useEffect, useContext } from "react";
import { useTranslation } from 'react-i18next';
import UpdatedUILeftLogo from "../../public/UpdatedUILeftLogo.svg"; // Ensure path is correct
import UpdatedUIRightLogo from "../../public/UpdatedUIRightLogo.svg"; // Ensure path is correct
import User from "../../public/User.svg"; // Ensure path is correct
import { AppContext } from "./context/AppContext"; // Ensure path is correct
import { FiInfo, FiDatabase, FiUploadCloud, FiClock, FiChevronDown, FiGlobe, FiCopy, FiX, FiUser, FiMenu } from 'react-icons/fi';
import { HiChevronRight, HiChevronDown as HiChevronDownSolid } from "react-icons/hi";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { color } from "chart.js/helpers";

export default function Header({ isAdmin, setIsAdmin, handleProcess }) {
  const { i18n, t } = useTranslation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const headerRef = useRef(null);
  let hoverTimeout = null;

  // --- States for integrated sidebar functionalities ---
  const [queryHistory, setQueryHistory] = useState([]);
  const [showSchema, setShowSchema] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const fileInputRef = useRef(null);
  const [schemaText, setSchemaText] = useState('');
  const [loadingSchema, setLoadingSchema] = useState(false);

  // --- Functions for integrated sidebar functionalities ---
  const fetchSchema = async () => {
    if (!isAdmin) return;
    setLoadingSchema(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/schema");
      setSchemaText(res.data.schema_content || t("No schema found."));
    } catch (error) {
      setSchemaText(`❌ ${t("Failed to load schema.")}`);
      toast.error(t("Failed to load schema."));
    } finally {
      setLoadingSchema(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchSchema();
    else { setSchemaText(''); setShowSchema(false); setUploadedFiles([]); setFilesToUpload([]); }
  }, [isAdmin]);

  useEffect(() => {
    const currentRoleForHistory = isAdmin ? 'admin' : 'user';
    const roleKey = `${currentRoleForHistory}QueryHistory`;
    const updateHistory = () => {
      const storedHistory = JSON.parse(localStorage.getItem(roleKey) || '[]');
      setQueryHistory(storedHistory);
    };
    updateHistory();
    const interval = setInterval(updateHistory, 4000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(schemaText);
    setCopiedSchema(true);
    toast.success(t("Schema copied to clipboard!"), { autoClose: 1500 });
    setTimeout(() => setCopiedSchema(false), 1500);
  };

  const handleActualFileUpload = (selectedFileList) => {
    const newFilesArray = Array.from(selectedFileList);
    let validFiles = [];
    newFilesArray.forEach((file) => {
      const isDuplicate = uploadedFiles.some((f) => f.name === file.name) || filesToUpload.some((f) => f.name === file.name);
      const isCsv = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
      if (isDuplicate) { toast.error(`${t("File")} "${file.name}" ${t("already selected or uploaded")}.`); return; }
      if (!isCsv) { toast.error(`${t("Invalid file type")}: ${file.name}. ${t("Only CSV allowed.")}`); return; }
      validFiles.push(file);
    });
    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles]);
      setFilesToUpload((prev) => [...prev, ...validFiles]);
      toast.success(t("File(s) ready for table creation."));
    }
  };

  const handleTableCreation = async () => {
    if (filesToUpload.length === 0) { toast.warn(t("No new files selected for table creation.")); return; }
    let allSucceeded = true; const filesBeingUploaded = [...filesToUpload];
    setUploadedFiles([]); setFilesToUpload([]);
    for (const file of filesBeingUploaded) {
      const formData = new FormData(); formData.append("file", file);
      try {
        const { data } = await axios.post("http://127.0.0.1:8000/upload-csv", formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success(`${t("Table")} '${data?.table_name}' ${t("created from")} ${file.name}.`);
      } catch (err) { allSucceeded = false; toast.error(`${t("Failed to create table from")} ${file.name}.`); }
    }
    if (allSucceeded) await fetchSchema();
  };

  const handleFileChangeEv = (e) => { if (e.target.files.length > 0) handleActualFileUpload(e.target.files); if (fileInputRef.current) fileInputRef.current.value = ""; };
  const handleFileDropEv = (e) => { e.preventDefault(); if (e.dataTransfer.files.length > 0) handleActualFileUpload(e.dataTransfer.files); };
  const handleDragOverEv = (e) => e.preventDefault();
  const handleRemoveFile = (fileNameToRemove) => {
    setUploadedFiles((prev) => prev.filter((file) => file.name !== fileNameToRemove));
    setFilesToUpload((prev) => prev.filter((file) => file.name !== fileNameToRemove));
    toast.info(`${t("File")} ${fileNameToRemove} ${t("removed from list.")}`, { autoClose: 1500 });
  };
  const handleRemoveQueryHistoryItem = (reverseIndex) => {
    const currentRoleForHistory = isAdmin ? 'admin' : 'user';
    const roleKey = `${currentRoleForHistory}QueryHistory`;
    const originalIndex = queryHistory.length - 1 - reverseIndex;
    const updatedHistory = queryHistory.filter((_, i) => i !== originalIndex);
    setQueryHistory(updatedHistory); localStorage.setItem(roleKey, JSON.stringify(updatedHistory));
    toast.info(t("Query removed from history."), { autoClose: 2000 });
  };

  const handleNavItemMouseEnter = (dropdownId) => { clearTimeout(hoverTimeout); setActiveDropdown(dropdownId); };
  const handleNavItemMouseLeave = () => { hoverTimeout = setTimeout(() => setActiveDropdown(null), 200); };
  const handleDropdownInteractionEnter = () => clearTimeout(hoverTimeout);
  const handleNavItemClick = (dropdownId) => setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
  
  // Updated functions for user/admin dropdown
  const handleUserRoleClick = () => setActiveDropdown(activeDropdown === 'userRole' ? null : 'userRole');
  const handleRoleChange = (newRole) => {
    const newIsAdmin = newRole === 'admin';
    setIsAdmin(newIsAdmin);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleLanguageClick = () => setActiveDropdown(activeDropdown === 'language' ? null : 'language');
  const handleLanguageChange = (lang) => { i18n.changeLanguage(lang); setActiveDropdown(null); setMobileMenuOpen(false); };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (activeDropdown) setActiveDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => { if (headerRef.current && !headerRef.current.contains(event.target)) setActiveDropdown(null); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItemsDefinition = [
    {
      id: 'history', title: t('History'), icon: <FiClock size={22} />, adminOnly: false, isClickTriggered: true,
      content: (
        <div className="p-4 text-sm">
          {queryHistory.length === 0 ? (
            <p className="text-center text-white py-4">{t('No query history found.')}</p>
          ) : (
            <div className="space-y-2.5">
              {[...queryHistory].reverse().map((item, index) => (
                <div key={index} onClick={() => { if (handleProcess) handleProcess(item); setActiveDropdown(null); setMobileMenuOpen(false); }}
                     className="cursor-pointer rounded-lg border border-slate-500 p-3 hover:bg-slate-700 hover:border-sky-300 transition-colors group flex justify-between items-start shadow-sm">
                  <span className="text-white group-hover:text-white text-xs break-words mr-2">{item}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveQueryHistoryItem(index); }}
                          className="text-white hover:text-red-400 p-0.5" title={t("Delete query")}> <FiX size={16}/> </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'about', title: t('About'), icon: <FiInfo size={18} />, adminOnly: true,
      content: (
        <div className="p-4 text-sm text-slate-300 space-y-3 leading-relaxed">
          <p className="text-slate-200">{t('matter')}</p>
          <ul className="list-disc ml-5 space-y-2 text-slate-300">
            <li><strong className="text-slate-100">{t('Schema Loader')}:</strong> {t('fmater')}</li>
            <li><strong className="text-slate-100">{t('Selector Agent')}:</strong> {t('smater')}</li>
            <li><strong className="text-slate-100">{t('Decomposer Agent')}:</strong> {t('tmater')}</li>
            <li><strong className="text-slate-100">{t('Refiner Agent')}:</strong> {t('frmater')}</li>
            <li><strong className="text-slate-100">{t('Visualization Agent')}:</strong> {t('fimater')}</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'dbStatus', title: t('Database Status'), icon: <FiDatabase size={18} />, adminOnly: true,
      content: (
        <div className="p-4 text-sm space-y-3.5">
          {isAdmin && schemaText && !loadingSchema && (
            <div className="p-2.5 bg-gray-600 bg-opacity-50 text-white rounded-md text-center font-semibold shadow-sm"> {t('schema loaded')} </div>
          )}
          {isAdmin && (
            <>
              <div className="flex justify-between items-center cursor-pointer group p-2.5 rounded-md hover:bg-slate-700 transition-colors" onClick={() => setShowSchema(!showSchema)}>
                <span className="font-medium text-white group-hoveZ:text-gray-400">{t('View Schema')}</span>
                <span className="text-sky-400 group-hover:text-sky-300"> {showSchema ? <HiChevronDownSolid size={20}/> : <HiChevronRight size={20}/>}</span>
              </div>
              {showSchema && (
                <div className="relative bg-black/60 border border-slate-600 p-3.5 rounded-md max-h-52 overflow-y-auto custom-scrollbar shadow-inner">
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {loadingSchema ? `🔄 ${t("Loading schema...")}` : schemaText}
                  </pre>
                  {!loadingSchema && schemaText && schemaText !== t("No schema found.") && !schemaText.startsWith("❌") && (
                    <button onClick={handleCopySchema} className="absolute top-2.5 right-2.5 text-sky-400 hover:text-sky-300 p-1.5 bg-slate-700 rounded-full shadow-sm" title={t("Copy Schema")}>
                      {copiedSchema ? <span className="text-xs text-green-400 px-1">{t("Copied!")}</span> : <FiCopy size={14}/>}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      id: 'upload', title: t('files'), icon: <FiUploadCloud size={18} />, adminOnly: true,
      content: (
        <div className="p-4 text-sm space-y-3.5">
          {isAdmin && (
            <>
              <p className="text-slate-300">{t('Upload CSV files to create tables.')}</p>
              <div onDrop={handleFileDropEv} onDragOver={handleDragOverEv} onClick={() => fileInputRef.current?.click()}
                   className="p-6 rounded-lg text-center transition-all border-2 border-dashed border-slate-600 text-slate-400 bg-black/60 cursor-pointer hover:border-sky-500 hover:bg-slate-700 shadow-sm">
                <FiUploadCloud size={32} className="mx-auto mb-2.5 text-slate-500"/>
                {t('Drag and drop files here, or click to browse')}
                <p className="text-xs text-slate-500 mt-1.5">{t('Limit 200MB per file • CSV only')}</p>
                <input ref={fileInputRef} type="file" accept=".csv" multiple onChange={handleFileChangeEv} className="hidden"/>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1.5">
                  <h4 className="text-xs font-semibold text-slate-400 mb-1">{t("Files ready for upload:")}</h4>
                  {uploadedFiles.map((file) => (
                    <div key={file.name} className="flex items-center justify-between border border-slate-700 p-2.5 rounded-md text-xs shadow-sm hover:bg-slate-700">
                      <span className="truncate max-w-xs text-slate-300" title={file.name}>{file.name}</span>
                      <button onClick={() => handleRemoveFile(file.name)} className="text-red-500 hover:text-red-400 ml-2" title={t("Remove file")}><FiX size={16}/></button>
                    </div>
                  ))}
                </div>
              )}
              {filesToUpload.length > 0 && (
                <button onClick={handleTableCreation} className="w-full px-4 py-2.5  text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-colors shadow-md">
                  {t('Create Table(s) from Selected Files')}
                </button>
              )}
            </>
          )}
        </div>
      ),
    }
  ];

  const visibleNavItems = navItemsDefinition.filter(item => isAdmin || !item.adminOnly);
  const queryHistoryItem = visibleNavItems.find(item => item.isIconOnly);
  const otherNavItems = visibleNavItems.filter(item => !item.isIconOnly);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark"/>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 7px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #475569; border-radius: 10px; } /* slate-600 */
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #334155; } /* slate-700 */
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #475569 transparent; }
      `}</style>

      <header ref={headerRef} className="bg-[#374a66] text-white fixed w-full top-0 left-0 z-40 shadow-xl">
        <div className="flex items-center justify-between px-4 h-24"> 
          <div className="flex items-center h-full"> 
            <img src={UpdatedUILeftLogo} alt="Left Logo" className="h-11 md:h-12" />
            
            {/* Mobile menu button - hidden on desktop */}
            <button 
              onClick={toggleMobileMenu}
              className="ml-4 p-2 rounded-md hover:bg-slate-700 focus:outline-none transition-colors duration-150 md:hidden"
              aria-label="Toggle menu"
            >
              <FiMenu size={24} className="text-white" />
            </button>

            {/* Desktop navigation - hidden on mobile */}
            <div className="hidden md:flex items-center h-full">
              {queryHistoryItem && (
                <div className="relative ml-4 h-full flex items-center"> 
                  <button
                    onClick={() => handleNavItemClick(queryHistoryItem.id)}
                    className="p-2.5 rounded-md hover:bg-slate-700 focus:outline-none transition-colors duration-150"
                    title={queryHistoryItem.title}
                  >
                    <span className="text-white hover:text-orange-500 transition-colors duration-150">{queryHistoryItem.icon}</span>
                  </button>
                  {activeDropdown === queryHistoryItem.id && (
                      <div 
                          onMouseEnter={handleDropdownInteractionEnter} onMouseLeave={handleNavItemMouseLeave}
                          className="absolute top-full mt-0 left-0 w-80 md:w-96 bg-black/60 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 z-50 overflow-hidden"
                      >
                          <h3 className="text-sm font-semibold text-neutral-200 bg-black/60 px-4 py-3 border-b border-slate-700">{queryHistoryItem.title}</h3>
                          <div className="custom-scrollbar overflow-y-auto max-h-[calc(80vh-10rem)]"> 
                              {queryHistoryItem.content}
                          </div>
                      </div>
                  )}
                </div>
              )}

              <nav className="flex items-center space-x-1.5 lg:space-x-2 ml-2 h-full"> 
                  {otherNavItems.map((item) => (
                  <div
                      key={item.id}
                      className="relative group h-full flex items-center" 
                      onMouseEnter={() => handleNavItemMouseEnter(item.id)}
                      onMouseLeave={handleNavItemMouseLeave}
                  >
                      <button
                      className="flex items-center px-3 py-2 rounded-md hover:bg-slate-700 focus:outline-none transition-colors duration-150"
                      title={item.title}
                      >
                      <span className="text-white group-hover:text-orange-500 transition-colors duration-150">{item.icon}</span>
                      <span className="ml-2 text-sm font-medium text-white group-hover:text-orange-500 transition-colors duration-150 hidden md:inline">{item.title}</span>
                      </button>
                      {activeDropdown === item.id && (
                      <div 
                          onMouseEnter={handleDropdownInteractionEnter} onMouseLeave={handleNavItemMouseLeave}
                          className="absolute top-full mt-0 left-1/2 transform -translate-x-1/2 w-80 md:w-96 bg-black/60 backdrop-blur-md rounded-xl shadow-2xl border border-slate-700 z-50 overflow-hidden"
                      >
                          <h3 className="text-sm font-semibold text-slate-200 bg-black/60 px-4 py-3 border-b border-slate-700">{item.title}</h3>
                          <div className="max-h-[calc(80vh-8rem)] overflow-y-auto custom-scrollbar">
                              {item.content}
                          </div>
                      </div>
                      )}
                  </div>
                  ))}
              </nav>
            </div>
          </div>

          <div className="flex items-center h-full space-x-3 md:space-x-4"> 
            {/* User/Admin Role Dropdown */}
            <div className="relative group h-full flex items-center"> 
              <button 
                onClick={handleUserRoleClick}
                className="flex items-center text-white group-hover:text-orange-500 focus:outline-none p-2 rounded-md hover:bg-slate-700 transition-colors"
                title={isAdmin ? t('Admin') : t('User')}
              >
                <FiUser size={18}/>
                <span className="text-xs ml-1.5 hidden sm:inline group-hover:text-orange-500">
                  {isAdmin ? t('Admin') : t('User')}
                </span>
                <FiChevronDown size={14} className="ml-1 group-hover:text-orange-500"/>
              </button>
              {activeDropdown === 'userRole' && (
                <div 
                  className="absolute right-0 top-full mt-0 w-32 bg-black/60 backdrop-blur-md border border-slate-700 shadow-xl rounded-lg z-50"
                >
                  <ul className="text-sm text-slate-200">
                    <li 
                      onClick={() => handleRoleChange('user')} 
                      className={`px-3 py-2 hover:bg-slate-700 cursor-pointer flex items-center ${!isAdmin ? 'bg-slate-700 text-white-400' : ''}`}
                    >
                      <span className="mr-2">   
                         <img src={User} alt="User" className="h-5 md:h-5 text-white fill-white" />
                      </span>
                      {t('User')}
                    </li>
                    <li 
                      onClick={() => handleRoleChange('admin')} 
                      className={`px-3 py-2 hover:bg-slate-700 cursor-pointer flex items-center ${isAdmin ? 'bg-slate-700 text-white-400' : ''}`}
                    >
                      <span className="mr-2">
                         <img src={User} alt="User" className="h-5 md:h-5 text-white fill-white" />
                      </span>
                      {t('Admin')}
                    </li>
                  </ul>
                </div>
              )}
            </div>
            
            <div className="relative group h-full flex items-center"> 
              <button onClick={handleLanguageClick}
                      className="flex items-center text-white group-hover:text-orange-500 focus:outline-none p-2 rounded-md hover:bg-slate-700 transition-colors">
                <FiGlobe size={18}/>
                <span className="text-xs ml-1.5 hidden sm:inline group-hover:text-orange-500">{i18n.language.toUpperCase()}</span>
                <FiChevronDown size={14} className="ml-1 group-hover:text-orange-500"/>
              </button>
              {activeDropdown === 'language' && (
                <div onMouseEnter={handleDropdownInteractionEnter} onMouseLeave={handleNavItemMouseLeave}
                     className="absolute right-0 top-full mt-0 w-36 bg-black/60 backdrop-blur-md border border-slate-700 shadow-xl rounded-lg z-50"
                >
                  <ul className="text-sm text-slate-200">
                    <li onClick={() => handleLanguageChange('en')} className="px-3 py-2 hover:bg-slate-700 cursor-pointer">{t('English')}</li>
                    <li onClick={() => handleLanguageChange('ar')} className="px-3 py-2 hover:bg-slate-700 cursor-pointer">{t('Arabic')}</li>
                  </ul>
                </div>
              )}
            </div>
            <img src={UpdatedUIRightLogo} alt="Right Logo" className="h-10 md:h-11 self-center" /> 
          </div>
        </div>
        
        {/* Mobile menu - shown only on mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#2c3a56] w-full absolute top-20 left-0 z-40 shadow-lg">
            <div className="px-4 py-3 space-y-4">
              {visibleNavItems.map((item) => (
                <div key={item.id} className="border-b border-slate-600 pb-3 last:border-0">
                  <button
                    onClick={() => handleNavItemClick(item.id)}
                    className="flex items-center w-full text-left p-2 rounded-md hover:bg-slate-700 transition-colors"
                  >
                    <span className="text-white mr-3">{item.icon}</span>
                    <span className="text-white font-medium">{item.title}</span>
                    <FiChevronDown 
                      size={18} 
                      className={`ml-auto transition-transform ${activeDropdown === item.id ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {activeDropdown === item.id && (
                    <div className="mt-2 ml-2 pl-6 border-l-2 border-slate-600">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="w-full h-px bg-slate-400 opacity-40"></div> 
      </header>
    </>
  );
}