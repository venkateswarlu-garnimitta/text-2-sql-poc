// // import { useState, useEffect } from "react";
// // import Sidebar from "./Components/Sidebar";
// // import MainContent from "./Components/MainContent";
// // import Header from "./Components/Header";
// // import "./i18n";
// // import { useTranslation } from "react-i18next";
// // import { AppContext } from "./Components/context/AppContext";
// // import background from "../public/background.svg";

// // function App() {
// //   const [query, setQuery] = useState("");
// //   const [resultData, setResultData] = useState([]);
// //   const [visualizationType, setVisualizationType] = useState("Table");
// //   const [role, setRole] = useState("admin");
// //   const [sidebarOpen, setSidebarOpen] = useState(false);
// //   const [isAdmin, setIsAdmin] = useState(true); // ✅ Define here
// //   const [hasProcessed, setHasProcessed] = useState(false);

// //   const [queryHistory, setQueryHistory] = useState(() => {
// //     return JSON.parse(localStorage.getItem("queryHistory") || "[]");
// //   });
// //   const [autoRun, setAutoRun] = useState(false);

// //   const { i18n } = useTranslation();
// //   const selectedLanguage = i18n.language;

// //   const [viewQueries, setViewQueries] = useState({ admin: "", user: "" });
// //   const currentQueryForRole = viewQueries[role] || "";
// //   const [viewHasProcessed, setViewHasProcessed] = useState({ admin: false, user: false });

// //   const currentQuery = viewQueries[role] || ""; // Ensure currentQuery is always a string
// // //  const setCurrentQuery = (newQuery) => {
// // //   setViewQueries(prev => ({ ...prev, [role]: newQuery }));
// // // };
// // const setCurrentQueryForRole = (newQueryText) => {
// //   setViewQueries(prev => ({ ...prev, [role]: newQueryText }));
// // };

// // const handleProcessFromSidebar = (selectedQuery) => {
// //   setQuery(selectedQuery);
// //   setAutoRun(true); // flag to run processQuery automatically
// // };

// //   // Helper to get/set hasProcessed for the current role
// //   const currentHasProcessed = viewHasProcessed[role] || false;
// //   const setCurrentHasProcessed = (processedStatus) => {
// //     setViewHasProcessed(prev => ({ ...prev, [role]: processedStatus }));
// //   };

// // // Helper to get/set query for the current role

// //   // const handleProcessFromSidebar = (selectedQuery) => {
// //   //   // setQuery(selectedQuery);
// //   //   setCurrentQuery(selectedQuery);
// //   //   setTimeout(() => {
// //   //     setAutoRun(true);
// //   //   }, 0);
// //   // };

// //   useEffect(() => {
// //     const stored = JSON.parse(localStorage.getItem("queryHistory") || "[]");
// //     setQueryHistory(stored);
// //   }, []);

// //   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

// //   const handleAdminToggle = (newMode) => {
// //     const newRoleForToggle = newMode ? "admin" : "user"; // Define the new role explicitly
// //     setRole(newRoleForToggle);                             // Update the role state
// //     setIsAdmin(newMode);
// //   };

// //     const handleQuerySubmit = async () => {
// //     await new Promise((r) => setTimeout(r, 1500));
// //     setResultData([
// //       { Name: "Alice", Age: 28 },
// //       { Name: "Bob", Age: 34 },
// //     ]);
// //   };

// //   const handleClearResults = () => {
// //     if (query.trim()) {
// //       const updated = [...queryHistory, query.trim()];
// //       setQueryHistory(updated);
// //       localStorage.setItem("queryHistory", JSON.stringify(updated));
// //     }

// //     // setQuery("");
// //     setCurrentQuery("");
// //     setResultData([]);
// //   };

// //   return (
// //     <AppContext.Provider value={{ role, setRole }}>
// //       <div
// //         className="flex h-screen fixed inset-0"
// //         style={{
// //           backgroundImage: `url(${background})`,
// //           backgroundSize: "cover",
// //           backgroundPosition: "center",
// //           backgroundRepeat: "no-repeat",
// //           backgroundAttachment: "fixed",
// //         }}
// //       >        {/* <Sidebar
// //           isOpen={sidebarOpen}
// //            queryHistory={queryHistory}
// //           setQueryHistory={setQueryHistory}
// //         handleProcess={handleProcessFromSidebar}
// //         /> */}

