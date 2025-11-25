# MUSE MUSIC - Admin Activity Diagrams

## Overview
Activity diagrams showing the workflows and business processes for administrators in the MUSE MUSIC platform. These diagrams illustrate administrative tasks, content moderation, system monitoring, and user management.

**Last Updated:** November 25, 2025  
**Repository:** tikpoptv/MUSE-MUSIC  
**Branch:** docs/diagrams  
**Actor:** Admin / Content Reviewer

---

## 🔐 Activity 1: Admin Login & Dashboard Access

```mermaid
flowchart TD
    Start([Admin User]) --> Login[Navigate to Login Page]
    Login --> EnterCreds[Enter Admin Email & Password]
    EnterCreds --> SubmitLogin[Submit Login]
    SubmitLogin --> ValidateCreds{Credentials Valid?}
    
    ValidateCreds -->|No| ShowError[Show Error Message]
    ShowError --> EnterCreds
    
    ValidateCreds -->|Yes| CheckRole{User Role = Admin?}
    CheckRole -->|No| DenyAccess[Show Error:<br/>Unauthorized Access<br/>Admin privileges required]
    DenyAccess --> End1([Access Denied])
    
    CheckRole -->|Yes| Require2FA[Require 2FA Verification<br/>Admin Routes Protected]
    Require2FA --> Enter2FA[Enter OTP Code from<br/>Authenticator App]
    Enter2FA --> Verify2FA{OTP Valid?}
    Verify2FA -->|No| Show2FAError[Show Error: Invalid OTP]
    Show2FAError --> Retry2FA{Retry Count < 3?}
    Retry2FA -->|No| LockAccount[Temporary Lock<br/>Log Security Event]
    LockAccount --> End1
    Retry2FA -->|Yes| Enter2FA
    
    Verify2FA -->|Yes| GenerateJWT[Generate JWT Token<br/>with Admin Role]
    GenerateJWT --> StoreToken[Store Token in LocalStorage]
    StoreToken --> LogAdminLogin[Log Admin Login Event<br/>to AuditLogs Table]
    LogAdminLogin --> LoadDashboard[Load Admin Dashboard]
    
    LoadDashboard --> FetchStats[Fetch Dashboard Statistics:<br/>- Total Users<br/>- Total Songs<br/>- Processing Queue<br/>- Pending Approvals<br/>- System Health]
    FetchStats --> DisplayDashboard[Display Admin Dashboard:<br/>- Overview Cards<br/>- Recent Activities<br/>- Charts & Graphs<br/>- Quick Actions]
    DisplayDashboard --> AdminChoice{Select Action?}
    
    AdminChoice -->|User Management| NavUsers[Navigate to User Management]
    AdminChoice -->|Song Management| NavSongs[Navigate to Song Management]
    AdminChoice -->|Content Approval| NavApproval[Navigate to Approval Queue]
    AdminChoice -->|AI Processing| NavProcessing[Navigate to Processing Monitor]
    AdminChoice -->|System Logs| NavLogs[Navigate to Logs Viewer]
    AdminChoice -->|Settings| NavSettings[Navigate to System Settings]
    AdminChoice -->|Logout| Logout[Logout & Clear Session]
    
    NavUsers --> End2([Open User Management])
    NavSongs --> End3([Open Song Management])
    NavApproval --> End4([Open Approval Queue])
    NavProcessing --> End5([Open Processing Monitor])
    NavLogs --> End6([Open Logs Viewer])
    NavSettings --> End7([Open Settings])
    Logout --> End8([Logged Out])
    
    style Start fill:#e3f2fd
    style End1 fill:#ffcdd2
    style End2 fill:#c8e6c9
    style End3 fill:#c8e6c9
    style End4 fill:#c8e6c9
    style End5 fill:#c8e6c9
    style End6 fill:#c8e6c9
    style End7 fill:#c8e6c9
    style End8 fill:#c8e6c9
    style DenyAccess fill:#ffcdd2
    style Show2FAError fill:#ffcdd2
    style LockAccount fill:#ffcdd2
    style DisplayDashboard fill:#fff9c4
```

---

## 👥 Activity 2: User Management

