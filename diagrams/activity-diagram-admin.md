# MUSE MUSIC - Admin Activity Diagrams

## Overview
Activity diagrams showing actual admin workflows in MUSE MUSIC platform based on verified codebase inspection. All flows match actual routes, controllers, services, and database schema.

**Last Updated:** November 25, 2025  
**Repository:** tikpoptv/MUSE-MUSIC  
**Branch:** docs/diagrams  
**Actor:** Admin / Super Admin  
**Verification:** All activities verified against actual code

---

## 🔐 Activity 1: Admin Login & Dashboard

```mermaid
flowchart TD
    Start([Admin User]) --> Login[Navigate to /login]
    Login --> EnterCreds[Enter Email/Username & Password]
    EnterCreds --> SubmitLogin[POST /api/auth/login]
    SubmitLogin --> ValidateCreds{Credentials Valid?}
    
    ValidateCreds -->|No| ShowError[Show 401 Error]
    ShowError --> EnterCreds
    
    ValidateCreds -->|Yes| CheckRole{User role =<br/>admin or super_admin?}
    CheckRole -->|No| DenyAccess[Redirect to /for-you<br/>User Dashboard]
    DenyAccess --> End1([Normal User Access])
    
    CheckRole -->|Yes| GenerateJWT[Generate JWT Token<br/>with role claim]
    GenerateJWT --> StoreToken[Store Token in LocalStorage]
    StoreToken --> Navigate[Navigate to /admin]
    
    Navigate --> CheckSetup{setupCompleted?}
    CheckSetup -->|No| RedirectSetup[Redirect to /setup<br/>Complete Setup First]
    RedirectSetup --> End1
    
    CheckSetup -->|Yes| LoadDashboard[GET /api/dashboard<br/>DashboardController]
    LoadDashboard --> FetchStats[DashboardService:<br/>- getDashboardStats<br/>- getTrafficData<br/>- getSongsByMood]
    FetchStats --> QueryStats[Parallel Queries:<br/>SELECT COUNT Users<br/>SELECT COUNT Songs<br/>SELECT COUNT pending approval<br/>SELECT COUNT Sessions<br/>SELECT traffic by date<br/>SELECT songs GROUP BY mood]
    QueryStats --> DisplayDashboard[Display Admin Dashboard:<br/>- Total Users card<br/>- Total Songs card<br/>- Pending Approval badge<br/>- Total Sessions card<br/>- Traffic Chart<br/>- Songs by Mood Chart]
    DisplayDashboard --> AdminChoice{Select Menu?}
    
    AdminChoice -->|Songs Management| NavSongs[Navigate to /admin/songs]
    AdminChoice -->|Admin Users| NavManage[Navigate to /admin/manage]
    AdminChoice -->|System Logs| NavLogs[Navigate to /admin/logs]
    AdminChoice -->|AI Prompts| NavPrompts[Navigate to /admin/prompts]
    AdminChoice -->|Logout| Logout[POST /api/auth/logout]
    
    NavSongs --> End2([Open Songs Management])
    NavManage --> End3([Open Admin Management])
    NavLogs --> End4([Open Logs Viewer])
    NavPrompts --> End5([Open Prompts Manager])
    Logout --> End6([Logged Out])
    
    style Start fill:#e3f2fd
    style End1 fill:#fff3e0
    style End2 fill:#c8e6c9
    style End3 fill:#c8e6c9
    style End4 fill:#c8e6c9
    style End5 fill:#c8e6c9
    style End6 fill:#c8e6c9
    style DenyAccess fill:#fff3e0
    style ShowError fill:#ffcdd2
    style DisplayDashboard fill:#fff9c4
```

---

## 🎵 Activity 2: Songs Management (Approve/Reject)