// //         <div className="flex-1 relative">
// //           <Header
// //             // toggleSidebar={toggleSidebar}
// //             isAdmin={isAdmin}
// //             setIsAdmin={handleAdminToggle}
// //             handleProcess={handleProcessFromSidebar}
// //           />

// //           <main
// //             className={`transition-all duration-300 ease-in-out min-h-screen pt-24 px-6 ${
// //               sidebarOpen ? "ml-80" : "ml-0"
// //             }`}
// //           >
// //             <MainContent
// //               // query={currentQueryForRole}
// //               // setQuery={setCurrentQueryForRole}
// //               query={query}
// //               setQuery={setQuery}
// //               onSubmit={handleQuerySubmit}
// //               onClear={handleClearResults}
// //               isSidebarOpen={sidebarOpen}
// //               setQueryHistory={setQueryHistory}
// //               autoRun={autoRun}
// //               setAutoRun={setAutoRun}
// //               language={selectedLanguage}
// //               isAdmin={isAdmin}
// //               hasProcessed={currentHasProcessed} // ✅ pass down
// //               setHasProcessed={setCurrentHasProcessed}
// //               role={role}
// //             />
// //           </main>
// //         </div>
// //       </div>
// //     </AppContext.Provider>
// //   );
// // }

// // export default App;


// import { useState, useEffect } from "react";
// import Sidebar from "./Components/Sidebar";
// import MainContent from "./Components/MainContent";
// import Header from "./Components/Header";
// import "./i18n";
// import { useTranslation } from "react-i18next";
// import { AppContext } from "./Components/context/AppContext";
// import background from "../public/background.webp";

// function App() {
//   const [query, setQuery] = useState("");
//   const [resultData, setResultData] = useState([]);
//   const [visualizationType, setVisualizationType] = useState("Table");
//   const [role, setRole] = useState("admin");
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(true);
//   const [hasProcessed, setHasProcessed] = useState(false);

//   const [queryHistory, setQueryHistory] = useState(() => {
//     return JSON.parse(localStorage.getItem("queryHistory") || "[]");
//   });
//   const [autoRun, setAutoRun] = useState(false);

//   const { i18n } = useTranslation();
//   const selectedLanguage = i18n.language;

//   const [viewQueries, setViewQueries] = useState({ admin: "", user: "" });
//   const currentQueryForRole = viewQueries[role] || "";
//   const [viewHasProcessed, setViewHasProcessed] = useState({
//     admin: false,
//     user: false,
//   });

//   const setCurrentQueryForRole = (newQueryText) => {
//     setViewQueries((prev) => ({ ...prev, [role]: newQueryText }));
//   };

//   const handleProcessFromSidebar = (selectedQuery) => {
//     setQuery(selectedQuery);
//     setAutoRun(true);
//   };

//   const currentHasProcessed = viewHasProcessed[role] || false;
//   const setCurrentHasProcessed = (processedStatus) => {
//     setViewHasProcessed((prev) => ({ ...prev, [role]: processedStatus }));
//   };

//   useEffect(() => {
//     const stored = JSON.parse(localStorage.getItem("queryHistory") || "[]");
//     setQueryHistory(stored);
//   }, []);

//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

//   const handleAdminToggle = (newMode) => {
//     const newRoleForToggle = newMode ? "admin" : "user";
//     setRole(newRoleForToggle);
//     setIsAdmin(newMode);
//   };

//   const handleQuerySubmit = async () => {
//     await new Promise((r) => setTimeout(r, 1500));
//     setResultData([
//       { Name: "Alice", Age: 28 },
//       { Name: "Bob", Age: 34 },
//     ]);
//   };

//   const handleClearResults = () => {
//     if (query.trim()) {
//       const updated = [...queryHistory, query.trim()];
//       setQueryHistory(updated);
//       localStorage.setItem("queryHistory", JSON.stringify(updated));
//     }

//     setCurrentQueryForRole("");
//     setResultData([]);
//   };