```mermaid
flowchart TD
    Start([Admin on Dashboard]) --> ClickUsers[Navigate to User Management]
    ClickUsers --> LoadUsers[Load Users List<br/>FROM Users JOIN Customers<br/>ORDER BY created_at DESC]
    LoadUsers --> DisplayUsers[Display Users Table:<br/>- ID, Email, Name<br/>- Role, Status<br/>- Created Date<br/>- Last Login<br/>- Actions]
    
    DisplayUsers --> FilterOption{Filter/Search?}
    FilterOption -->|Search| EnterSearch[Enter Search Query:<br/>Email or Name]
    EnterSearch --> SearchUsers[Search Users<br/>WHERE email LIKE or name LIKE]
    SearchUsers --> DisplayFiltered[Display Filtered Results]
    DisplayFiltered --> DisplayUsers
    
    FilterOption -->|Filter by Role| SelectRole[Select Role Filter:<br/>- All<br/>- User<br/>- Admin]
    SelectRole --> FilterByRole[Filter Users<br/>WHERE role = selected]
    FilterByRole --> DisplayFiltered
    
    FilterOption -->|Filter by Status| SelectStatus[Select Status Filter:<br/>- All<br/>- Active<br/>- Suspended<br/>- Deleted]
    SelectStatus --> FilterByStatus[Filter Users<br/>WHERE is_active = status]
    FilterByStatus --> DisplayFiltered
    
    FilterOption -->|No Filter| UserAction{Select User Action?}
    
    %% View User Details
    UserAction -->|View Details| SelectUser[Click on User Row]
    SelectUser --> LoadUserDetail[Load User Details:<br/>- Profile Info<br/>- Activity Stats<br/>- Favorites Count<br/>- History Count<br/>- Ratings Given<br/>- Shares Created]
    LoadUserDetail --> DisplayDetail[Display User Detail Modal]
    DisplayDetail --> DetailAction{Detail Action?}
    DetailAction -->|Edit| EditUser
    DetailAction -->|Suspend| SuspendUser
    DetailAction -->|Delete| DeleteUser
    DetailAction -->|Close| DisplayUsers
    
    %% Edit User
    UserAction -->|Edit User| EditUser[Open Edit User Form]
    EditUser --> ModifyFields[Modify Fields:<br/>- Display Name<br/>- Role admin/user<br/>- Email Verified<br/>- Status Active/Inactive]
    ModifyFields --> ValidateEdit{Valid Changes?}
    ValidateEdit -->|No| ShowEditError[Show Validation Errors]
    ShowEditError --> ModifyFields
    ValidateEdit -->|Yes| ConfirmEdit{Confirm Changes?}
    ConfirmEdit -->|No| DisplayUsers
    ConfirmEdit -->|Yes| UpdateUser[UPDATE Users Table<br/>SET modified fields]
    UpdateUser --> LogEdit[Log to AuditLogs:<br/>Action: User Updated<br/>Admin: current_admin<br/>Target: user_id<br/>Changes: JSON]
    LogEdit --> ShowToast1[Show Success Toast]
    ShowToast1 --> RefreshUsers[Refresh Users List]
    RefreshUsers --> DisplayUsers
    
    %% Suspend User
    UserAction -->|Suspend User| SuspendUser[Open Suspend Dialog]
    SuspendUser --> EnterReason[Enter Suspension Reason]
    EnterReason --> ConfirmSuspend{Confirm Suspend?}
    ConfirmSuspend -->|No| DisplayUsers
    ConfirmSuspend -->|Yes| UpdateSuspend[UPDATE Users:<br/>is_active = false<br/>suspended_reason<br/>suspended_at<br/>suspended_by]
    UpdateSuspend --> InvalidateTokens[DELETE UserSessions<br/>WHERE user_id = target<br/>Force logout]
    InvalidateTokens --> LogSuspend[Log to AuditLogs:<br/>Action: User Suspended]
    LogSuspend --> SendNotification[Send Email Notification<br/>to User via N8N]
    SendNotification --> ShowToast2[Show Success Toast]
    ShowToast2 --> RefreshUsers
    
    %% Delete User
    UserAction -->|Delete User| DeleteUser[Open Delete Dialog]
    DeleteUser --> WarningDelete[Show Warning:<br/>⚠️ Permanent Action<br/>Will delete:<br/>- User data<br/>- History<br/>- Favorites<br/>- Ratings<br/>Cannot be undone]
    WarningDelete --> TypeConfirm[Require: Type DELETE to confirm]
    TypeConfirm --> ConfirmDelete{Confirmation Match?}
    ConfirmDelete -->|No| DisplayUsers
    ConfirmDelete -->|Yes| BeginDelete[BEGIN TRANSACTION]
    BeginDelete --> DeleteRelated[DELETE Related Records:<br/>1. UserSessions<br/>2. UserSettings<br/>3. UserFavorites<br/>4. UserHistory<br/>5. UserRatings<br/>6. SharedSongs owner]
    DeleteRelated --> DeleteCustomer[DELETE from Customers]
    DeleteCustomer --> DeleteUserRecord[DELETE from Users]
    DeleteUserRecord --> CommitDelete[COMMIT TRANSACTION]
    CommitDelete --> LogDelete[Log to AuditLogs:<br/>Action: User Deleted<br/>Include: user_email for records]
    LogDelete --> ShowToast3[Show Success Toast]
    ShowToast3 --> RefreshUsers
    
    %% Bulk Actions
    UserAction -->|Bulk Actions| SelectMultiple[Select Multiple Users<br/>via Checkboxes]
    SelectMultiple --> BulkChoice{Bulk Action?}
    BulkChoice -->|Export| ExportCSV[Export Selected Users<br/>to CSV file]
    ExportCSV --> DownloadCSV[Download CSV]
    DownloadCSV --> DisplayUsers
    
    BulkChoice -->|Bulk Email| ComposeBulk[Compose Bulk Email<br/>Subject & Message]
    ComposeBulk --> SendBulk[Send via N8N<br/>to Selected Users]
    SendBulk --> LogBulkEmail[Log Bulk Email Action]
    LogBulkEmail --> ShowToast4[Show Success Toast]
    ShowToast4 --> DisplayUsers
    
    UserAction -->|Done| End([Back to Dashboard])
    
    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style WarningDelete fill:#ffcdd2
    style ShowEditError fill:#ffcdd2
    style SendNotification fill:#ff6d5a,color:#fff
    style SendBulk fill:#ff6d5a,color:#fff
```

---

## 🎵 Activity 3: Song Management