```mermaid
flowchart TD
    Start([Admin on Dashboard]) --> Navigate[Navigate to /admin/songs]
    Navigate --> LoadSongs[GET /api/admin/songs<br/>AdminSongsController]
    LoadSongs --> QuerySongs[AdminSongsService.getPendingSongs<br/>SELECT FROM SongAIProcessing<br/>JOIN Songs<br/>LEFT JOIN Users createdBy<br/>WHERE statusFilter]
    
    QuerySongs --> ApplyFilters{Apply Filters?}
    ApplyFilters -->|Status Filter| SelectStatus[Select Status:<br/>- all<br/>- pending not_approve<br/>- approved done<br/>- rejected<br/>- private<br/>- public_pending<br/>- public_approved]
    SelectStatus --> FilterQuery[WHERE approvalStatus OR shareStatus]
    FilterQuery --> DisplayTable
    
    ApplyFilters -->|Search| EnterSearch[Enter Search Query:<br/>songName OR artistName]
    EnterSearch --> SearchQuery[WHERE songname ILIKE<br/>OR artistname ILIKE]
    SearchQuery --> DisplayTable
    
    ApplyFilters -->|No Filter| DisplayTable[Display Songs Table:<br/>- Processing ID<br/>- Song Name & Artist<br/>- Language<br/>- Status Badge<br/>- Created By<br/>- Created Date<br/>- Highlight pending<br/>Pagination]
    
    DisplayTable --> CheckPending{Has Pending Items?}
    CheckPending -->|Yes| ShowBadge[Show Pending Count Badge<br/>GET /api/admin/songs/pending-count]
    CheckPending -->|No| NoBadge[No Badge]
    ShowBadge --> SongAction
    NoBadge --> SongAction
    
    SongAction{Select Action?}
    
    %% View Song Details
    SongAction -->|View Details| ClickRow[Click Song Row]
    ClickRow --> OpenModal[Open Detail Modal<br/>Show:<br/>- Song Metadata<br/>- Lyrics Original<br/>- Translation<br/>- Mood Chart<br/>- Summary<br/>- Cover Image<br/>- Created By Info<br/>- Status]
    OpenModal --> ModalAction{Modal Action?}
    ModalAction -->|Approve| QuickApprove[Click Approve in Modal]
    QuickApprove --> ApproveFlow
    ModalAction -->|Reject| QuickReject[Click Reject in Modal]
    QuickReject --> RejectFlow
    ModalAction -->|Close| CloseModal[Close Modal]
    CloseModal --> DisplayTable
    
    %% Approve Song
    SongAction -->|Approve| SelectApprove[Select Song to Approve]
    SelectApprove --> ApproveFlow[POST /api/admin/songs/:processingID/approve<br/>body: note optional]
    ApproveFlow --> UpdateApprove[UPDATE SongAIProcessing SET<br/>approvalStatus = approved<br/>shareStatus = public_approved<br/>approvedBy = adminUserID<br/>approvedAt = NOW<br/>approvalNote<br/>isPublic = TRUE]
    UpdateApprove --> ShowToast1[Show Success Toast]
    ShowToast1 --> RefreshList[Refresh Songs List]
    RefreshList --> DisplayTable
    
    %% Reject Song
    SongAction -->|Reject| SelectReject[Select Song to Reject]
    SelectReject --> RejectFlow[POST /api/admin/songs/:processingID/reject<br/>body: note optional]
    RejectFlow --> UpdateReject[UPDATE SongAIProcessing SET<br/>approvalStatus = rejected<br/>shareStatus = private<br/>approvedBy = adminUserID<br/>approvedAt = NOW<br/>approvalNote<br/>isPublic = FALSE]
    UpdateReject --> ShowToast2[Show Success Toast]
    ShowToast2 --> RefreshList
    
    %% Bulk Actions
    SongAction -->|Bulk Actions| SelectMultiple[Select Multiple Songs<br/>via Checkboxes]
    SelectMultiple --> BulkChoice{Bulk Action?}
    
    BulkChoice -->|Bulk Approve| ConfirmBulk{Confirm Approve All?<br/>Count: X songs}
    ConfirmBulk -->|No| DisplayTable
    ConfirmBulk -->|Yes| BulkApproveAPI[POST /api/admin/songs/bulk-approve<br/>body: processingIDs array, note]
    BulkApproveAPI --> BulkApproveLoop[AdminSongsService.bulkApprove:<br/>For each ID:<br/>UPDATE SongAIProcessing<br/>SET approved fields]
    BulkApproveLoop --> ReturnBulkResult[Return: approved count, errors array]
    ReturnBulkResult --> ShowBulkToast[Show Toast:<br/>X songs approved<br/>Y errors if any]
    ShowBulkToast --> RefreshList
    
    BulkChoice -->|Bulk Reject| EnterBulkNote[Optional: Enter Reason]
    EnterBulkNote --> ConfirmReject{Confirm Reject All?}
    ConfirmReject -->|No| DisplayTable
    ConfirmReject -->|Yes| BulkRejectAPI[POST /api/admin/songs/bulk-reject<br/>body: processingIDs array, note]
    BulkRejectAPI --> BulkRejectLoop[AdminSongsService.bulkReject:<br/>For each ID:<br/>UPDATE SongAIProcessing<br/>SET rejected fields]
    BulkRejectLoop --> ReturnRejectResult[Return: rejected count, errors array]
    ReturnRejectResult --> ShowRejectToast[Show Toast:<br/>X songs rejected]
    ShowRejectToast --> RefreshList
    
    %% Edit Lyrics
    SongAction -->|Edit Lyrics| SelectEdit[Select Song to Edit]
    SelectEdit --> OpenEditor[Open Lyrics Editor Modal]
    OpenEditor --> EditText[Edit Lyrics Text<br/>Textarea with formatting]
    EditText --> SaveLyrics[PUT /api/admin/songs/:processingID/lyrics<br/>body: lyrics text]
    SaveLyrics --> ValidateEdit{Admin or<br/>Super Admin?}
    ValidateEdit -->|No| ShowEditError[Show 403:<br/>Only admins can edit]
    ShowEditError --> OpenEditor
    ValidateEdit -->|Yes| UpdateLyrics[AdminSongsService:<br/>UPDATE lyrics in Song<br/>via processingID->songID<br/>SET updatedBy = adminID]
    UpdateLyrics --> ShowToast3[Show Success Toast]
    ShowToast3 --> RefreshList
    
    SongAction -->|Done| End([Back to Dashboard])
    
    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style ShowEditError fill:#ffcdd2
```