//   return (
//     <AppContext.Provider value={{ role, setRole }}>
//       <div className="flex min-h-screen">
//         {/* Sidebar */}
//         {/* <Sidebar
//           isOpen={sidebarOpen}
//           queryHistory={queryHistory}
//           setQueryHistory={setQueryHistory}
//           handleProcess={handleProcessFromSidebar}
//         /> */}

//         {/* Main Content Area */}
//         <div className="flex-1 flex flex-col">
//           {/* Header - Fixed at top */}
//           <div className="sticky top-0 z-50 bg-white shadow-sm">
//             <Header
//               // toggleSidebar={toggleSidebar}
//               isAdmin={isAdmin}
//               setIsAdmin={handleAdminToggle}
//               handleProcess={handleProcessFromSidebar}
//             />
//           </div>

//           {/* Content Area with overlapping layout */}
//           <div className="flex-1 relative">
//             {/* Hero Section with Background Image */}
//             <section
//               className={`h-screen flex items-center justify-center transition-all duration-300 ease-in-out ${
//                 sidebarOpen ? "ml-80" : "ml-0"
//               }`}
//               style={{
//                 backgroundImage: `url(${background})`,
//                 backgroundSize: "cover",
//                 backgroundPosition: "center",
//                 backgroundRepeat: "no-repeat",
//               }}
//             >
//               {/* Overlay for better text readability */}
//               <div className="absolute inset-0 bg-black bg-opacity-20"></div>

//               {/* Hero Content */}
//               <div className="relative z-10 text-center text-white px-4">
//                 <h1 className="text-4xl md:text-6xl font-bold mb-4">
//                   Data For A Better Future
//                 </h1>
//                 <p className="text-xl md:text-2xl">
//                   THE BEST COUNTRY IN THE WORLD BY 2071
//                 </p>
//               </div>
//             </section>

//             {/* Overlapping Main Content Container */}
//             <div
//               className={`relative -mt-32 z-20 transition-all duration-300 ease-in-out ${
//                 sidebarOpen ? "ml-80" : "ml-0"
//               }`}
//             >
//               <div className="mx-auto px-6 max-w-7xl w-full">
//                 <div className="max-w-full mx-auto">
//                   {/* Main Container with Left Badge - Now overlapping the background */}
//                   {/* <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden min-h-[70vh]"> */}
//                   <div className="relative bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden min-h-[70vh]">
//                     {/* Left Side Badge - Made larger and more prominent */}
//                     <div className="absolute left-0 top-8 w-14 h-40 bg-[#B57C6C] flex items-center justify-center z-10 rounded-r-lg">
//                       <div className="transform -rotate-90 whitespace-nowrap">
//                         <span className="text-white font-bold text-lg tracking-wider">
//                           UAE STAT
//                         </span>
//                       </div>
//                     </div>

//                     {/* Main Content Area */}
//                     <div className="ml-24">
//                       {/* UAE Stat Header Section */}
//                       <div className="p-8 pb-6">
//                         <div className="flex items-center mb-8">
//                           <div className="flex items-center">
//                             {/* UAE Icon/Chart */}
//                             <div className="w-20 h-20 mr-6">
//                               <svg
//                                 viewBox="0 0 100 100"
//                                 className="w-full h-full text-orange-500"
//                               >
//                                 <path
//                                   d="M20 80 L30 60 L40 70 L50 50 L60 65 L70 45 L80 55"
//                                   stroke="currentColor"
//                                   strokeWidth="3"
//                                   fill="none"
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                 />
//                                 <circle
//                                   cx="30"
//                                   cy="60"
//                                   r="3"
//                                   fill="currentColor"
//                                 />
//                                 <circle
//                                   cx="40"
//                                   cy="70"
//                                   r="3"
//                                   fill="currentColor"
//                                 />
//                                 <circle
//                                   cx="50"
//                                   cy="50"
//                                   r="3"
//                                   fill="currentColor"
//                                 />
//                                 <circle
//                                   cx="60"
//                                   cy="65"
//                                   r="3"
//                                   fill="currentColor"
//                                 />
//                                 <circle
//                                   cx="70"
//                                   cy="45"
//                                   r="3"
//                                   fill="currentColor"
//                                 />
//                                 <circle
//                                   cx="80"
//                                   cy="55"
//                                   r="3"
//                                   fill="currentColor"
//                                 />
//                                 {/* UAE Hand outline */}
//                                 <path
//                                   d="M15 85 Q20 82 25 85 L30 88 Q35 85 40 88"
//                                   stroke="currentColor"
//                                   strokeWidth="2"
//                                   fill="none"
//                                 />
//                               </svg>
//                             </div>