```mermaid
flowchart TD
    Start([Admin on Dashboard]) --> ClickSongs[Navigate to Song Management]
    ClickSongs --> LoadSongs[Load Songs List<br/>FROM Songs<br/>LEFT JOIN SongAIProcessing<br/>ORDER BY created_at DESC]
    LoadSongs --> DisplaySongs[Display Songs Table:<br/>- ID, Title, Artist<br/>- Status processed/pending<br/>- Upload Date<br/>- User Email<br/>- Actions]
    
    DisplaySongs --> FilterOption{Filter/Search?}
    FilterOption -->|Search| EnterSearch[Enter Search Query:<br/>Title or Artist]
    EnterSearch --> SearchSongs[Search Songs<br/>WHERE title LIKE or artist LIKE]
    SearchSongs --> DisplayFiltered[Display Filtered Results]
    DisplayFiltered --> DisplaySongs
    
    FilterOption -->|Filter by Status| SelectStatus[Select Status Filter:<br/>- All<br/>- Completed<br/>- Processing<br/>- Failed<br/>- Pending]
    SelectStatus --> FilterStatus[Filter SongAIProcessing<br/>WHERE status = selected]
    FilterStatus --> DisplayFiltered
    
    FilterOption -->|Filter by Date| SelectDateRange[Select Date Range]
    SelectDateRange --> FilterDate[Filter Songs<br/>WHERE created_at BETWEEN dates]
    FilterDate --> DisplayFiltered
    
    FilterOption -->|No Filter| SongAction{Select Song Action?}
    
    %% View Song Details
    SongAction -->|View Details| SelectSong[Click on Song Row]
    SelectSong --> LoadSongDetail[Load Song Details:<br/>- Metadata<br/>- Lyrics Original<br/>- AI Processing Results<br/>- Upload User Info<br/>- Cover Image URL<br/>- Statistics Usage]
    LoadSongDetail --> DisplaySongDetail[Display Song Detail Modal:<br/>- All Fields<br/>- Translation Preview<br/>- Mood Chart<br/>- Summary]
    DisplaySongDetail --> DetailAction{Detail Action?}
    DetailAction -->|Edit| EditSong
    DetailAction -->|Reprocess| ReprocessSong
    DetailAction -->|Delete| DeleteSong
    DetailAction -->|Close| DisplaySongs
    
    %% Edit Song
    SongAction -->|Edit Song| EditSong[Open Edit Song Form]
    EditSong --> ModifyFields[Modify Fields:<br/>- Title<br/>- Artist<br/>- Album<br/>- Genre<br/>- Release Year<br/>- Cover Image URL]
    ModifyFields --> ValidateEdit{Valid Changes?}
    ValidateEdit -->|No| ShowEditError[Show Validation Errors]
    ShowEditError --> ModifyFields
    ValidateEdit -->|Yes| UpdateSong[UPDATE Songs Table]
    UpdateSong --> LogEdit[Log to AuditLogs:<br/>Action: Song Updated]
    LogEdit --> ShowToast1[Show Success Toast]
    ShowToast1 --> RefreshSongs[Refresh Songs List]
    RefreshSongs --> DisplaySongs
    
    %% Reprocess Song
    SongAction -->|Reprocess AI| ReprocessSong[Open Reprocess Dialog]
    ReprocessSong --> ConfirmReprocess{Confirm Reprocess?<br/>Will overwrite existing data}
    ConfirmReprocess -->|No| DisplaySongs
    ConfirmReprocess -->|Yes| UpdateStatus[UPDATE SongAIProcessing:<br/>status = processing<br/>processing_started_at = NOW]
    UpdateStatus --> CallN8N[Call N8N Workflow Webhook<br/>with song_id]
    CallN8N --> ShowProcessing[Show Processing Toast:<br/>AI Reprocessing Started]
    ShowProcessing --> RefreshSongs
    
    %% Delete Song
    SongAction -->|Delete Song| DeleteSong[Open Delete Dialog]
    DeleteSong --> WarningDelete[Show Warning:<br/>⚠️ Will delete:<br/>- Song metadata<br/>- AI processing data<br/>- User favorites referencing<br/>- User history referencing<br/>- Share links referencing]
    WarningDelete --> TypeConfirm[Require: Type DELETE to confirm]
    TypeConfirm --> ConfirmDelete{Confirmation Match?}
    ConfirmDelete -->|No| DisplaySongs
    
    ConfirmDelete -->|Yes| CheckImage{Has Cover Image<br/>in MinIO?}
    CheckImage -->|Yes| DeleteImage[Delete Image from MinIO<br/>via minioService]
    DeleteImage --> BeginDelete
    CheckImage -->|No| BeginDelete
    
    BeginDelete[BEGIN TRANSACTION]
    BeginDelete --> DeleteRelated[DELETE Related Records:<br/>1. SharedSongs<br/>2. UserFavorites<br/>3. UserHistory<br/>4. UserRatings<br/>5. SongAIProcessing]
    DeleteRelated --> DeleteSongRecord[DELETE from Songs]
    DeleteSongRecord --> CommitDelete[COMMIT TRANSACTION]
    CommitDelete --> LogDelete[Log to AuditLogs:<br/>Action: Song Deleted]
    LogDelete --> ShowToast2[Show Success Toast]
    ShowToast2 --> RefreshSongs
    
    %% Bulk Actions
    SongAction -->|Bulk Actions| SelectMultiple[Select Multiple Songs<br/>via Checkboxes]
    SelectMultiple --> BulkChoice{Bulk Action?}
    
    BulkChoice -->|Bulk Delete| ConfirmBulkDelete{Confirm Delete All?}
    ConfirmBulkDelete -->|No| DisplaySongs
    ConfirmBulkDelete -->|Yes| BulkDeleteLoop[For Each Selected Song:<br/>Delete as per single delete flow]
    BulkDeleteLoop --> LogBulkDelete[Log Bulk Delete Action]
    LogBulkDelete --> ShowToast3[Show Success Toast]
    ShowToast3 --> RefreshSongs
    
    BulkChoice -->|Bulk Reprocess| ConfirmBulkReprocess{Confirm Reprocess All?}
    ConfirmBulkReprocess -->|No| DisplaySongs
    ConfirmBulkReprocess -->|Yes| BulkReprocessLoop[For Each Selected Song:<br/>Trigger N8N Workflow]
    BulkReprocessLoop --> LogBulkReprocess[Log Bulk Reprocess Action]
    LogBulkReprocess --> ShowToast4[Show Success Toast]
    ShowToast4 --> RefreshSongs
    
    BulkChoice -->|Export| ExportCSV[Export Selected Songs<br/>to CSV file]
    ExportCSV --> DownloadCSV[Download CSV]
    DownloadCSV --> DisplaySongs
    
    SongAction -->|Done| End([Back to Dashboard])
    
    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style WarningDelete fill:#ffcdd2
    style ShowEditError fill:#ffcdd2
    style CallN8N fill:#ff6d5a,color:#fff
```

