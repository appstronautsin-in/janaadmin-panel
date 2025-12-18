import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Alert from '../components/Alert';
import DashboardHeader from '../components/DashboardHeader';
import { TimeFormatProvider } from '../contexts/TimeFormatContext';
import Sidebar from '../components/Sidebar';
import AddCategory from '../components/AddCategory';
import ManageCategory from '../components/ManageCategory';
import AddSubCategory from '../components/AddSubCategory';
import ManageSubCategory from '../components/ManageSubCategory';
import ManageUsers from '../components/ManageUsers';
import AddUser from '../components/AddUser';
import CreateNews from '../components/CreateNews';
import ManageNews from '../components/ManageNews';
import ManageComments from '../components/ManageComments';
import AddENews from '../components/AddENews';
import ManageENews from '../components/ManageENews';
import AddSubscriptionPlan from '../components/AddSubscriptionPlan';
import ManageSubscriptionPlans from '../components/ManageSubscriptionPlans';
import ManageSubscriptionLogs from '../components/ManageSubscriptionLogs';
import ManageTransactions from '../components/ManageTransactions';
import ManageCustomers from '../components/ManageCustomers';
import CreateCustomer from '../components/CreateCustomer';
import DashboardContent from '../components/DashboardContent';
import CreateAds from '../components/CreateAds';
import ManageAds from '../components/ManageAds';
import ManageActivity from '../components/ManageActivity';
import ViewsAnalytics from '../components/ViewsAnalytics';
import CreateClassifiedAd from '../components/CreateClassifiedAd';
import ManageClassifiedAds from '../components/ManageClassifiedAds';
import CreateBreakingNews from '../components/CreateBreakingNews';
import ManageBreakingNews from '../components/ManageBreakingNews';
import CreateDamInformation from '../components/CreateDamInformation';
import ManageDamInformation from '../components/ManageDamInformation';
import CreatePolling from '../components/CreatePolling';
import ManagePolling from '../components/ManagePolling';
import CreateThought from '../components/CreateThought';
import ManageThoughts from '../components/ManageThoughts';
import CreateFifty from '../components/CreateFifty';
import ManageFifty from '../components/ManageFifty';
import CreateJustIn from '../components/CreateJustIn';
import ManageJustIn from '../components/ManageJustIn';
import AlignNews from '../components/AlignNews';
import ManagePromotions from '../components/ManagePromotions';
import CreateDoYouKnow from '../components/CreateDoYouKnow';
import ManageDoYouKnow from '../components/ManageDoYouKnow';
import EditDoYouKnow from '../components/EditDoYouKnow';
import ViewDoYouKnow from '../components/ViewDoYouKnow';
import CreateEvent from '../components/CreateEvent';
import ManageEvents from '../components/ManageEvents';
import EditEvent from '../components/EditEvent';
import ViewEvent from '../components/ViewEvent';
import ManageSubmittedNews from '../components/ManageSubmittedNews';
import ManageSubmittedEvents from '../components/ManageSubmittedEvents';
import ManageSubmittedObituary from '../components/ManageSubmittedObituary';
import GenerateClassified from '../components/GenerateClassified';
import ManageSessionLogs from '../components/ManageSessionLogs';
import SystemSettings from '../components/SystemSettings';
import ManageAlbums from '../components/ManageAlbums';
import ManageKeywords from '../components/ManageKeywords';
import Footer from '../components/Footer';
import { sessionManager } from '../utils/sessionManager';