//                             {/* UAE Stat Branding */}
//                             <div>
//                               <h2 className="text-4xl font-bold">
//                                 <span className="text-teal-500">UAE</span>
//                                 <span className="text-gray-800">Stat</span>
//                               </h2>
//                               <p className="text-gray-600 text-xl">
//                                 Search, Visualise, and Share Data
//                               </p>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Divider */}
//                         <div className="w-full h-1 bg-gradient-to-r from-[#B57C6C] to-teal-500 rounded-full mb-10"></div>
//                       </div>

//                       {/* Main Content Component */}
//                       <div className="px-8 pb-8">
//                         <MainContent
//                           query={query}
//                           setQuery={setQuery}
//                           onSubmit={handleQuerySubmit}
//                           onClear={handleClearResults}
//                           isSidebarOpen={sidebarOpen}
//                           setQueryHistory={setQueryHistory}
//                           autoRun={autoRun}
//                           setAutoRun={setAutoRun}
//                           language={selectedLanguage}
//                           isAdmin={isAdmin}
//                           hasProcessed={currentHasProcessed}
//                           setHasProcessed={setCurrentHasProcessed}
//                           role={role}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </AppContext.Provider>
//   );
// }

// export default App;



import { useState, useEffect } from "react";
import Sidebar from "./Components/Sidebar";
import MainContent from "./Components/MainContent";
import Header from "./Components/Header";
import "./i18n";
import { useTranslation } from "react-i18next";
import { AppContext } from "./Components/context/AppContext";
import background from "../public/background.webp";
import UpdatedUI from "../public/FCFS.svg";
import UpdatedUISide from "../public/FCFSUAStat-logo.svg";
import { t } from "i18next";