---

## ✅ Activity 4: Content Approval (Share Links)

```mermaid
flowchart TD
    Start([Admin on Dashboard]) --> ClickApproval[Navigate to Approval Queue]
    ClickApproval --> LoadPending[Load Pending Share Links<br/>FROM SharedSongs<br/>WHERE status = pending<br/>JOIN Songs<br/>JOIN Users<br/>ORDER BY requested_at ASC]
    
    LoadPending --> CheckQueue{Has Pending Items?}
    CheckQueue -->|No| ShowEmpty[Show: No Pending Approvals<br/>All caught up! 🎉]
    ShowEmpty --> End1([Back to Dashboard])
    
    CheckQueue -->|Yes| DisplayQueue[Display Approval Queue:<br/>- Song Title & Artist<br/>- Requested By Email<br/>- Request Date<br/>- Preview Link<br/>- Actions Approve/Reject]
    
    DisplayQueue --> FilterOption{Filter?}
    FilterOption -->|Filter by User| SelectUser[Select User Filter]
    SelectUser --> FilterUser[Filter WHERE user_id = selected]
    FilterUser --> DisplayFiltered[Display Filtered Results]
    DisplayFiltered --> DisplayQueue
    
    FilterOption -->|Filter by Date| SelectDate[Select Date Range]
    SelectDate --> FilterDate[Filter WHERE requested_at BETWEEN]
    FilterDate --> DisplayFiltered
    
    FilterOption -->|Sort| SelectSort[Select Sort:<br/>- Oldest First<br/>- Newest First<br/>- Song Title<br/>- User Email]
    SelectSort --> ApplySort[Apply ORDER BY]
    ApplySort --> DisplayFiltered
    
    FilterOption -->|No Filter| AdminAction{Select Action?}
    
    %% Preview Share Link
    AdminAction -->|Preview| SelectShare[Click Preview Icon]
    SelectShare --> OpenPreview[Open Share Link Preview<br/>in New Tab/Modal]
    OpenPreview --> ReviewContent[Review Content:<br/>- Song Analysis<br/>- Translation Quality<br/>- Mood Detection<br/>- Summary<br/>- Cover Image]
    ReviewContent --> MakeDecision{Content Appropriate?}
    MakeDecision -->|Yes| QuickApprove[Quick Approve Button]
    QuickApprove --> ApproveFlow
    MakeDecision -->|No| QuickReject[Quick Reject Button]
    QuickReject --> RejectFlow
    MakeDecision -->|Need More Info| ClosePreview[Close Preview]
    ClosePreview --> DisplayQueue
    
    %% Approve Share Link
    AdminAction -->|Approve| SelectApprove[Select Share Link to Approve]
    SelectApprove --> ApproveFlow[Open Approve Dialog]
    ApproveFlow --> ConfirmApprove{Confirm Approve?}
    ConfirmApprove -->|No| DisplayQueue
    ConfirmApprove -->|Yes| UpdateApprove[UPDATE SharedSongs:<br/>status = approved<br/>is_public = true<br/>approved_at = NOW<br/>approved_by = admin_id]
    UpdateApprove --> LogApprove[Log to AuditLogs:<br/>Action: Share Link Approved<br/>Admin: current_admin<br/>Target: share_id]
    LogApprove --> NotifyUser[Send Approval Email<br/>to User via N8N:<br/>Include active share link]
    NotifyUser --> ShowToast1[Show Success Toast:<br/>Share Link Approved]
    ShowToast1 --> RefreshQueue[Refresh Approval Queue]
    RefreshQueue --> DisplayQueue
    
    %% Reject Share Link
    AdminAction -->|Reject| SelectReject[Select Share Link to Reject]
    SelectReject --> RejectFlow[Open Reject Dialog]
    RejectFlow --> EnterReason[Enter Rejection Reason:<br/>Textarea Required]
    EnterReason --> SelectReasonType[Select Reason Type:<br/>- Inappropriate Content<br/>- Copyright Issues<br/>- Low Quality<br/>- Spam<br/>- Other]
    SelectReasonType --> ValidateReason{Reason Provided?}
    ValidateReason -->|No| ShowReasonError[Show Error: Reason Required]
    ShowReasonError --> EnterReason
    
    ValidateReason -->|Yes| ConfirmReject{Confirm Reject?}
    ConfirmReject -->|No| DisplayQueue
    ConfirmReject -->|Yes| UpdateReject[UPDATE SharedSongs:<br/>status = rejected<br/>is_public = false<br/>rejected_reason<br/>rejected_at = NOW<br/>rejected_by = admin_id]
    UpdateReject --> LogReject[Log to AuditLogs:<br/>Action: Share Link Rejected]
    LogReject --> NotifyRejection[Send Rejection Email<br/>to User via N8N:<br/>Include reason]
    NotifyRejection --> ShowToast2[Show Success Toast:<br/>Share Link Rejected]
    ShowToast2 --> RefreshQueue
    
    %% Bulk Actions
    AdminAction -->|Bulk Actions| SelectMultiple[Select Multiple Share Links<br/>via Checkboxes]
    SelectMultiple --> BulkChoice{Bulk Action?}
    
    BulkChoice -->|Bulk Approve| ConfirmBulkApprove{Confirm Approve All?<br/>Count: X items}
    ConfirmBulkApprove -->|No| DisplayQueue
    ConfirmBulkApprove -->|Yes| BulkApproveLoop[For Each Selected:<br/>Update status to approved]
    BulkApproveLoop --> LogBulkApprove[Log Bulk Approve Action]
    LogBulkApprove --> SendBulkNotify1[Send Approval Emails<br/>to All Users]
    SendBulkNotify1 --> ShowToast3[Show Success Toast]
    ShowToast3 --> RefreshQueue
    
    BulkChoice -->|Bulk Reject| EnterBulkReason[Enter Reason for All]
    EnterBulkReason --> ConfirmBulkReject{Confirm Reject All?}
    ConfirmBulkReject -->|No| DisplayQueue
    ConfirmBulkReject -->|Yes| BulkRejectLoop[For Each Selected:<br/>Update status to rejected]
    BulkRejectLoop --> LogBulkReject[Log Bulk Reject Action]
    LogBulkReject --> SendBulkNotify2[Send Rejection Emails<br/>to All Users]
    SendBulkNotify2 --> ShowToast4[Show Success Toast]
    ShowToast4 --> RefreshQueue
    
    %% View Statistics
    AdminAction -->|View Stats| LoadStats[Load Approval Statistics:<br/>- Total Pending<br/>- Approved Today<br/>- Rejected Today<br/>- Avg Approval Time<br/>- Top Requesting Users]
    LoadStats --> DisplayStats[Display Statistics Dashboard]
    DisplayStats --> CloseStats[Close Stats]
    CloseStats --> DisplayQueue
    
    AdminAction -->|Done| End2([Back to Dashboard])
    
    style Start fill:#e3f2fd
    style End1 fill:#c8e6c9
    style End2 fill:#c8e6c9
    style ShowEmpty fill:#fff3e0
    style ShowReasonError fill:#ffcdd2
    style NotifyUser fill:#ff6d5a,color:#fff
    style NotifyRejection fill:#ff6d5a,color:#fff
    style SendBulkNotify1 fill:#ff6d5a,color:#fff
    style SendBulkNotify2 fill:#ff6d5a,color:#fff
```

