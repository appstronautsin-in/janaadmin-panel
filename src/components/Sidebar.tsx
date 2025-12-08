import React from 'react';
import { LogOut, Home, Newspaper, FolderTree, Users, CreditCard, ChevronDown, ChevronRight, FileText, UserCircle, ImagePlus, UserPlus, Activity, AlertTriangle, Database, BarChart3, Receipt, DollarSign, Lightbulb, FileBarChart, ArrowUpDown, Gift, HelpCircle, Eye, Calendar, Send, FileImage, Shield, Settings, MessageSquare, FolderOpen } from 'lucide-react';
import { usePermissions } from '../middleware/PermissionsMiddleware';
import { logActivity, ActivityActions, ActivitySections } from '../utils/activityLogger';

interface SidebarProps {
  newsExpanded: boolean;
  setNewsExpanded: (expanded: boolean) => void;
  categoryExpanded: boolean;
  setCategoryExpanded: (expanded: boolean) => void;
  usersExpanded: boolean;
  setUsersExpanded: (expanded: boolean) => void;
  subscriptionExpanded: boolean;
  setSubscriptionExpanded: (expanded: boolean) => void;
  eNewsExpanded: boolean;
  setENewsExpanded: (expanded: boolean) => void;
  customersExpanded: boolean;
  setCustomersExpanded: (expanded: boolean) => void;
  adsExpanded: boolean;
  setAdsExpanded: (expanded: boolean) => void;
  classifiedAdsExpanded: boolean;
  setClassifiedAdsExpanded: (expanded: boolean) => void;
  breakingNewsExpanded: boolean;
  setBreakingNewsExpanded: (expanded: boolean) => void;
  damInformationExpanded: boolean;
  setDamInformationExpanded: (expanded: boolean) => void;
  pollingExpanded: boolean;
  setPollingExpanded: (expanded: boolean) => void;
  thoughtsExpanded: boolean;
  setThoughtsExpanded: (expanded: boolean) => void;
  fiftyExpanded: boolean;
  setFiftyExpanded: (expanded: boolean) => void;
  logsExpanded: boolean;
  setLogsExpanded: (expanded: boolean) => void;
  justInExpanded: boolean;
  setJustInExpanded: (expanded: boolean) => void;
  doYouKnowExpanded: boolean;
  setDoYouKnowExpanded: (expanded: boolean) => void;
  eventsExpanded: boolean;
  setEventsExpanded: (expanded: boolean) => void;
  onShowDashboard: () => void;
  onShowAddCategory: () => void;
  onShowManageCategory: () => void;
  onShowAddSubCategory: () => void;
  onShowManageSubCategory: () => void;
  onShowAddUser: () => void;
  onShowManageUsers: () => void;
  onShowCreateNews: () => void;
  onShowManageNews: () => void;
  onShowAddENews: () => void;
  onShowManageENews: () => void;
  onShowAddSubscriptionPlan: () => void;
  onShowManageSubscriptionPlans: () => void;
  onShowManageSubscriptionLogs: () => void;
  onShowManageTransactions: () => void;
  onShowManageCustomers: () => void;
  onShowCreateCustomer: () => void;
  onShowCreateAds: () => void;
  onShowManageAds: () => void;
  onShowCreateClassifiedAd: () => void;
  onShowManageClassifiedAds: () => void;
  onShowCreateBreakingNews: () => void;
  onShowManageBreakingNews: () => void;
  onShowCreateDamInformation: () => void;
  onShowManageDamInformation: () => void;
  onShowCreatePolling: () => void;
  onShowManagePolling: () => void;
  onShowCreateThought: () => void;
  onShowManageThoughts: () => void;
  onShowCreateFifty: () => void;
  onShowManageFifty: () => void;
  onShowCreateJustIn: () => void;
  onShowManageJustIn: () => void;
  onShowManageActivity: () => void;
  onShowAlignNews: () => void;
  onShowManagePromotions: () => void;
  onShowCreateDoYouKnow: () => void;
  onShowManageDoYouKnow: () => void;
  onShowCreateEvent: () => void;
  onShowManageEvents: () => void;
  onShowViewsAnalytics: () => void;
  onShowManageSubmittedNews: () => void;
  onShowGenerateClassified: () => void;
  onShowManageSessionLogs: () => void;
  onShowSystemSettings: () => void;
  onShowManageComments: () => void;
  onShowManageAlbums: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  newsExpanded,
  setNewsExpanded,
  categoryExpanded,
  setCategoryExpanded,
  usersExpanded,
  setUsersExpanded,
  subscriptionExpanded,
  setSubscriptionExpanded,
  eNewsExpanded,
  setENewsExpanded,
  customersExpanded,
  setCustomersExpanded,
  adsExpanded,
  setAdsExpanded,
  classifiedAdsExpanded,
  setClassifiedAdsExpanded,
  breakingNewsExpanded,
  setBreakingNewsExpanded,
  damInformationExpanded,
  setDamInformationExpanded,
  pollingExpanded,
  setPollingExpanded,
  thoughtsExpanded,
  setThoughtsExpanded,
  fiftyExpanded,
  setFiftyExpanded,
  logsExpanded,
  setLogsExpanded,
  justInExpanded,
  setJustInExpanded,
  doYouKnowExpanded,
  setDoYouKnowExpanded,
  eventsExpanded,
  setEventsExpanded,
  onShowDashboard,
  onShowAddCategory,
  onShowManageCategory,
  onShowAddSubCategory,
  onShowManageSubCategory,
  onShowAddUser,
  onShowManageUsers,
  onShowCreateNews,
  onShowManageNews,
  onShowAddENews,
  onShowManageENews,
  onShowAddSubscriptionPlan,
  onShowManageSubscriptionPlans,
  onShowManageSubscriptionLogs,
  onShowManageTransactions,
  onShowCreateCustomer,
  onShowManageCustomers,
  onShowCreateAds,
  onShowManageAds,
  onShowCreateClassifiedAd,
  onShowManageClassifiedAds,
  onShowCreateBreakingNews,
  onShowManageBreakingNews,
  onShowCreateDamInformation,
  onShowManageDamInformation,
  onShowCreatePolling,
  onShowManagePolling,
  onShowCreateThought,
  onShowManageThoughts,
  onShowCreateFifty,
  onShowManageFifty,
  onShowCreateJustIn,
  onShowManageJustIn,
  onShowManageActivity,
  onShowAlignNews,
  onShowManagePromotions,
  onShowCreateDoYouKnow,
  onShowManageDoYouKnow,
  onShowCreateEvent,
  onShowManageEvents,
  onShowViewsAnalytics,
  onShowManageSubmittedNews,
  onShowGenerateClassified,
  onShowManageSessionLogs,
  onShowSystemSettings,
  onShowManageComments,
  onShowManageAlbums,
  onLogout
}) => {
  const { loading, checkPermission } = usePermissions();

  // Check permissions for each module
  const canCreateNews = checkPermission('createNews');
  const canEditNews = checkPermission('editNews');
  const canDeleteNews = checkPermission('deleteNews');
  const canCreateENews = checkPermission('createENews');
  const canEditENews = checkPermission('editENews');
  const canDeleteENews = checkPermission('deleteENews');
  const canCreateCategory = checkPermission('createCategory');
  const canEditCategory = checkPermission('editCategory');
  const canDeleteCategory = checkPermission('deleteCategory');
  const canCreateSubCategory = checkPermission('createSubCategory');
  const canEditSubCategory = checkPermission('editSubCategory');
  const canDeleteSubCategory = checkPermission('deleteSubCategory');
  const canAddUser = checkPermission('addUser');
  const canEditUser = checkPermission('editUser');
  const canDeleteUser = checkPermission('deleteUser');
  const canCreateSubscription = checkPermission('createSubscription');
  const canEditSubscription = checkPermission('editSubscription');
  const canDeleteSubscription = checkPermission('deleteSubscription');
  const canCreateAds = checkPermission('createAds');
  const canEditAds = checkPermission('editAds');
  const canDeleteAds = checkPermission('deleteAds');
  const canCreateClassifiedAds = checkPermission('createClassifiedAds');
  const canEditClassifiedAds = checkPermission('editClassifiedAds');
  const canDeleteClassifiedAds = checkPermission('deleteClassifiedAds');
  const canCreateBreakingNews = checkPermission('createBreakingNews');
  const canEditBreakingNews = checkPermission('editBreakingNews');
  const canDeleteBreakingNews = checkPermission('deleteBreakingNews');
  const canCreateDamInformation = checkPermission('createDamInformation');
  const canEditDamInformation = checkPermission('editDamInformation');
  const canDeleteDamInformation = checkPermission('deleteDamInformation');
  const canCreatePolling = checkPermission('createPolling');
  const canEditPolling = checkPermission('editPolling');
  const canDeletePolling = checkPermission('deletePolling');
  const canCreateThought = checkPermission('createThought');
  const canEditThought = checkPermission('editThought');
  const canDeleteThought = checkPermission('deleteThought');
  const canCreateFifty = checkPermission('createFifty');
  const canEditFifty = checkPermission('editFifty');
  const canDeleteFifty = checkPermission('deleteFifty');
  const canCreateJustIn = checkPermission('createJustIn');
  const canEditJustIn = checkPermission('editJustIn');
  const canDeleteJustIn = checkPermission('deleteJustIn');
  const canCreatePromotion = checkPermission('createPromotion');
  const canEditPromotion = checkPermission('editPromotion');
  const canDeletePromotion = checkPermission('deletePromotion');
  const canCreateDoYouKnow = checkPermission('createDoYouKnow');
  const canEditDoYouKnow = checkPermission('editDoYouKnow');
  const canDeleteDoYouKnow = checkPermission('deleteDoYouKnow');
  const canCreateEvent = checkPermission('createEvent');
  const canEditEvent = checkPermission('editEvent');
  const canDeleteEvent = checkPermission('deleteEvent');
  const canViewActivity = checkPermission('viewActivity');
  const canViewViews = checkPermission('viewViews');

  // Customer permissions
  const canCreateCustomer = checkPermission('createCustomer');
  const canEditCustomer = checkPermission('editCustomer');
  const canDeleteCustomer = checkPermission('deleteCustomer');

  // Check if user has any permissions for each module
  const hasNewsPermissions = canCreateNews;
  const hasENewsPermissions = canCreateENews;
  const hasCategoryPermissions = canCreateCategory || canCreateSubCategory;
  const hasUserPermissions = canAddUser;
  const hasSubscriptionPermissions = canCreateSubscription || canEditSubscription || canDeleteSubscription;
  const hasAdsPermissions = canCreateAds || canEditAds || canDeleteAds;
  const hasCustomerPermissions = canCreateCustomer || canEditCustomer || canDeleteCustomer;
  const hasClassifiedAdsPermissions = canCreateClassifiedAds || canEditClassifiedAds || canDeleteClassifiedAds;
  const hasBreakingNewsPermissions = canCreateBreakingNews || canEditBreakingNews || canDeleteBreakingNews;
  const hasDamInformationPermissions = canCreateDamInformation || canEditDamInformation || canDeleteDamInformation;
  const hasPollingPermissions = canCreatePolling || canEditPolling || canDeletePolling;
  const hasThoughtsPermissions = canCreateThought || canEditThought || canDeleteThought;
  const hasFiftyPermissions = canCreateFifty || canEditFifty || canDeleteFifty;
  const hasJustInPermissions = canCreateJustIn || canEditJustIn || canDeleteJustIn;
  const hasPromotionPermissions = canCreatePromotion || canEditPromotion || canDeletePromotion;
  const hasDoYouKnowPermissions = canCreateDoYouKnow || canEditDoYouKnow || canDeleteDoYouKnow;
  const hasEventsPermissions = canCreateEvent || canEditEvent || canDeleteEvent || true;

  // Check if user has all three permissions for subscription logs and transactions
  const hasFullSubscriptionAccess = canCreateSubscription && canEditSubscription && canDeleteSubscription;

  // Check if user has ALL permissions (for Session Logs access)
  const hasAllPermissions = canCreateNews && canEditNews && canDeleteNews &&
    canCreateENews && canEditENews && canDeleteENews &&
    canCreateCategory && canEditCategory && canDeleteCategory &&
    canCreateSubCategory && canEditSubCategory && canDeleteSubCategory &&
    canAddUser && canEditUser && canDeleteUser &&
    canCreateSubscription && canEditSubscription && canDeleteSubscription &&
    canCreateAds && canEditAds && canDeleteAds &&
    canCreateCustomer && canEditCustomer && canDeleteCustomer &&
    canCreateClassifiedAds && canEditClassifiedAds && canDeleteClassifiedAds &&
    canCreateBreakingNews && canEditBreakingNews && canDeleteBreakingNews &&
    canCreateDamInformation && canEditDamInformation && canDeleteDamInformation &&
    canCreatePolling && canEditPolling && canDeletePolling &&
    canCreateThought && canEditThought && canDeleteThought &&
    canCreateFifty && canEditFifty && canDeleteFifty &&
    canCreateJustIn && canEditJustIn && canDeleteJustIn &&
    canCreatePromotion && canEditPromotion && canDeletePromotion &&
    canCreateDoYouKnow && canEditDoYouKnow && canDeleteDoYouKnow &&
    canCreateEvent && canEditEvent && canDeleteEvent &&
    canViewActivity && canViewViews;

  // Helper function to log navigation activity
  const handleNavigation = (action: () => void, section: string, description: string) => {
    logActivity(ActivityActions.NAVIGATE, section, description);
    action();
  };

  if (loading) {
    return (
      <div className="w-64 h-full bg-white border-r border-black flex flex-col items-center justify-center">
        <div className="animate-spin">
          <div className="h-8 w-8 border-4 border-black border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 h-full bg-white border-r border-black flex flex-col">
      <div className="p-4 border-b border-black">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-12 w-auto"
        />
      </div>
      
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <div className="space-y-1">
          {/* Dashboard - Always first */}
          <button
            onClick={() => handleNavigation(onShowDashboard, ActivitySections.DASHBOARD, 'Navigated to Dashboard')}
            className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
          >
            <Home className="h-5 w-5 mr-3" />
            <span className="flex-1 text-left">Dashboard</span>
          </button>

          {/* Activity */}
          {canViewActivity && (
            <button
              onClick={() => handleNavigation(onShowManageActivity, ActivitySections.ACTIVITY, 'Accessed Activity Logs')}
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
            >
              <Activity className="h-5 w-5 mr-3" />
              <span className="flex-1 text-left">Activity</span>
            </button>
          )}

          {/* Albums - Only for users with Create News permission or ALL permissions */}
          {(canCreateNews || hasAllPermissions) && (
            <button
              onClick={() => handleNavigation(onShowManageAlbums, ActivitySections.ALBUMS, 'Accessed Albums')}
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
            >
              <FolderOpen className="h-5 w-5 mr-3" />
              <span className="flex-1 text-left">Albums</span>
            </button>
          )}

          {/* Ads */}
          {hasAdsPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setAdsExpanded(!adsExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <ImagePlus className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Ads</span>
                {adsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {adsExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreateAds && (
                    <button
                      onClick={() => handleNavigation(onShowCreateAds, ActivitySections.ADS, 'Navigated to Create Ads')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create Ads
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageAds, ActivitySections.ADS, 'Navigated to Manage Ads')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage Ads
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Align News */}
          {hasNewsPermissions && (
            <button
              onClick={() => handleNavigation(onShowAlignNews, ActivitySections.ALIGN_NEWS, 'Accessed Align News')}
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
            >
              <ArrowUpDown className="h-5 w-5 mr-3" />
              <span className="flex-1 text-left">Align News</span>
            </button>
          )}
 {hasDoYouKnowPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setDoYouKnowExpanded(!doYouKnowExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <HelpCircle className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Arivina Anglala</span>
                {doYouKnowExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {doYouKnowExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreateDoYouKnow && (
                    <button
                      onClick={() => handleNavigation(onShowCreateDoYouKnow, ActivitySections.DO_YOU_KNOW, 'Navigated to Create Do You Know')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create Arivina Anglala
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageDoYouKnow, ActivitySections.DO_YOU_KNOW, 'Navigated to Manage Do You Know')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage Arivina Anglala
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Breaking News */}
          {hasBreakingNewsPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setBreakingNewsExpanded(!breakingNewsExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <AlertTriangle className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Breaking News</span>
                {breakingNewsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {breakingNewsExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreateBreakingNews && (
                    <button
                      onClick={() => handleNavigation(onShowCreateBreakingNews, ActivitySections.BREAKING_NEWS, 'Navigated to Create Breaking News')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create Breaking News
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageBreakingNews, ActivitySections.BREAKING_NEWS, 'Navigated to Manage Breaking News')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage Breaking News
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Category */}
          {hasCategoryPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setCategoryExpanded(!categoryExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <FolderTree className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Category</span>
                {categoryExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {categoryExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreateCategory && (
                    <button
                      onClick={() => handleNavigation(onShowAddCategory, ActivitySections.CATEGORY, 'Navigated to Add Category')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create Category
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageCategory, ActivitySections.CATEGORY, 'Navigated to Manage Category')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage Category
                  </button>
                  {canCreateSubCategory && (
                    <button
                      onClick={() => handleNavigation(onShowAddSubCategory, ActivitySections.SUB_CATEGORY, 'Navigated to Add Sub Category')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create Sub Category
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageSubCategory, ActivitySections.SUB_CATEGORY, 'Navigated to Manage Sub Category')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage Sub Category
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Chutuku (Dam Information) */}
          {hasDamInformationPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setDamInformationExpanded(!damInformationExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <Database className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Chutuku</span>
                {damInformationExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {damInformationExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreateDamInformation && (
                    <button
                      onClick={() => handleNavigation(onShowCreateDamInformation, ActivitySections.DAM_INFORMATION, 'Navigated to Create Dam Information')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create Chutuku 
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageDamInformation, ActivitySections.DAM_INFORMATION, 'Navigated to Manage Dam Information')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage Chutuku
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Classified Ads */}
          {hasClassifiedAdsPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setClassifiedAdsExpanded(!classifiedAdsExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <FileText className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Classified Ads</span>
                {classifiedAdsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {classifiedAdsExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreateClassifiedAds && (
                    <button
                      onClick={() => handleNavigation(onShowCreateClassifiedAd, ActivitySections.CLASSIFIED_ADS, 'Navigated to Create Classified Ad')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create Ad
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageClassifiedAds, ActivitySections.CLASSIFIED_ADS, 'Navigated to Manage Classified Ads')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage Ads
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Customers */}
          {hasCustomerPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setCustomersExpanded(!customersExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <UserCircle className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Customers</span>
                {customersExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {customersExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreateCustomer && (
                    <button
                      onClick={() => handleNavigation(onShowCreateCustomer, ActivitySections.CUSTOMERS, 'Navigated to Create Customer')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create Customer
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageCustomers, ActivitySections.CUSTOMERS, 'Navigated to Manage Customers')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage Customers
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Arivina Anglala */}
         

          {/* E-Paper */}
          {hasENewsPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setENewsExpanded(!eNewsExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <FileText className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">E-Paper</span>
                {eNewsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {eNewsExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreateENews && (
                    <button
                      onClick={() => handleNavigation(onShowAddENews, ActivitySections.E_NEWS, 'Navigated to Add E-Paper')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create E-News
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageENews, ActivitySections.E_NEWS, 'Navigated to Manage E-Paper')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage E-News
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Events */}
          {hasEventsPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setEventsExpanded(!eventsExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <Calendar className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Events</span>
                {eventsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {eventsExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreateEvent && (
                    <button
                      onClick={() => handleNavigation(onShowCreateEvent, ActivitySections.EVENTS, 'Navigated to Create Event')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create Event
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageEvents, ActivitySections.EVENTS, 'Navigated to Manage Events')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage Events
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Nenapina Angala */}
        

          {/* Generate Classified */}
          <button
            onClick={() => handleNavigation(onShowGenerateClassified, ActivitySections.CLASSIFIED_ADS, 'Accessed Generate Classified')}
            className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
          >
            <FileImage className="h-5 w-5 mr-3" />
            <span className="flex-1 text-left">Generate Classified</span>
          </button>

          {/* Ideega */}
          {hasJustInPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setJustInExpanded(!justInExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <AlertTriangle className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Ideega</span>
                {justInExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {justInExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreateJustIn && (
                    <button
                      onClick={() => handleNavigation(onShowCreateJustIn, ActivitySections.JUST_IN, 'Navigated to Create JustIn')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create Ideega
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageJustIn, ActivitySections.JUST_IN, 'Navigated to Manage JustIn')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage Ideega
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Logs */}
          {hasFullSubscriptionAccess && (
            <div className="space-y-1">
              <button
                onClick={() => setLogsExpanded(!logsExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <FileBarChart className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Logs</span>
                {logsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {logsExpanded && (
                <div className="pl-11 space-y-1">
                  <button
                    onClick={() => handleNavigation(onShowManageSubscriptionLogs, ActivitySections.SUBSCRIPTION, 'Navigated to Manage Subscription Logs')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <Receipt className="h-4 w-4 mr-2" />
                      Subscription Logs
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavigation(onShowManageTransactions, ActivitySections.SUBSCRIPTION, 'Navigated to Manage Transactions')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Transaction Logs
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Maathu Maankiya (Thoughts) */}
          {hasThoughtsPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setThoughtsExpanded(!thoughtsExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <Lightbulb className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Maathu Maankiya</span>
                {thoughtsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {thoughtsExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreateThought && (
                    <button
                      onClick={() => handleNavigation(onShowCreateThought, ActivitySections.THOUGHTS, 'Navigated to Create Thought')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageThoughts, ActivitySections.THOUGHTS, 'Navigated to Manage Thoughts')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage
                  </button>
                </div>
              )}
            </div>
          )}
  {hasFiftyPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setFiftyExpanded(!fiftyExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <FileText className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Nenapina Angala</span>
                {fiftyExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {fiftyExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreateFifty && (
                    <button
                      onClick={() => handleNavigation(onShowCreateFifty, ActivitySections.FIFTY, 'Navigated to Create FiftyYears')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create Nenapina Angala
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageFifty, ActivitySections.FIFTY, 'Navigated to Manage FiftyYears')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage Nenapina Angala
                  </button>
                </div>
              )}
            </div>
          )}
          {/* News */}
          {hasNewsPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setNewsExpanded(!newsExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <Newspaper className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">News</span>
                {newsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {newsExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreateNews && (
                    <button
                      onClick={() => handleNavigation(onShowCreateNews, ActivitySections.NEWS, 'Navigated to Create News')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create News
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageNews, ActivitySections.NEWS, 'Navigated to Manage News')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage News
                  </button>
                  {hasAllPermissions && (
                    <button
                      onClick={() => handleNavigation(onShowManageComments, ActivitySections.NEWS, 'Navigated to Manage Comments')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Manage Comments
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Polling */}
          {hasPollingPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setPollingExpanded(!pollingExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Polling</span>
                {pollingExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {pollingExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreatePolling && (
                    <button
                      onClick={() => handleNavigation(onShowCreatePolling, ActivitySections.POLLING, 'Navigated to Create Polling')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create Poll
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManagePolling, ActivitySections.POLLING, 'Navigated to Manage Polling')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage Polls
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Promotions */}
          {hasPromotionPermissions && (
            <button
              onClick={() => handleNavigation(onShowManagePromotions, ActivitySections.PROMOTIONS, 'Accessed Manage Promotions')}
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
            >
              <Gift className="h-5 w-5 mr-3" />
              <span className="flex-1 text-left">Promotions</span>
            </button>
          )}

          {/* Session Logs - Only for users with ALL permissions */}
          {hasAllPermissions && (
            <button
              onClick={() => handleNavigation(onShowManageSessionLogs, ActivitySections.SESSION_LOGS, 'Accessed Session Logs')}
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
            >
              <Shield className="h-5 w-5 mr-3" />
              <span className="flex-1 text-left">Session Logs</span>
            </button>
          )}

          {/* System Settings - Only for users with ALL permissions */}
          {hasAllPermissions && (
            <button
              onClick={() => handleNavigation(onShowSystemSettings, ActivitySections.SETTINGS, 'Accessed System Settings')}
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
            >
              <Settings className="h-5 w-5 mr-3" />
              <span className="flex-1 text-left">System Settings</span>
            </button>
          )}

          {/* Submitted News */}
          <button
            onClick={() => handleNavigation(onShowManageSubmittedNews, ActivitySections.SUBMITTED_NEWS, 'Accessed Submitted News')}
            className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
          >
            <Send className="h-5 w-5 mr-3" />
            <span className="flex-1 text-left">Submitted News</span>
          </button>

          {/* Subscription */}
          {hasSubscriptionPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setSubscriptionExpanded(!subscriptionExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <CreditCard className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Subscription</span>
                {subscriptionExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {subscriptionExpanded && (
                <div className="pl-11 space-y-1">
                  {canCreateSubscription && (
                    <button
                      onClick={() => handleNavigation(onShowAddSubscriptionPlan, ActivitySections.SUBSCRIPTION, 'Navigated to Add Subscription Plan')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Create Plan
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageSubscriptionPlans, ActivitySections.SUBSCRIPTION, 'Navigated to Manage Subscription Plans')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage Plans
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {hasUserPermissions && (
            <div className="space-y-1">
              <button
                onClick={() => setUsersExpanded(!usersExpanded)}
                className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
              >
                <Users className="h-5 w-5 mr-3" />
                <span className="flex-1 text-left">Users</span>
                {usersExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {usersExpanded && (
                <div className="pl-11 space-y-1">
                  {canAddUser && (
                    <button
                      onClick={() => handleNavigation(onShowAddUser, ActivitySections.USERS, 'Navigated to Add User')}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                    >
                      Add User
                    </button>
                  )}
                  <button
                    onClick={() => handleNavigation(onShowManageUsers, ActivitySections.USERS, 'Navigated to Manage Users')}
                    className="block w-full text-left py-2 px-4 text-sm text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
                  >
                    Manage Users
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Views Analytics */}
          {canViewViews && (
            <button
              onClick={() => handleNavigation(onShowViewsAnalytics, ActivitySections.VIEWS_ANALYTICS, 'Accessed Views Analytics')}
              className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-gray-50 border border-transparent hover:border-black transition-colors duration-200"
            >
              <Eye className="h-5 w-5 mr-3" />
              <span className="flex-1 text-left">Views Analytics</span>
            </button>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-black">
        <button
          onClick={() => {
            logActivity(ActivityActions.NAVIGATE, 'Authentication', 'User logged out');
            onLogout();
          }}
          className="flex items-center w-full px-4 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-600 transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;