---

## 👥 Activity 3: Admin User Management

```mermaid
flowchart TD
    Start([Admin on Dashboard]) --> Navigate[Navigate to /admin/manage]
    Navigate --> LoadAdmins[GET /api/admin/manage<br/>AdminManageController]
    LoadAdmins --> QueryAdmins[AdminManageService.getAdminUsers:<br/>SELECT FROM Users<br/>WHERE role IN admin, super_admin<br/>ORDER BY role, createdAt DESC]
    QueryAdmins --> DisplayTable[Display Admin Users Table:<br/>- User ID<br/>- Username<br/>- Email<br/>- Full Name<br/>- Role badge<br/>- Register Date<br/>- Actions]
    
    DisplayTable --> AdminAction{Select Action?}
    
    %% Add Admin
    AdminAction -->|Add Admin| ClickAdd[Click Add Admin Button]
    ClickAdd --> OpenAddModal[Open Add Admin Modal]
    OpenAddModal --> EnterEmail[Enter User Email]
    EnterEmail --> SelectRole[Select Role:<br/>- admin<br/>- super_admin]
    SelectRole --> ConfirmAdd{Confirm Add?}
    ConfirmAdd -->|No| CloseAdd[Close Modal]
    CloseAdd --> DisplayTable
    
    ConfirmAdd -->|Yes| SubmitAdd[POST /api/admin/manage<br/>body: email, role]
    SubmitAdd --> FindUser[SELECT FROM Users<br/>WHERE email]
    FindUser --> CheckExists{User Exists?}
    CheckExists -->|No| ShowError404[Show 404:<br/>User not found]
    ShowError404 --> OpenAddModal
    
    CheckExists -->|Yes| CheckAlreadyAdmin{Already Admin?}
    CheckAlreadyAdmin -->|Yes| ShowError409[Show 409:<br/>User already admin]
    ShowError409 --> OpenAddModal
    
    CheckAlreadyAdmin -->|No| UpdateToAdmin[UPDATE Users<br/>SET role = selected<br/>WHERE userID]
    UpdateToAdmin --> SendPromoEmail[EmailService:<br/>sendAdminPromotionEmail<br/>via N8N]
    SendPromoEmail --> ShowToast1[Show Success Toast:<br/>Admin added]
    ShowToast1 --> RefreshList[Refresh Admin List]
    RefreshList --> DisplayTable
    
    %% Update Role
    AdminAction -->|Update Role| SelectUser[Select Admin User]
    SelectUser --> OpenUpdate[Open Update Role Modal]
    OpenUpdate --> ChangeRole[Select New Role:<br/>- admin<br/>- super_admin]
    ChangeRole --> ConfirmUpdate{Confirm Update?}
    ConfirmUpdate -->|No| CloseUpdate[Close Modal]
    CloseUpdate --> DisplayTable
    
    ConfirmUpdate -->|Yes| SubmitUpdate[PUT /api/admin/manage/:userID<br/>body: role]
    SubmitUpdate --> UpdateRole[AdminManageService:<br/>UPDATE Users<br/>SET role<br/>WHERE userID]
    UpdateRole --> SendUpdateEmail[EmailService:<br/>Send role update email]
    SendUpdateEmail --> ShowToast2[Show Success Toast:<br/>Role updated]
    ShowToast2 --> RefreshList
    
    %% Remove Admin
    AdminAction -->|Remove Admin| SelectRemove[Select Admin to Remove]
    SelectRemove --> ConfirmRemove{Confirm Remove?<br/>⚠️ Will demote to customer}
    ConfirmRemove -->|No| DisplayTable
    ConfirmRemove -->|Yes| SubmitRemove[DELETE /api/admin/manage/:userID]
    SubmitRemove --> CheckNotAdmin{User is Admin?}
    CheckNotAdmin -->|No| ShowError400[Show 400:<br/>User not an admin]
    ShowError400 --> DisplayTable
    
    CheckNotAdmin -->|Yes| DemoteUser[AdminManageService:<br/>UPDATE Users<br/>SET role = customer<br/>WHERE userID]
    DemoteUser --> SendDemoteEmail[EmailService:<br/>Send demotion notification]
    SendDemoteEmail --> ShowToast3[Show Success Toast:<br/>Admin removed]
    ShowToast3 --> RefreshList
    
    AdminAction -->|Done| End([Back to Dashboard])
    
    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style ShowError404 fill:#ffcdd2
    style ShowError409 fill:#ffcdd2
    style ShowError400 fill:#ffcdd2
    style SendPromoEmail fill:#ff6d5a,color:#fff
```