---

## 🔄 Activity 5: AI Processing Monitor

```mermaid
flowchart TD
    Start([Admin on Dashboard]) --> ClickProcessing[Navigate to Processing Monitor]
    ClickProcessing --> LoadProcessing[Load Processing Data<br/>FROM SongAIProcessing<br/>JOIN Songs<br/>ORDER BY processing_started_at DESC]
    
    LoadProcessing --> DisplayOverview[Display Processing Overview:<br/>- Total Processed<br/>- Currently Processing<br/>- Failed Count<br/>- Avg Processing Time<br/>- Queue Status]
    
    DisplayOverview --> TabChoice{Select Tab?}
    
    %% Active Processing Tab
    TabChoice -->|Active| LoadActive[Load Active Processing<br/>WHERE status = processing]
    LoadActive --> CheckActive{Has Active?}
    CheckActive -->|No| ShowNoActive[Show: No Active Processing<br/>All queues idle]
    ShowNoActive --> DisplayOverview
    
    CheckActive -->|Yes| DisplayActive[Display Active Jobs Table:<br/>- Song Title & Artist<br/>- Started At<br/>- Duration<br/>- Progress Status<br/>- Actions]
    DisplayActive --> ActiveAction{Action?}
    
    ActiveAction -->|View Details| ViewActiveDetail[View Processing Details:<br/>- Processing Steps<br/>- Current Step<br/>- Logs<br/>- N8N Workflow Status]
    ViewActiveDetail --> CloseDetail1[Close Details]
    CloseDetail1 --> DisplayActive
    
    ActiveAction -->|Cancel| ConfirmCancel{Confirm Cancel Job?}
    ConfirmCancel -->|No| DisplayActive
    ConfirmCancel -->|Yes| CancelJob[UPDATE SongAIProcessing:<br/>status = cancelled]
    CancelJob --> LogCancel[Log to AuditLogs:<br/>Action: Processing Cancelled]
    LogCancel --> ShowToast1[Show Toast: Job Cancelled]
    ShowToast1 --> LoadActive
    
    ActiveAction -->|Refresh| RefreshActive[Refresh Active Jobs]
    RefreshActive --> LoadActive
    
    ActiveAction -->|Back| DisplayOverview
    
    %% Completed Tab
    TabChoice -->|Completed| LoadCompleted[Load Completed Processing<br/>WHERE status = completed<br/>ORDER BY completed_at DESC<br/>LIMIT 100]
    LoadCompleted --> DisplayCompleted[Display Completed Jobs Table:<br/>- Song Info<br/>- Completed At<br/>- Processing Duration<br/>- Result Summary<br/>- Actions]
    DisplayCompleted --> CompletedAction{Action?}
    
    CompletedAction -->|View Results| ViewCompletedDetail[View Processing Results:<br/>- Translation Output<br/>- Mood Percentages<br/>- Summary Text<br/>- Processing Logs]
    ViewCompletedDetail --> CloseDetail2[Close Details]
    CloseDetail2 --> DisplayCompleted
    
    CompletedAction -->|Reprocess| ConfirmReprocess{Confirm Reprocess?<br/>Will overwrite results}
    ConfirmReprocess -->|No| DisplayCompleted
    ConfirmReprocess -->|Yes| TriggerReprocess[UPDATE status = processing<br/>Call N8N Webhook]
    TriggerReprocess --> LogReprocess[Log Reprocess Action]
    LogReprocess --> ShowToast2[Show Toast: Reprocessing Started]
    ShowToast2 --> LoadCompleted
    
    CompletedAction -->|Export| ExportCompleted[Export Completed Jobs<br/>to CSV with Results]
    ExportCompleted --> DownloadCSV1[Download CSV]
    DownloadCSV1 --> DisplayCompleted
    
    CompletedAction -->|Back| DisplayOverview
    
    %% Failed Tab
    TabChoice -->|Failed| LoadFailed[Load Failed Processing<br/>WHERE status = failed<br/>ORDER BY failed_at DESC]
    LoadFailed --> CheckFailed{Has Failed?}
    CheckFailed -->|No| ShowNoFailed[Show: No Failed Jobs<br/>All systems operational! ✅]
    ShowNoFailed --> DisplayOverview
    
    CheckFailed -->|Yes| DisplayFailed[Display Failed Jobs Table:<br/>- Song Info<br/>- Failed At<br/>- Error Message<br/>- Retry Count<br/>- Actions]
    DisplayFailed --> FailedAction{Action?}
    
    FailedAction -->|View Error| ViewError[View Detailed Error:<br/>- Error Message<br/>- Stack Trace<br/>- N8N Logs<br/>- Input Data<br/>- Timestamp]
    ViewError --> CloseDetail3[Close Error Details]
    CloseDetail3 --> DisplayFailed
    
    FailedAction -->|Retry| ConfirmRetry{Confirm Retry?}
    ConfirmRetry -->|No| DisplayFailed
    ConfirmRetry -->|Yes| IncrementRetry[Increment retry_count]
    IncrementRetry --> RetriggerJob[UPDATE status = processing<br/>Call N8N Webhook]
    RetriggerJob --> LogRetry[Log Retry Action]
    LogRetry --> ShowToast3[Show Toast: Job Retrying]
    ShowToast3 --> LoadFailed
    
    FailedAction -->|Mark Resolved| ConfirmResolve{Mark as Resolved?<br/>Will remove from failed list}
    ConfirmResolve -->|No| DisplayFailed
    ConfirmResolve -->|Yes| UpdateResolve[UPDATE status = resolved]
    UpdateResolve --> LogResolve[Log Resolved Action]
    LogResolve --> ShowToast4[Show Toast: Marked Resolved]
    ShowToast4 --> LoadFailed
    
    FailedAction -->|Bulk Retry| SelectMultipleFailed[Select Multiple Failed Jobs]
    SelectMultipleFailed --> ConfirmBulkRetry{Confirm Retry All?}
    ConfirmBulkRetry -->|No| DisplayFailed
    ConfirmBulkRetry -->|Yes| BulkRetryLoop[For Each Selected:<br/>Retry Processing]
    BulkRetryLoop --> LogBulkRetry[Log Bulk Retry Action]
    LogBulkRetry --> ShowToast5[Show Toast: Bulk Retry Started]
    ShowToast5 --> LoadFailed
    
    FailedAction -->|Back| DisplayOverview
    
    %% Statistics & Charts
    TabChoice -->|Statistics| LoadCharts[Load Processing Statistics:<br/>- Jobs per Day Chart<br/>- Success Rate Chart<br/>- Avg Duration Trend<br/>- Error Types Breakdown<br/>- Peak Hours Heatmap]
    LoadCharts --> DisplayCharts[Display Charts & Graphs<br/>using Recharts]
    DisplayCharts --> ExportStats[Option: Export Statistics]
    ExportStats --> DownloadStats[Download PDF Report]
    DownloadStats --> DisplayCharts
    DisplayCharts --> BackFromCharts[Back to Overview]
    BackFromCharts --> DisplayOverview
    
    %% System Health Check
    TabChoice -->|Health Check| RunHealthCheck[Run System Health Check:<br/>- Database Connection<br/>- N8N Workflow Status<br/>- MinIO Storage Status<br/>- API Response Times<br/>- Queue Status]
    RunHealthCheck --> DisplayHealth[Display Health Status:<br/>- Green: All OK<br/>- Yellow: Warnings<br/>- Red: Critical Issues]
    DisplayHealth --> CheckHealthStatus{All Healthy?}
    CheckHealthStatus -->|Yes| ShowHealthy[Show: All Systems Operational ✅]
    ShowHealthy --> DisplayOverview
    CheckHealthStatus -->|No| ShowIssues[Show Critical Issues:<br/>- Issue Description<br/>- Affected Component<br/>- Suggested Action]
    ShowIssues --> TakeAction{Take Action?}
    TakeAction -->|Fix| AttemptFix[Execute Automated Fix<br/>if available]
    AttemptFix --> RerunHealth[Re-run Health Check]
    RerunHealth --> RunHealthCheck
    TakeAction -->|Alert| SendAlert[Send Alert to DevOps<br/>via N8N Email]
    SendAlert --> LogAlert[Log Alert Action]
    LogAlert --> DisplayOverview
    TakeAction -->|Ignore| DisplayOverview
    
    TabChoice -->|Done| End([Back to Dashboard])
    
    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style ShowNoActive fill:#fff3e0
    style ShowNoFailed fill:#c8e6c9
    style ShowHealthy fill:#c8e6c9
    style ShowIssues fill:#ffcdd2
    style SendAlert fill:#ff6d5a,color:#fff
```

