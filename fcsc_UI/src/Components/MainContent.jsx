
import React, { useState, useEffect, useContext } from "react";
import TabsContent from "./TabsContent";
import { FiLoader } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { AppContext } from "./context/AppContext";
import { CgSpinner } from "react-icons/cg";
import ErrorBoundary from "./ErrorBoundary";

const initialRoleSpecificProcessingState = {
  isLoading: false,
  loadedTabs: [],
  activeTab: "Schema Loader",
  currentStep: "",
  queryResult: [],
  sqlQuery: "",
  suggestedVisualization: "",
  totalExecutionTime: null,
  insights: "",
  insightsLoading: false,
  decomposerJson: null,
  errorMessage: "",
  hasSuccessfulResponse: false,
};

const ACCENT_BROWN_COLOR = "#8D6E63";
const ACCENT_BROWN_HOVER_COLOR = "#795548";
const ACCENT_BROWN_DISABLED_COLOR = "#BCAAA4";
const ACCENT_BROWN_LIGHT_BG_COLOR = "#f5f0eb";
const ERROR_MESSAGE_BG_COLOR = "#fdf8f2";

const MainContent = ({
  query,
  setQuery,
  hasProcessed,
  setHasProcessed,
  setQueryHistory,
  autoRun,
  setAutoRun,
  language = "english",
}) => {
  const [queriesByRole, setQueriesByRole] = useState({
    admin: "",
    user: "",
  });

  const { role } = useContext(AppContext);
  const { t, i18n } = useTranslation();
  const selectedLanguage = i18n.language;
  const [allRolesData, setAllRolesData] = useState({
    admin: {
      ...initialRoleSpecificProcessingState,
      activeTab: "Schema Loader",
    },
    user: {
      ...initialRoleSpecificProcessingState,
      activeTab: "Visualization Agent",
    },
  });

  useEffect(() => {
    setQuery(queriesByRole[role] || "");
  }, [role, queriesByRole, setQuery]);

  useEffect(() => {
    if (autoRun && query.trim()) {
      handleProcess();
      setAutoRun(false);
    }
  }, [autoRun, query, setAutoRun, language, role]);

  const handleSetActiveTab = (tabName) => {
    const currentRole = role;
    setAllRolesData((prev) => ({
      ...prev,
      [currentRole]: { ...prev[currentRole], activeTab: tabName },
    }));
  };

  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(null);

  const toggleDropdown = (agentTabName) => {
    if (selectedTab === agentTabName && isOpen) {
      setIsOpen(false);
      setSelectedTab(null);
    } else {
      setSelectedTab(agentTabName);
      setIsOpen(true);
      if (role === 'admin') {
        handleSetActiveTab(agentTabName);
      }
    }
  };

  const handleProcess = async () => {
    setIsOpen(false);
    setSelectedTab(null);

    setAllRolesData((prev) => ({
      ...prev,
      [role]: {
        ...initialRoleSpecificProcessingState,
        isLoading: true,
        insightsLoading: true,
        activeTab: role === "user" ? "Visualization Agent" : "Schema Loader",
        errorMessage: "",
        hasSuccessfulResponse: false,
      },
    }));
    setHasProcessed(true);

    if (query.trim()) {
      const roleKey =
        role === "admin" ? "adminQueryHistory" : "userQueryHistory";
      const existingHistory = JSON.parse(localStorage.getItem(roleKey) || "[]");
      if (!existingHistory.includes(query.trim())) {
        const updatedHistory = [...existingHistory, query.trim()];
        localStorage.setItem(roleKey, JSON.stringify(updatedHistory));
        if (setQueryHistory && typeof setQueryHistory === "function") {
          setQueryHistory(updatedHistory);
        }
      }
    }

    const headers = { "Content-Type": "application/json" };
    const payload = { query: query.trim() };

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/query-process/${language}`,
        payload,
        { headers }
      );

      if (response.status === 200) {
        const {
          result_data,
          total_time_seconds,
          processing_steps,
          sql_query,
          suggested_visualization,
          decomposer_json,
          error: backendError,
        } = response.data;

        if (
          backendError &&
          backendError !== "null" &&
          String(backendError).trim() !== ""
        ) {
          setAllRolesData((prev) => ({
            ...prev,
            [role]: {
              ...prev[role],
              errorMessage: t("warning"),
              queryResult: [],
              loadedTabs: [],
              insights: "",
              sqlQuery: "",
              suggestedVisualization: "",
              totalExecutionTime: null,
              decomposerJson: null,
              isLoading: false,
              insightsLoading: false,
              currentStep: "",
              hasSuccessfulResponse: false,
            },
          }));
          return;
        }

        const newTabs = (processing_steps || []).map((step) => ({
          name: step.agent,
          executionTime: step.time_taken?.toFixed(2) || "N/A",
        }));

        setAllRolesData((prev) => ({
          ...prev,
          [role]: {
            ...prev[role],
            queryResult: result_data || [],
            totalExecutionTime: total_time_seconds ? total_time_seconds.toFixed(2) : null,
            sqlQuery: sql_query || "",
            suggestedVisualization: suggested_visualization || "",
            decomposerJson: decomposer_json || null,
            loadedTabs: newTabs,
            activeTab: role === 'admin' && newTabs.length > 0 ? newTabs[0].name : prev[role].activeTab,
            errorMessage: "",
            hasSuccessfulResponse: true,
          },
        }));

        if (result_data && result_data.length > 0) {
          try {
            const insightsResponse = await axios.get(
              `http://127.0.0.1:8000/summary-insights/${language}`
            );
            setAllRolesData((prev) => ({
              ...prev,
              [role]: {
                ...prev[role],
                insights:
                  insightsResponse.status === 200 &&
                  insightsResponse.data.summary_insights
                    ? insightsResponse.data.summary_insights
                    : t("noInsightsReturned", "⚠️ No insights returned."),
              },
            }));
          } catch (insightsErr) {
            console.error("Error fetching insights:", insightsErr);
            setAllRolesData((prev) => ({
              ...prev,
              [role]: { ...prev[role], insights: t("errorLoadingInsights", "Error loading insights.") },
            }));
          }
        } else {
          setAllRolesData((prev) => ({
            ...prev,
            [role]: { ...prev[role], insights: "" },
          }));
        }
      } else {
        console.error("Non-200 response from backend:", response.status);
        setAllRolesData((prev) => ({
          ...prev,
          [role]: {
            ...initialRoleSpecificProcessingState,
            activeTab: role === "user" ? "Visualization Agent" : "Schema Loader",
            isLoading: false,
            insightsLoading: false,
            currentStep: "",
            errorMessage: t("serverErrorWithStatus", `Server error: ${response.status}. Please try again.`, { status: response.status }),
            hasSuccessfulResponse: false,
          },
        }));
        setHasProcessed(false);
      }
    } catch (networkError) {
      console.error("Network or Axios error during query processing:", networkError);
      const status = networkError.response?.status;
      let userMessage = t("networkError.default", "A network error occurred. Please try again.");
      if (status) {
        userMessage = t("networkError.withStatus", `The server responded with an error (Status: {{status}}). Please try again.`, { status });
      }
      setAllRolesData((prev) => ({
        ...prev,
        [role]: {
          ...initialRoleSpecificProcessingState,
          activeTab: role === "user" ? "Visualization Agent" : "Schema Loader",
          isLoading: false,
          insightsLoading: false,
          currentStep: "",
          errorMessage: userMessage,
          hasSuccessfulResponse: false,
        },
      }));
      setHasProcessed(false);
    } finally {
      setAllRolesData((prev) => {
        const currentRoleState = prev[role] || initialRoleSpecificProcessingState;
        let finalActiveTabForDataContext = currentRoleState.activeTab;
        if (role === "user") {
          finalActiveTabForDataContext = "Visualization Agent";
        } else if (role === "admin" && (!currentRoleState.loadedTabs || currentRoleState.loadedTabs.length === 0)) {
          finalActiveTabForDataContext = "Schema Loader";
        }

        return {
          ...prev,
          [role]: {
            ...currentRoleState,
            isLoading: false,
            insightsLoading: false,
            currentStep: "",
            activeTab: finalActiveTabForDataContext,
          },
        };
      });
    }
  };

  return (
    <div className="w-full overflow-y-auto scrollbar-none px-2 sm:px-4 pt-2 pb-6">
      <div className="bg-slate-50 rounded-2xl shadow-xl max-w-5xl mx-auto border border-gray-200/80">
        <div style={{ backgroundColor: ACCENT_BROWN_COLOR }} className="h-2.5 rounded-t-xl"></div>
        <div className="p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: ACCENT_BROWN_COLOR }}>
              {t("title")}
            </h1>
            <p className="text-md md:text-lg text-gray-600">{t("subtitle")}</p>
          </div>
          <div className="w-full px-0 md:px-4 mt-8 mb-6">
            <textarea
              className="w-full p-4 bg-[F8F9FA] text-gray-800 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 transition-all duration-200"
              style={{'--tw-ring-color': ACCENT_BROWN_COLOR, borderColor: allRolesData[role]?.errorMessage ? 'red' : undefined }}
              value={query}
              onChange={(e) => {
                const newQuery = e.target.value;
                setQuery(newQuery);
                setQueriesByRole((prev) => ({ ...prev, [role]: newQuery }));
                if (allRolesData[role]?.errorMessage) {
                  setAllRolesData(prev => ({...prev, [role]: {...prev[role], errorMessage: ""}}));
                }
              }}
              placeholder={t("placeholder")}
              rows={4}
            />
          </div>
          <div className="w-full px-0 md:px-4 mb-8 flex items-center justify-between">
            <div className="min-h-[2rem] text-left flex items-center">
              {allRolesData[role]?.isLoading ? (
                allRolesData[role]?.currentStep ? (
                  <div className="flex items-center gap-2.5 text-sm" style={{color: ACCENT_BROWN_COLOR}}>
                    <FiLoader className="animate-spin text-lg" />
                    <span>{allRolesData[role]?.currentStep} ({t("loading")}...)</span>
                  </div>
                ) : (
                  <div className="font-semibold flex items-center gap-2 text-lg" style={{color: ACCENT_BROWN_COLOR}}>
                    {t("fetching")}...
                    <CgSpinner className="animate-spin text-xl" />
                  </div>
                )
              ) : allRolesData[role]?.errorMessage ? (
                <div
                  className="px-3 py-1.5 rounded-md font-medium text-lg shadow-sm inline-block"
                  style={{ color: ACCENT_BROWN_COLOR, backgroundColor: ERROR_MESSAGE_BG_COLOR, border: `1px solid ${ACCENT_BROWN_COLOR}20` }}
                >
                  {allRolesData[role]?.errorMessage}
                </div>
              ) : role === "admin" && hasProcessed && allRolesData[role]?.totalExecutionTime ? (
                <p className="text-lg" style={{ color: ACCENT_BROWN_COLOR }}>
                  {t("executionTime")}: {allRolesData[role]?.totalExecutionTime} sec
                </p>
              ) : null }
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleProcess}
                disabled={allRolesData[role]?.isLoading || query.trim() === ""}
                style={{
                  backgroundColor: (allRolesData[role]?.isLoading || query.trim() === "") ? ACCENT_BROWN_DISABLED_COLOR : ACCENT_BROWN_COLOR,
                }}
                className={`px-6 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-px`}
                onMouseOver={(e) => { if (!(allRolesData[role]?.isLoading || query.trim() === "")) e.currentTarget.style.backgroundColor = ACCENT_BROWN_HOVER_COLOR; }}
                onMouseOut={(e) => { if (!(allRolesData[role]?.isLoading || query.trim() === "")) e.currentTarget.style.backgroundColor = ACCENT_BROWN_COLOR; }}
              >
                {allRolesData[role]?.isLoading ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                  </svg>
                )}
                {allRolesData[role]?.isLoading ? t("processing") : t("processButton")}
              </button>
              <button
                onClick={() => {
                  setQuery("");
                  setQueriesByRole(prev => ({...prev, [role]: ""}));
                  setIsOpen(false);
                  setSelectedTab(null);
                  setAllRolesData((prev) => ({
                    ...prev,
                    [role]: {
                      ...initialRoleSpecificProcessingState,
                      activeTab: role === "user" ? "Visualization Agent" : "Schema Loader",
                    },
                  }));
                  setHasProcessed(false);
                }}
                style={{ borderColor: ACCENT_BROWN_COLOR, color: ACCENT_BROWN_COLOR }}
                className="px-6 py-2.5 border-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-px"
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = ACCENT_BROWN_LIGHT_BG_COLOR }
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {t("clearButton")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        {hasProcessed && (
          <div className="mt-8 px-6 md:px-8 pb-6 md:pb-8">
            <ErrorBoundary>
            <TabsContent
              adminDropdownActiveTab={selectedTab}
              isAdminDropdownOpen={isOpen}
              toggleAdminDropdown={toggleDropdown}
              sqlQuery={allRolesData[role]?.sqlQuery}
              language={selectedLanguage}
              suggestedVisualization={allRolesData[role]?.suggestedVisualization}
              queryResult={allRolesData[role]?.queryResult || []}
              insights={allRolesData[role]?.insights}
              insightsLoading={allRolesData[role]?.insightsLoading}
              rows={(allRolesData[role]?.queryResult || []).length}
              columns={allRolesData[role]?.queryResult?.[0] ? Object.keys(allRolesData[role].queryResult[0]).length : 0}
              hasProcessed={hasProcessed}
              hasSuccessfulResponse={allRolesData[role]?.hasSuccessfulResponse}
              decomposerJson={allRolesData[role]?.decomposerJson}
            />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;