---

## 📊 Activity 4: System Logs Viewer

```mermaid
flowchart TD
    Start([Admin on Dashboard]) --> Navigate[Navigate to /admin/logs]
    Navigate --> LoadLogs[GET /api/admin/logs<br/>AdminLogsController]
    LoadLogs --> QueryLogs[LogService.getLogs:<br/>SELECT FROM SystemLogs<br/>ORDER BY createdAt DESC<br/>LIMIT 50 per page]
    QueryLogs --> DisplayLogs[Display Logs Table:<br/>- Log ID<br/>- Level badge<br/>- Category<br/>- Message<br/>- User if available<br/>- Created At<br/>- Actions]
    
    DisplayLogs --> ApplyFilters{Apply Filters?}
    
    ApplyFilters -->|Level Filter| SelectLevel[Select Level:<br/>- info<br/>- error<br/>- warn<br/>- debug]
    SelectLevel --> FilterLevel[WHERE level = selected]
    FilterLevel --> RefreshQuery[Re-query with filters]
    RefreshQuery --> DisplayLogs
    
    ApplyFilters -->|Category Filter| SelectCategory[Select Category:<br/>- api<br/>- database<br/>- auth<br/>- admin<br/>- etc.]
    SelectCategory --> FilterCategory[WHERE category = selected]
    FilterCategory --> RefreshQuery
    
    ApplyFilters -->|Date Range| SelectDates[Select Start & End Date]
    SelectDates --> FilterDate[WHERE createdAt BETWEEN dates]
    FilterDate --> RefreshQuery
    
    ApplyFilters -->|Search| EnterSearch[Enter Search Query]
    EnterSearch --> FilterSearch[WHERE message ILIKE<br/>OR details::text ILIKE]
    FilterSearch --> RefreshQuery
    
    ApplyFilters -->|User Filter| SelectUser[Filter by User ID]
    SelectUser --> FilterUser[WHERE userID = selected]
    FilterUser --> RefreshQuery
    
    ApplyFilters -->|No Filter| LogAction{Select Action?}
    
    %% View Log Details
    LogAction -->|View Details| ClickLog[Click Log Row]
    ClickLog --> OpenLogModal[Open Log Detail Modal:<br/>- Full Message<br/>- Details JSON formatted<br/>- Request Context<br/>  method, path, statusCode<br/>- User Context<br/>  userID, role<br/>- System Context<br/>  IP, userAgent, requestID<br/>- Error Context<br/>  stack, code<br/>- Performance<br/>  duration ms]
    OpenLogModal --> CloseLogModal[Close Modal]
    CloseLogModal --> DisplayLogs
    
    %% View Statistics
    LogAction -->|View Stats| LoadStats[GET /api/admin/logs/stats<br/>LogService.getLogStats]
    LoadStats --> QueryStats[SELECT COUNT, level<br/>GROUP BY level<br/>Last 24 hours, 7 days, 30 days]
    QueryStats --> DisplayStats[Display Statistics:<br/>- Total Logs count<br/>- Errors count<br/>- Warns count<br/>- Info count<br/>- Debug count<br/>- Chart by level<br/>- Chart by category<br/>- Recent errors list]
    DisplayStats --> CloseStats[Close Stats]
    CloseStats --> DisplayLogs
    
    %% Export Logs
    LogAction -->|Export| SelectExport[Select Export Format:<br/>- CSV<br/>- JSON]
    SelectExport --> GenerateExport[Generate Export File<br/>with current filters]
    GenerateExport --> DownloadFile[Download File]
    DownloadFile --> DisplayLogs
    
    %% Pagination
    LogAction -->|Navigate Pages| ChangePage[Change Page<br/>page & limit params]
    ChangePage --> LoadLogs
    
    LogAction -->|Done| End([Back to Dashboard])
    
    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style OpenLogModal fill:#fff9c4
    style DisplayStats fill:#fff9c4
```