---

## 📊 Activity 6: System Logs & Audit

```mermaid
flowchart TD
    Start([Admin on Dashboard]) --> ClickLogs[Navigate to System Logs]
    ClickLogs --> LoadLogs[Load Recent Logs<br/>FROM SystemLogs<br/>ORDER BY created_at DESC<br/>LIMIT 500]
    
    LoadLogs --> DisplayLogs[Display Logs Dashboard:<br/>- Recent Logs Table<br/>- Filter Options<br/>- Search Bar<br/>- Export Options]
    
    DisplayLogs --> LogChoice{Select Log Type?}
    
    %% System Logs
    LogChoice -->|System Logs| LoadSystemLogs[Load SystemLogs Table:<br/>- INFO<br/>- WARNING<br/>- ERROR<br/>- DEBUG]
    LoadSystemLogs --> FilterSystem{Apply Filters?}
    
    FilterSystem -->|Log Level| SelectLevel[Select Level:<br/>- All<br/>- INFO<br/>- WARNING<br/>- ERROR<br/>- DEBUG]
    SelectLevel --> ApplyLevelFilter[WHERE log_level = selected]
    ApplyLevelFilter --> DisplaySystemLogs
    
    FilterSystem -->|Date Range| SelectSystemDate[Select Date Range]
    SelectSystemDate --> ApplyDateFilter[WHERE created_at BETWEEN]
    ApplyDateFilter --> DisplaySystemLogs
    
    FilterSystem -->|Search| EnterSystemSearch[Enter Search Query]
    EnterSystemSearch --> SearchSystemLogs[Search in message, context]
    SearchSystemLogs --> DisplaySystemLogs
    
    FilterSystem -->|No Filter| DisplaySystemLogs[Display System Logs Table:<br/>- Timestamp<br/>- Level<br/>- Message<br/>- Context JSON<br/>- Actions]
    
    DisplaySystemLogs --> SystemAction{Action?}
    SystemAction -->|View Details| ViewSystemDetail[View Full Log Entry:<br/>- Complete Context<br/>- Stack Trace if Error<br/>- Request Info<br/>- User Info]
    ViewSystemDetail --> CloseSystem[Close Details]
    CloseSystem --> DisplaySystemLogs
    
    SystemAction -->|Export| ExportSystem[Export Filtered Logs<br/>to CSV/JSON]
    ExportSystem --> DownloadSystem[Download File]
    DownloadSystem --> DisplaySystemLogs
    
    SystemAction -->|Back| DisplayLogs
    
    %% Error Logs
    LogChoice -->|Error Logs| LoadErrorLogs[Load ErrorLogs Table:<br/>- Unhandled Exceptions<br/>- API Errors<br/>- Database Errors<br/>- External Service Errors]
    LoadErrorLogs --> FilterError{Apply Filters?}
    
    FilterError -->|Error Type| SelectErrorType[Select Error Type:<br/>- All<br/>- Server Error<br/>- Client Error<br/>- Database Error<br/>- External API Error]
    SelectErrorType --> ApplyTypeFilter[WHERE error_type = selected]
    ApplyTypeFilter --> DisplayErrorLogs
    
    FilterError -->|Status| SelectErrorStatus[Select Status:<br/>- Unresolved<br/>- Investigating<br/>- Resolved]
    SelectErrorStatus --> ApplyStatusFilter[WHERE status = selected]
    ApplyStatusFilter --> DisplayErrorLogs
    
    FilterError -->|Date Range| SelectErrorDate[Select Date Range]
    SelectErrorDate --> ApplyErrorDateFilter[WHERE occurred_at BETWEEN]
    ApplyErrorDateFilter --> DisplayErrorLogs
    
    FilterError -->|No Filter| DisplayErrorLogs[Display Error Logs Table:<br/>- Timestamp<br/>- Error Type<br/>- Message<br/>- Affected Endpoint<br/>- User if Available<br/>- Status<br/>- Actions]
    
    DisplayErrorLogs --> ErrorAction{Action?}
    
    ErrorAction -->|View Details| ViewErrorDetail[View Full Error Details:<br/>- Complete Stack Trace<br/>- Request Body<br/>- Request Headers<br/>- Query Parameters<br/>- User Agent<br/>- IP Address]
    ViewErrorDetail --> CloseError[Close Details]
    CloseError --> DisplayErrorLogs
    
    ErrorAction -->|Update Status| SelectNewStatus[Select New Status:<br/>- Investigating<br/>- Resolved<br/>- Won't Fix]
    SelectNewStatus --> AddNote[Add Admin Note]
    AddNote --> UpdateErrorStatus[UPDATE ErrorLogs:<br/>status, admin_note,<br/>updated_by, updated_at]
    UpdateErrorStatus --> LogErrorUpdate[Log Status Change<br/>to AuditLogs]
    LogErrorUpdate --> ShowToast1[Show Success Toast]
    ShowToast1 --> DisplayErrorLogs
    
    ErrorAction -->|Group Similar| FindSimilar[Find Similar Errors:<br/>Same error_type & message pattern]
    FindSimilar --> DisplaySimilar[Display Grouped Errors:<br/>Count & First/Last Occurrence]
    DisplaySimilar --> BulkResolve{Bulk Resolve All?}
    BulkResolve -->|Yes| UpdateAllStatus[UPDATE all to Resolved]
    UpdateAllStatus --> LogBulkResolve[Log Bulk Resolve]
    LogBulkResolve --> ShowToast2[Show Success Toast]
    ShowToast2 --> DisplayErrorLogs
    BulkResolve -->|No| DisplayErrorLogs
    
    ErrorAction -->|Export| ExportErrors[Export Filtered Errors<br/>to CSV/JSON]
    ExportErrors --> DownloadErrors[Download File]
    DownloadErrors --> DisplayErrorLogs
    
    ErrorAction -->|Back| DisplayLogs
    
    %% Audit Logs
    LogChoice -->|Audit Logs| LoadAuditLogs[Load AuditLogs Table:<br/>- Admin Actions<br/>- User Management<br/>- Song Management<br/>- Approval Actions]
    LoadAuditLogs --> FilterAudit{Apply Filters?}
    
    FilterAudit -->|Action Type| SelectActionType[Select Action Type:<br/>- All<br/>- User Created<br/>- User Updated<br/>- User Deleted<br/>- Song Updated<br/>- Song Deleted<br/>- Share Approved<br/>- Share Rejected]
    SelectActionType --> ApplyActionFilter[WHERE action_type = selected]
    ApplyActionFilter --> DisplayAuditLogs
    
    FilterAudit -->|Admin User| SelectAdmin[Select Admin User]
    SelectAdmin --> ApplyAdminFilter[WHERE admin_user_id = selected]
    ApplyAdminFilter --> DisplayAuditLogs
    
    FilterAudit -->|Date Range| SelectAuditDate[Select Date Range]
    SelectAuditDate --> ApplyAuditDateFilter[WHERE created_at BETWEEN]
    ApplyAuditDateFilter --> DisplayAuditLogs
    
    FilterAudit -->|No Filter| DisplayAuditLogs[Display Audit Logs Table:<br/>- Timestamp<br/>- Admin User<br/>- Action Type<br/>- Target Entity<br/>- Changes JSON<br/>- IP Address<br/>- Actions]
    
    DisplayAuditLogs --> AuditAction{Action?}
    
    AuditAction -->|View Details| ViewAuditDetail[View Full Audit Entry:<br/>- Before/After Comparison<br/>- Complete Changes JSON<br/>- Request Context<br/>- User Agent]
    ViewAuditDetail --> CloseAudit[Close Details]
    CloseAudit --> DisplayAuditLogs
    
    AuditAction -->|Export| ExportAudit[Export Filtered Audit Logs<br/>for Compliance/Review]
    ExportAudit --> DownloadAudit[Download File]
    DownloadAudit --> DisplayAuditLogs
    
    AuditAction -->|Generate Report| SelectReportType[Select Report Type:<br/>- Daily Summary<br/>- Weekly Summary<br/>- Monthly Summary<br/>- Custom Date Range]
    SelectReportType --> GenerateReport[Generate Audit Report<br/>with Statistics & Charts]
    GenerateReport --> DownloadReport[Download PDF Report]
    DownloadReport --> DisplayAuditLogs
    
    AuditAction -->|Back| DisplayLogs
    
    %% Health Check Logs
    LogChoice -->|Health Checks| LoadHealthLogs[Load HealthCheckStatus Table:<br/>- Database Health<br/>- API Health<br/>- External Services Health]
    LoadHealthLogs --> DisplayHealthLogs[Display Health Check History:<br/>- Check Time<br/>- Component<br/>- Status OK/Warning/Error<br/>- Response Time<br/>- Details]
    DisplayHealthLogs --> HealthLogAction{Action?}
    
    HealthLogAction -->|View Trend| GenerateHealthTrend[Generate Health Trend Chart:<br/>Response times over time]
    GenerateHealthTrend --> DisplayTrend[Display Trend Chart]
    DisplayTrend --> CloseHealthTrend[Close Chart]
    CloseHealthTrend --> DisplayHealthLogs
    
    HealthLogAction -->|Run Check Now| RunManualCheck[Run Manual Health Check]
    RunManualCheck --> InsertHealthLog[INSERT into HealthCheckStatus]
    InsertHealthLog --> ShowHealthResult[Show Latest Results]
    ShowHealthResult --> DisplayHealthLogs
    
    HealthLogAction -->|Back| DisplayLogs
    
    LogChoice -->|Done| End([Back to Dashboard])
    
    style Start fill:#e3f2fd
    style End fill:#c8e6c9
    style DisplayErrorLogs fill:#ffcdd2
    style DisplayAuditLogs fill:#fff9c4
```