interface AlertState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [newsExpanded, setNewsExpanded] = useState(false);
  const [categoryExpanded, setCategoryExpanded] = useState(false);
  const [usersExpanded, setUsersExpanded] = useState(false);
  const [subscriptionExpanded, setSubscriptionExpanded] = useState(false);
  const [eNewsExpanded, setENewsExpanded] = useState(false);
  const [customersExpanded, setCustomersExpanded] = useState(false);
  const [adsExpanded, setAdsExpanded] = useState(false);
  const [classifiedAdsExpanded, setClassifiedAdsExpanded] = useState(false);
  const [breakingNewsExpanded, setBreakingNewsExpanded] = useState(false);
  const [damInformationExpanded, setDamInformationExpanded] = useState(false);
  const [pollingExpanded, setPollingExpanded] = useState(false);
  const [thoughtsExpanded, setThoughtsExpanded] = useState(false);
  const [fiftyExpanded, setFiftyExpanded] = useState(false);
  const [justInExpanded, setJustInExpanded] = useState(false);
  const [doYouKnowExpanded, setDoYouKnowExpanded] = useState(false);
  const [eventsExpanded, setEventsExpanded] = useState(false);
  const [logsExpanded, setLogsExpanded] = useState(false);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedDoYouKnow, setSelectedDoYouKnow] = useState<any>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    message: '',
    type: 'success'
  });

  const handleLogout = async () => {
    try {
      await sessionManager.endSession('manual');
    } catch (error) {
      console.error('Error ending session:', error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    sessionManager.clearSession();

    navigate('/');
  };

  const showAlertMessage = (message: string, type: 'success' | 'error') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleShowView = (view: string) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardContent />;

      case 'manageActivity':
        return (
          <ManageActivity
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'viewsAnalytics':
        return (
          <ViewsAnalytics
            showAlert={showAlertMessage}
          />
        );

      case 'createNews':
        return (
          <CreateNews
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageNews':
        return (
          <ManageNews
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageComments':
        return (
          <ManageComments
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'createBreakingNews':
        return (
          <CreateBreakingNews
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageBreakingNews':
        return (
          <ManageBreakingNews
            showAlert={showAlertMessage}
          />
        );

      case 'createDamInformation':
        return (
          <CreateDamInformation
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageDamInformation':
        return (
          <ManageDamInformation
            showAlert={showAlertMessage}
          />
        );

      case 'createPolling':
        return (
          <CreatePolling
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'managePolling':
        return (
          <ManagePolling
            showAlert={showAlertMessage}
          />
        );

      case 'createThought':
        return (
          <CreateThought
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageThoughts':
        return (
          <ManageThoughts
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'addENews':
        return (
          <AddENews
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageENews':
        return (
          <ManageENews
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'addCategory':
        return (
          <AddCategory
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageCategory':
        return (
          <ManageCategory
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'addSubCategory':
        return (
          <AddSubCategory
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageSubCategory':
        return (
          <ManageSubCategory
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'addUser':
        return (
          <AddUser
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageUsers':
        return (
          <ManageUsers
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'createCustomer':
        return (
          <CreateCustomer
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageCustomers':
        return (
          <ManageCustomers
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'addSubscriptionPlan':
        return (
          <AddSubscriptionPlan
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageSubscriptionPlans':
        return (
          <ManageSubscriptionPlans
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageSubscriptionLogs':
        return (
          <ManageSubscriptionLogs
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageTransactions':
        return (
          <ManageTransactions
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'createAds':
        return (
          <CreateAds
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageAds':
        return (
          <ManageAds
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'createClassifiedAd':
        return (
          <CreateClassifiedAd
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageClassifiedAds':
        return (
          <ManageClassifiedAds
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'createFifty':
        return (
          <CreateFifty
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageFifty':
        return (
          <ManageFifty
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'createJustIn':
        return (
          <CreateJustIn
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'manageJustIn':
        return (
          <ManageJustIn
            showAlert={showAlertMessage}
          />
        );

      case 'managePromotions':
        return (
          <ManagePromotions
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      case 'createDoYouKnow':
        return (
          <CreateDoYouKnow
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
            onSuccess={() => handleShowView('manageDoYouKnow')}
          />
        );

      case 'manageDoYouKnow':
        return (
          <ManageDoYouKnow
            onView={(doYouKnow) => {
              setSelectedDoYouKnow(doYouKnow);
              handleShowView('viewDoYouKnow');
            }}
            onEdit={(doYouKnow) => {
              setSelectedDoYouKnow(doYouKnow);
              handleShowView('editDoYouKnow');
            }}
            showAlert={showAlertMessage}
          />
        );

      case 'editDoYouKnow':
        return selectedDoYouKnow ? (
          <EditDoYouKnow
            doYouKnow={selectedDoYouKnow}
            onClose={() => handleShowView('manageDoYouKnow')}
            showAlert={showAlertMessage}
            onSuccess={() => handleShowView('manageDoYouKnow')}
          />
        ) : null;

      case 'viewDoYouKnow':
        return selectedDoYouKnow ? (
          <ViewDoYouKnow
            doYouKnow={selectedDoYouKnow}
            onClose={() => handleShowView('manageDoYouKnow')}
          />
        ) : null;

      case 'createEvent':
        return (
          <CreateEvent
            showAlert={showAlertMessage}
          />
        );

      case 'manageEvents':
        return (
          <ManageEvents
            onViewEvent={(id) => {
              setSelectedEventId(id);
              handleShowView('viewEvent');
            }}
            onEditEvent={(id) => {
              setSelectedEventId(id);
              handleShowView('editEvent');
            }}
            showAlert={showAlertMessage}
          />
        );

      case 'editEvent':
        return selectedEventId ? (
          <EditEvent
            eventId={selectedEventId}
            onClose={() => handleShowView('manageEvents')}
            showAlert={showAlertMessage}
          />
        ) : null;

      case 'viewEvent':
        return selectedEventId ? (
          <ViewEvent
            eventId={selectedEventId}
            onClose={() => handleShowView('manageEvents')}
            showAlert={showAlertMessage}
          />
        ) : null;

      case 'manageSubmittedEvents':
        return (
          <ManageSubmittedEvents
            showAlert={showAlertMessage}
          />
        );

      case 'alignNews':
        return <AlignNews />;

      case 'manageSubmittedNews':
        return (
          <ManageSubmittedNews
            showAlert={showAlertMessage}
          />
        );

      case 'manageSubmittedObituary':
        return (
          <ManageSubmittedObituary
            showAlert={showAlertMessage}
          />
        );

      case 'generateClassified':
        return <GenerateClassified />;

      case 'manageSessionLogs':
        return (
          <ManageSessionLogs
            showAlert={showAlertMessage}
          />
        );
      case 'systemSettings':
        return (
          <SystemSettings
            showAlert={showAlertMessage}
          />
        );

      case 'manageKeywords':
        return (
          <ManageKeywords
            showAlert={showAlertMessage}
          />
        );

      case 'manageAlbums':
        return (
          <ManageAlbums
            onClose={() => handleShowView('dashboard')}
            showAlert={showAlertMessage}
          />
        );

      default:
        return <DashboardContent />;
    }
  };

  return (
    <TimeFormatProvider>
      <div className="flex h-screen bg-gray-100">
        {alert.show && (
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(prev => ({ ...prev, show: false }))}
          />
        )}

        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white border border-black rounded-md"
        >
          <Menu className="h-6 w-6" />
        </button>

      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed lg:static inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 lg:z-0`}
      >
        <Sidebar
          newsExpanded={newsExpanded}
          setNewsExpanded={setNewsExpanded}
          categoryExpanded={categoryExpanded}
          setCategoryExpanded={setCategoryExpanded}
          usersExpanded={usersExpanded}
          setUsersExpanded={setUsersExpanded}
          subscriptionExpanded={subscriptionExpanded}
          setSubscriptionExpanded={setSubscriptionExpanded}
          eNewsExpanded={eNewsExpanded}
          setENewsExpanded={setENewsExpanded}
          customersExpanded={customersExpanded}
          setCustomersExpanded={setCustomersExpanded}
          adsExpanded={adsExpanded}
          setAdsExpanded={setAdsExpanded}
          classifiedAdsExpanded={classifiedAdsExpanded}
          setClassifiedAdsExpanded={setClassifiedAdsExpanded}
          breakingNewsExpanded={breakingNewsExpanded}
          setBreakingNewsExpanded={setBreakingNewsExpanded}
          damInformationExpanded={damInformationExpanded}
          setDamInformationExpanded={setDamInformationExpanded}
          pollingExpanded={pollingExpanded}
          setPollingExpanded={setPollingExpanded}
          thoughtsExpanded={thoughtsExpanded}
          setThoughtsExpanded={setThoughtsExpanded}
          fiftyExpanded={fiftyExpanded}
          setFiftyExpanded={setFiftyExpanded}
          justInExpanded={justInExpanded}
          setJustInExpanded={setJustInExpanded}
          doYouKnowExpanded={doYouKnowExpanded}
          setDoYouKnowExpanded={setDoYouKnowExpanded}
          eventsExpanded={eventsExpanded}
          setEventsExpanded={setEventsExpanded}
          logsExpanded={logsExpanded}
          setLogsExpanded={setLogsExpanded}
          onShowAddCategory={() => handleShowView('addCategory')}
          onShowManageCategory={() => handleShowView('manageCategory')}
          onShowAddSubCategory={() => handleShowView('addSubCategory')}
          onShowManageSubCategory={() => handleShowView('manageSubCategory')}
          onShowAddUser={() => handleShowView('addUser')}
          onShowManageUsers={() => handleShowView('manageUsers')}
          onShowCreateNews={() => handleShowView('createNews')}
          onShowManageNews={() => handleShowView('manageNews')}
          onShowCreateBreakingNews={() => handleShowView('createBreakingNews')}
          onShowManageBreakingNews={() => handleShowView('manageBreakingNews')}
          onShowCreateDamInformation={() => handleShowView('createDamInformation')}
          onShowManageDamInformation={() => handleShowView('manageDamInformation')}
          onShowCreatePolling={() => handleShowView('createPolling')}
          onShowManagePolling={() => handleShowView('managePolling')}
          onShowCreateThought={() => handleShowView('createThought')}
          onShowManageThoughts={() => handleShowView('manageThoughts')}
          onShowCreateFifty={() => handleShowView('createFifty')}
          onShowManageFifty={() => handleShowView('manageFifty')}
          onShowAddENews={() => handleShowView('addENews')}
          onShowManageENews={() => handleShowView('manageENews')}
          onShowAddSubscriptionPlan={() => handleShowView('addSubscriptionPlan')}
          onShowManageSubscriptionPlans={() => handleShowView('manageSubscriptionPlans')}
          onShowManageSubscriptionLogs={() => handleShowView('manageSubscriptionLogs')}
          onShowManageTransactions={() => handleShowView('manageTransactions')}
          onShowCreateCustomer={() => handleShowView('createCustomer')}
          onShowManageCustomers={() => handleShowView('manageCustomers')}
          onShowCreateAds={() => handleShowView('createAds')}
          onShowManageAds={() => handleShowView('manageAds')}
          onShowCreateClassifiedAd={() => handleShowView('createClassifiedAd')}
          onShowManageClassifiedAds={() => handleShowView('manageClassifiedAds')}
          onShowCreateJustIn={() => handleShowView('createJustIn')}
          onShowManageJustIn={() => handleShowView('manageJustIn')}
          onShowManageActivity={() => handleShowView('manageActivity')}
          onShowViewsAnalytics={() => handleShowView('viewsAnalytics')}
          onShowAlignNews={() => handleShowView('alignNews')}
          onShowManagePromotions={() => handleShowView('managePromotions')}
          onShowCreateDoYouKnow={() => handleShowView('createDoYouKnow')}
          onShowManageDoYouKnow={() => handleShowView('manageDoYouKnow')}
          onShowCreateEvent={() => handleShowView('createEvent')}
          onShowManageEvents={() => handleShowView('manageEvents')}
          onShowManageSubmittedEvents={() => handleShowView('manageSubmittedEvents')}
          onShowManageSubmittedNews={() => handleShowView('manageSubmittedNews')}
          onShowGenerateClassified={() => handleShowView('generateClassified')}
          onShowManageSessionLogs={() => handleShowView('manageSessionLogs')}
          onShowSystemSettings={() => handleShowView('systemSettings')}
          onShowManageComments={() => handleShowView('manageComments')}
          onShowManageAlbums={() => handleShowView('manageAlbums')}
          onShowManageSubmittedObituary={() => handleShowView('manageSubmittedObituary')}
          onShowManageKeywords={() => handleShowView('manageKeywords')}
          onShowDashboard={() => handleShowView('dashboard')}
          onLogout={handleLogout}
        />
      </div>

        <div className="flex-1 overflow-auto lg:ml-0 flex flex-col">
          <DashboardHeader />
          <div className="flex-1 overflow-auto">
            <div className="p-4 lg:p-8">
              {renderContent()}
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </TimeFormatProvider>
  );
};

export default Dashboard;