---

## 🤖 Activity 5: AI Prompts Management

```mermaid
flowchart TD
    Start([Admin on Dashboard]) --> Navigate[Navigate to /admin/prompts]
    Navigate --> LoadPrompts[GET /api/prompts<br/>PromptController]
    LoadPrompts --> QueryPrompts[PromptService:<br/>SELECT FROM Prompts<br/>ORDER BY createdAt DESC]
    QueryPrompts --> DisplayPrompts[Display Prompts List:<br/>- Prompt ID<br/>- Prompt Type badge<br/>  translation/mood/both<br/>- Prompt Text preview<br/>- Is Active toggle<br/>- Created At<br/>- Actions]
    
    DisplayPrompts --> PromptAction{Select Action?}
    
    %% Add New Prompt
    PromptAction -->|Add Prompt| ClickAdd[Click Add Prompt Button]
    ClickAdd --> OpenAdd[Open Add Prompt Modal]
    OpenAdd --> FillPrompt[Fill Form:<br/>- promptType select<br/>  translation/mood/both<br/>- promptText textarea<br/>- temp optional<br/>- isActive checkbox]
    FillPrompt --> ValidatePrompt{Valid?}
    ValidatePrompt -->|No| ShowPromptError[Show Validation Errors]
    ShowPromptError --> FillPrompt
    ValidatePrompt -->|Yes| SubmitAdd[POST /api/prompts<br/>body: promptData]
    SubmitAdd --> InsertPrompt[INSERT INTO Prompts<br/>- promptID UUID<br/>- promptType<br/>- promptText<br/>- temp<br/>- isActive<br/>- createdAt NOW]
    InsertPrompt --> ShowToast1[Show Success Toast]
    ShowToast1 --> RefreshPrompts[Refresh Prompts List]
    RefreshPrompts --> DisplayPrompts
    
    %% Edit Prompt
    PromptAction -->|Edit| SelectEdit[Select Prompt to Edit]
    SelectEdit --> OpenEdit[Open Edit Prompt Modal]
    OpenEdit --> EditFields[Edit Fields:<br/>- promptType<br/>- promptText<br/>- temp<br/>- isActive]
    EditFields --> ValidateEdit{Valid?}
    ValidateEdit -->|No| ShowEditError[Show Validation Errors]
    ShowEditError --> EditFields
    ValidateEdit -->|Yes| SubmitEdit[PUT /api/prompts/:promptID<br/>body: updated data]
    SubmitEdit --> UpdatePrompt[UPDATE Prompts<br/>SET fields<br/>updatedAt = NOW<br/>WHERE promptID]
    UpdatePrompt --> ShowToast2[Show Success Toast]
    ShowToast2 --> RefreshPrompts
    
    %% Toggle Active
    PromptAction -->|Toggle Active| SelectToggle[Click isActive Toggle]
    SelectToggle --> UpdateActive[PUT /api/prompts/:promptID<br/>body: isActive boolean]
    UpdateActive --> UpdateDB[UPDATE Prompts<br/>SET isActive<br/>WHERE promptID]
    UpdateDB --> ShowToast3[Show Toggle Toast]
    ShowToast3 --> RefreshPrompts
    
    %% Delete Prompt
    PromptAction -->|Delete| SelectDelete[Select Prompt to Delete]
    SelectDelete --> ConfirmDelete{Confirm Delete?<br/>⚠️ Cannot be undone}
    ConfirmDelete -->|No| DisplayPrompts
    ConfirmDelete -->|Yes| SubmitDelete[DELETE /api/prompts/:promptID]
    SubmitDelete --> DeleteDB[DELETE FROM Prompts<br/>WHERE promptID]
    DeleteDB --> ShowToast4[Show Success Toast]
    ShowToast4 --> RefreshPrompts
    
    %% Test Prompt
    PromptAction -->|Test| SelectTest[Select Prompt to Test]
    SelectTest --> OpenTest[Open Test Prompt Modal]
    OpenTest --> EnterTest[Enter Test Lyrics Text]
    EnterTest --> SubmitTest[POST /api/prompts/test<br/>body: promptID, testText]
    SubmitTest --> CallN8N[Call N8N with test prompt<br/>Send to Ollama AI]
    CallN8N --> WaitTest[Wait for Response]
    WaitTest --> DisplayResult[Display Test Results:<br/>- Translation<br/>- Mood Analysis<br/>- Processing Time]
    DisplayResult --> CloseTest[Close Test Modal]
    CloseTest --> DisplayPrompts
    
    %% View Prompt Details
    PromptAction -->|View Details| ClickView[Click Prompt Row]
    ClickView --> OpenView[Open Detail Modal:<br/>- Full Prompt Text<br/>- Temp Text if any<br/>- Type & Status<br/>- Created/Updated dates<br/>- Usage statistics optional]
    OpenView --> CloseView[Close Modal]
    CloseView --> DisplayPrompts
    
    PromptAction -->|Done| End([Back to Dashboard])
    
    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style ShowPromptError fill:#ffcdd2
    style ShowEditError fill:#ffcdd2
    style CallN8N fill:#ff6d5a,color:#fff
```