---

## 📝 Activity Summary

### Admin Activities Covered
1. ✅ **Admin Login & Dashboard** - Secure 2FA login, dashboard overview, quick actions
2. ✅ **User Management** - View, edit, suspend, delete users, bulk actions
3. ✅ **Song Management** - View, edit, reprocess, delete songs, bulk operations
4. ✅ **Content Approval** - Review and approve/reject share links, bulk approvals
5. ✅ **AI Processing Monitor** - Monitor active/completed/failed jobs, health checks
6. ✅ **System Logs & Audit** - View system logs, error logs, audit trails, reporting

### Key Admin Features
- **Security**: 2FA required for all admin actions, audit logging
- **Bulk Operations**: Multi-select actions for efficiency
- **Real-time Monitoring**: Live status of AI processing jobs
- **Error Management**: Detailed error tracking and resolution workflow
- **Audit Trail**: Complete action history with before/after comparison
- **Health Checks**: Automated system health monitoring
- **Notifications**: Email notifications via N8N for important events
- **Reporting**: Export capabilities and PDF report generation

### Database Tables Used
- **Admin Management**: Users (role=admin), AuditLogs, SystemLogs, ErrorLogs
- **User Management**: Users, Customers, UserSessions, UserSettings
- **Song Management**: Songs, SongAIProcessing, MinIO storage
- **Content Approval**: SharedSongs (pending/approved/rejected)
- **Monitoring**: SongAIProcessing (status tracking), HealthCheckStatus