function App() {
  const [query, setQuery] = useState("");
  const [resultData, setResultData] = useState([]);
  const [visualizationType, setVisualizationType] = useState("Table");
  const [role, setRole] = useState("admin");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true);
  const [hasProcessed, setHasProcessed] = useState(false);

  const [queryHistory, setQueryHistory] = useState(() => {
    return JSON.parse(localStorage.getItem("queryHistory") || "[]");
  });
  const [autoRun, setAutoRun] = useState(false);

  const { i18n } = useTranslation();
  const selectedLanguage = i18n.language;

  const [viewQueries, setViewQueries] = useState({ admin: "", user: "" });
  const currentQueryForRole = viewQueries[role] || "";
  const [viewHasProcessed, setViewHasProcessed] = useState({
    admin: false,
    user: false,
  });

  const setCurrentQueryForRole = (newQueryText) => {
    setViewQueries((prev) => ({ ...prev, [role]: newQueryText }));
  };

  const handleProcessFromSidebar = (selectedQuery) => {
    setQuery(selectedQuery);
    setAutoRun(true);
  };

  const currentHasProcessed = viewHasProcessed[role] || false;
  const setCurrentHasProcessed = (processedStatus) => {
    setViewHasProcessed((prev) => ({ ...prev, [role]: processedStatus }));
  };

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("queryHistory") || "[]");
    setQueryHistory(stored);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleAdminToggle = (newMode) => {
    const newRoleForToggle = newMode ? "admin" : "user";
    setRole(newRoleForToggle);
    setIsAdmin(newMode);
  };

  const handleQuerySubmit = async () => {
    await new Promise((r) => setTimeout(r, 1500));
    setResultData([
      { Name: "Alice", Age: 28 },
      { Name: "Bob", Age: 34 },
    ]);
  };

  const handleClearResults = () => {
    if (query.trim()) {
      const updated = [...queryHistory, query.trim()];
      setQueryHistory(updated);
      localStorage.setItem("queryHistory", JSON.stringify(updated));
    }

    setCurrentQueryForRole("");
    setResultData([]);
  };

  const preventDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <AppContext.Provider value={{ role, setRole }}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        {/* <Sidebar
          isOpen={sidebarOpen}
          queryHistory={queryHistory}
          setQueryHistory={setQueryHistory}
          handleProcess={handleProcessFromSidebar}
        /> */}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <div className="sticky top-0 z-50 bg-white shadow-sm">
            <Header
              // toggleSidebar={toggleSidebar}
              isAdmin={isAdmin}
              setIsAdmin={handleAdminToggle}
              handleProcess={handleProcessFromSidebar}
            />
          </div>

          <div className="flex-1 relative">
            <section
              className={`h-[100vh] w-full flex items-center justify-center transition-all duration-300 ease-in-out ${
                sidebarOpen ? "ml-80" : "ml-0"
              }`}
              style={{
                position: "relative",
                overflow: "hidden",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
              }}
              draggable="false"
              onDragStart={preventDrag}
              onDrag={preventDrag}
              onDragEnd={preventDrag}
            >
              {/* Background Image Wrapper */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${background})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  backgroundAttachment: "fixed",
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: -1,
                  userDrag: "none",
                  WebkitUserDrag: "none",
                  pointerEvents: "none",
                }}
                draggable="false"
                onDragStart={preventDrag}
                onDrag={preventDrag}
                onDragEnd={preventDrag}
              ></div>

              {/* Overlay for better text readability */}
              <div
                className="absolute inset-0 bg-black bg-opacity-20"
                style={{ pointerEvents: "none" }}
                draggable="false"
                onDragStart={preventDrag}
                onDrag={preventDrag}
                onDragEnd={preventDrag}
              ></div>

              {/* Hero Content */}
              <div className="relative z-10 text-center text-white px-4">
                <h1 className="text-4xl md:text-6xl text-[#B57C6C] font-bold mb-4">
                  {t("ontheimagecontent")}
                </h1>
                <p className="text-xl md:text-2xl">
                  {t("ontheimagesecondcontent")}
                </p>
              </div>
            </section>

            <div
              className={`relative -mt-60 z-20 transition-all duration-300 ease-in-out ${
                sidebarOpen ? "ml-80" : "ml-0"
              }`}
              style={{ overflowY: "auto" }}
            >
              <div className="mx-auto px-6 max-w-7xl w-full">
                <div className="max-w-full mx-auto">
                  <div className="relative bg-white rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden min-h-[70vh]">
                    <div className="absolute left-0 top-8 w-14 h-40 bg-[#B57C6C] flex items-center justify-center z-10 rounded-r-lg">
                      <div className="transform -rotate-90 whitespace-nowrap">
                        <span className="text-white font-bold text-lg tracking-wider">
                          UAE STAT
                        </span>
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="ml-24">
                      {/* UAE Stat Header Section */}
                      <div className="p-8 pb-6">
                        <div className="flex items-center mb-8">
                          <div className="flex items-center space-x-4">
                            {/* UAE Icon/Chart */}
                            <div className="flex-shrink-0">
                              <img
                                src={UpdatedUI}
                                alt="Right Logo"
                                className="h-16 w-16 mt-20 object-contain"
                              />
                            </div>

                            <div className="flex flex-col justify-center items-center space-y-4">
                              <img
                                src={UpdatedUISide}
                                alt="Right Logo"
                                className="h-[80px] mt-20 w-auto object-contain"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-1 bg-[#B57C6C] to-teal-500 rounded-full mb-10"></div>
                      </div>

                      {/* Main Content Component */}
                      <div className="px-8 pb-8">
                        <MainContent
                          query={query}
                          setQuery={setQuery}
                          onSubmit={handleQuerySubmit}
                          onClear={handleClearResults}
                          isSidebarOpen={sidebarOpen}
                          setQueryHistory={setQueryHistory}
                          autoRun={autoRun}
                          setAutoRun={setAutoRun}
                          language={selectedLanguage}
                          isAdmin={isAdmin}
                          hasProcessed={currentHasProcessed}
                          setHasProcessed={setCurrentHasProcessed}
                          role={role}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;