---

## 📝 Summary

### Verified Admin Activities (5 Activities)
1. ✅ **Admin Login & Dashboard** - Role check + statistics (verified against authController, dashboardController)
2. ✅ **Songs Management** - Approve/Reject/Bulk actions (verified against adminSongsController, adminSongsService)
3. ✅ **Admin User Management** - Add/Update/Remove admins (verified against adminManageController, adminManageService)
4. ✅ **System Logs Viewer** - Filter and view logs (verified against adminLogsController, logService)
5. ✅ **AI Prompts Management** - CRUD prompts (verified against promptController, promptService)

### Key Findings from Code Inspection
- **Admin role check at route level** - requireRole(['admin', 'super_admin']) middleware
- **NO user suspension feature** - only admin role management (add/remove/update)
- **NO separate share approval** - Song approval in SongAIProcessing table using approvalStatus field
- **Songs approval updates multiple fields** - approvalStatus, shareStatus, isPublic, approvedBy, approvedAt
- **Bulk operations return success count + errors array** - partial success handling
- **Email notifications via N8N** - admin promotion, role update, demotion
- **Logs filterable by level, category, date, user, search**
- **Prompts testable via N8N** - admin can test prompt before activating

### Database Tables Used
- **Users** - role field (customer, admin, super_admin)
- **SongAIProcessing** - approvalStatus, shareStatus, isPublic, approvedBy, approvedAt, approvalNote
- **SystemLogs** - level, category, message, details JSONB, user context, error context
- **Prompts** - promptType (translation/mood/both), promptText, temp, isActive

### Admin Privileges
- **View dashboard statistics** - users, songs, sessions, traffic, mood distribution
- **Approve/Reject songs** - single and bulk operations
- **Manage admin users** - promote/demote/update roles (email → admin → super_admin)
- **View system logs** - all levels with advanced filtering
- **Manage AI prompts** - CRUD operations with testing capability
- **Edit song lyrics** - restricted to admin/super_admin roles

### NO Features Found
- ❌ User suspension/ban system
- ❌ Separate SharedSongs table or approval queue
- ❌ Delete songs feature (not found in routes)
- ❌ Delete users feature (only remove admin role)
- ❌ Error logs separate table (uses SystemLogs with level filter)
- ❌ Audit logs separate table (uses SystemLogs)
- ❌ Health check monitoring UI (no route found)

**Verification Date:** November 25, 2025  
**Codebase State:** All admin activities verified against actual routes, controllers, services, and schema  
**Method:** File inspection + grep search + SQL schema analysis  
**Admin Routes Verified:** adminSongs, adminManage, adminLogs, adminAnalysis, dashboard, prompts