### External Services Integration
- **N8N**: Workflow triggers, email notifications, AI processing orchestration
- **MinIO**: Image deletion when songs are removed
- **Ollama**: Via N8N for AI reprocessing
- **Email Service**: User notifications for approvals/rejections/alerts

---

## 🔐 Security & Compliance

### Admin Access Controls
1. **Role-based Access**: Admin role required (checked at route level)
2. **2FA Enforcement**: Mandatory OTP verification for admin routes
3. **Session Management**: JWT tokens with admin role claims
4. **Audit Logging**: All admin actions logged to AuditLogs table
5. **IP Tracking**: Admin IP addresses recorded for security

### Data Protection
- **Soft Deletes Available**: Option to mark as deleted without removing data
- **Transaction Safety**: Critical operations wrapped in database transactions
- **Confirmation Required**: Destructive actions require explicit confirmation
- **Backup Notifications**: Email notifications sent before bulk deletions

### Compliance Features
- **Audit Trail**: Complete history of all administrative actions
- **Export Capabilities**: Logs exportable for compliance reporting
- **Before/After Tracking**: Changes tracked with before/after states
- **Admin Identification**: All actions tied to specific admin user
- **Timestamp Precision**: All actions timestamped with timezone

---

## 🔍 Notes

- All workflows verified against actual admin routes and controllers
- Error handling and validation included in each flow
- Security measures (2FA, audit logging) integrated throughout
- External service integrations (N8N, MinIO) properly sequenced
- Database operations match actual schema and constraints
- Bulk operations optimized with transaction boundaries
- Real-time status updates via polling/refresh mechanisms

**Verification Date:** November 25, 2025  
**Codebase State:** All admin activities verified against actual implementation  
**Security Level:** High - 2FA enforced, all actions audited
