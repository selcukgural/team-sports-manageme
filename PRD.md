# Planning Guide

A comprehensive team sports management platform that enables coaches, players, and parents to coordinate schedules, track attendance, communicate effectively, and manage team logistics in one centralized application.

**Experience Qualities**:
1. **Efficient** - Streamlined workflows that reduce administrative burden and allow quick access to critical team information
2. **Connected** - Foster seamless communication between all team members with real-time updates and notifications
3. **Organized** - Clear visual hierarchy and structured data presentation that makes complex team coordination feel effortless

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a multi-faceted platform requiring user roles, event management, roster coordination, messaging systems, availability tracking, and persistent data across multiple interconnected features.

## Essential Features

### Team Roster Management
- **Functionality**: Create and manage team rosters with player profiles including contact information, jersey numbers, positions, and emergency contacts
- **Purpose**: Centralize all team member information for easy reference and communication
- **Trigger**: Coach/admin accesses "Roster" section and adds/edits player profiles
- **Progression**: Click "Add Player" → Fill player details form → Save → Player appears in roster list → Can edit/view player card
- **Success criteria**: All player information is stored persistently, searchable, and accessible to authorized team members

### Event & Schedule Management
- **Functionality**: Create, view, and manage games, practices, and team events with date, time, location, and opponent information
- **Purpose**: Keep entire team synchronized on upcoming commitments and prevent scheduling conflicts
- **Trigger**: Coach creates new event or team member views calendar
- **Progression**: Navigate to Schedule → Click "Add Event" → Select event type → Enter details (date/time/location) → Save → Event appears on team calendar → Members can view and respond
- **Success criteria**: Events display correctly in calendar views, support filtering by type, and show attendance status

### Availability & RSVP System
- **Functionality**: Players/parents mark availability for events and coaches see real-time attendance tracking
- **Purpose**: Enable coaches to plan effectively knowing who will attend each event
- **Trigger**: Player receives event notification or views schedule
- **Progression**: View event → Click availability button → Select status (Available/Maybe/Unavailable) → Add optional note → Confirm → Status updates for coach view
- **Success criteria**: Attendance percentages calculate automatically, coaches see live availability counts

### Team Messaging & Announcements
- **Functionality**: Broadcast messages to entire team or specific groups with threaded conversations
- **Purpose**: Facilitate quick communication without relying on external messaging apps
- **Trigger**: User clicks "Messages" or "Send Announcement"
- **Progression**: Click "New Message" → Select recipients (all/specific roles) → Type message → Send → All recipients see notification → Can reply
- **Success criteria**: Messages persist, support threads, and display unread indicators

### Player Statistics Tracking
- **Functionality**: Record and display individual player statistics across games and seasons
- **Purpose**: Track player development and maintain historical performance records
- **Trigger**: Coach enters post-game statistics or views player profile
- **Progression**: Navigate to game → Click "Enter Stats" → Select player → Input statistics → Save → Stats aggregate to player profile
- **Success criteria**: Statistics calculate totals and averages, display in sortable tables

### File & Photo Sharing
- **Functionality**: Upload and organize team documents, photos, and resources with support for multiple file types (images, PDFs, documents)
- **Purpose**: Centralize team resources like practice plans, game strategies, and team photos with easy categorization and access
- **Trigger**: User clicks "Files" navigation or uploads file
- **Progression**: Navigate to Files → Click "Upload Files" → Select category → Choose files (single or multiple) → Files process and upload → Files display in organized grid view with preview → Users can download or delete
- **Success criteria**: Files organized by category (all/documents/photos/other), support preview for images, downloadable for all types, persistent storage using useKV, display file metadata (name, size, upload date, uploader)

### Team Dashboard
- **Functionality**: Overview screen showing upcoming events, recent messages, roster summary, and quick actions
- **Purpose**: Provide at-a-glance team status and facilitate rapid navigation to key features
- **Trigger**: User logs in or navigates to home
- **Progression**: App loads → Dashboard displays next 3 events → Shows unread message count → Displays recent announcements → Quick action buttons for common tasks
- **Success criteria**: Dashboard loads quickly, information is current, and navigation is intuitive

## Edge Case Handling

- **Empty States**: Show helpful illustrations and call-to-action buttons when rosters, schedules, or messages are empty, guiding users to create their first entry
- **Offline Access**: Display cached data with clear indicators when offline; queue actions for sync when connection returns
- **Conflicting Events**: Highlight schedule conflicts with visual warnings when events overlap
- **Deleted Events**: Soft delete with recovery option within 30 days; notify affected members
- **Permission Errors**: Gracefully handle unauthorized actions with clear messaging about role requirements
- **Data Validation**: Prevent invalid dates, ensure required fields are complete, validate email/phone formats
- **Long Lists**: Implement virtual scrolling and pagination for rosters/schedules with 100+ items
- **Concurrent Edits**: Use optimistic updates with conflict resolution when multiple users edit simultaneously

## Design Direction

The design should evoke feelings of professionalism, energy, and team unity. Visual elements should feel sporty and dynamic without being overly playful, maintaining credibility for serious athletic coordination. The interface should feel clean and modern, with athletic-inspired color choices that convey both competitiveness and collaboration. Interactions should feel responsive and energetic, reflecting the active nature of sports teams.

## Color Selection

The color scheme draws inspiration from athletic fields, team jerseys, and sports equipment, creating an energetic yet professional atmosphere perfect for sports coordination.

- **Primary Color**: Vibrant Grass Green (oklch(0.65 0.18 145)) - Represents the playing field, growth, and team success. Used for primary actions and navigation elements.
- **Secondary Colors**: Deep Navy (oklch(0.25 0.05 250)) for authority and structure; Clean White (oklch(1 0 0)) for clarity and space; Slate Gray (oklch(0.45 0.02 250)) for supporting text and borders
- **Accent Color**: Electric Orange (oklch(0.72 0.19 45)) - High-energy highlight for calls-to-action, upcoming events, and important notifications that demand attention
- **Foreground/Background Pairings**: 
  - Background White (oklch(1 0 0)): Dark Navy text (oklch(0.25 0.05 250)) - Ratio 11.2:1 ✓
  - Primary Green (oklch(0.65 0.18 145)): White text (oklch(1 0 0)) - Ratio 5.1:1 ✓
  - Accent Orange (oklch(0.72 0.19 45)): Dark Navy text (oklch(0.25 0.05 250)) - Ratio 5.8:1 ✓
  - Card Light Gray (oklch(0.97 0 0)): Slate Gray text (oklch(0.45 0.02 250)) - Ratio 6.7:1 ✓

## Font Selection

Typography should convey athleticism and modernity while maintaining excellent readability across all device sizes and use cases.

- **Primary Typeface**: Outfit - A geometric sans-serif with athletic proportions that feels contemporary and energetic without sacrificing professionalism
- **Secondary Typeface**: Inter - For body text and data-dense areas, providing excellent readability in smaller sizes and tables

- **Typographic Hierarchy**:
  - H1 (Page Titles): Outfit Bold/32px/tight letter-spacing/-0.02em
  - H2 (Section Headers): Outfit Semibold/24px/normal letter-spacing
  - H3 (Card Titles): Outfit Medium/18px/normal letter-spacing
  - Body Large (Primary Content): Inter Regular/16px/1.6 line-height
  - Body (Standard Text): Inter Regular/14px/1.5 line-height
  - Caption (Metadata, Timestamps): Inter Medium/12px/uppercase/letter-spacing 0.05em
  - Button Text: Outfit Semibold/15px/letter-spacing -0.01em

## Animations

Animations should feel snappy and athletic, reinforcing the energetic nature of sports while maintaining usability. Use spring physics for interactions that feel responsive and alive. Key moments include: slide-in transitions for modal dialogs (300ms elastic ease), subtle scale feedback on button presses (150ms), smooth height animations for expanding availability lists, and celebratory micro-animations when marking attendance or completing actions. Avoid animations that delay user actions - prioritize speed with personality over elaborate choreography.

## Component Selection

- **Components**:
  - Calendar: Custom-built using react-day-picker base with color-coded event types and attendance indicators
  - Cards: Shadcn Card for roster profiles, event details, stat summaries, and file previews with hover lift effects
  - Dialog: Shadcn Dialog for event creation/editing forms and image previews with full-screen mobile adaptation
  - Tabs: Shadcn Tabs for switching between Schedule/Roster/Messages/Stats views and file categories (All/Documents/Photos/Other)
  - Avatar: Shadcn Avatar for player profile images with fallback to initials
  - Badge: Shadcn Badge for player positions, attendance status, notification counts, and file counts in tabs
  - Button: Shadcn Button with variants (primary green, secondary navy, ghost for icon actions)
  - Form: Shadcn Form components with react-hook-form for all data entry
  - Select: Shadcn Select for dropdowns (event types, player positions, time zones, file categories)
  - Textarea: Shadcn Textarea for messages and notes
  - Switch: Shadcn Switch for boolean settings
  - Toast: Sonner for success confirmations and error notifications
  - File Input: Native HTML file input with custom styling for multiple file uploads

- **Customizations**:
  - Custom Calendar Grid: Weekly and monthly views with event density indicators
  - Availability Quick-Action Bar: Floating button group for rapid RSVP (green/yellow/red)
  - Player Stats Table: Sortable table with sticky headers and highlight rows
  - Message Thread Component: WhatsApp-style conversation bubbles with timestamps
  - Team Dashboard Widget: Modular card system with drag-to-reorder capability
  - File Upload Zone: Drag-and-drop area with file type validation and multi-file support
  - File Grid: Responsive grid layout with image thumbnails and document icons
  - Image Preview Modal: Full-screen image viewer with download and delete actions

- **States**:
  - Buttons: Hover lift (translateY -1px), active press (scale 0.98), disabled opacity 0.5
  - Input Fields: Focus border color shift to primary green with subtle glow
  - Cards: Hover elevation increase, selected state with primary green border
  - Availability Buttons: Color-coded (green/yellow/red) with icons, selected state with check mark
  - Dropdowns: Smooth height expansion with fade-in for options

- **Icon Selection**:
  - Navigation: CalendarBlank (schedule), Users (roster), FolderOpen (files), ChatCircle (messages), ChartBar (stats/dashboard)
  - Actions: Plus (add), PencilSimple (edit), Trash (delete), Check (confirm), UploadSimple (upload), DownloadSimple (download)
  - Events: Trophy (games), Whistle (practices), Calendar (general events)
  - Files: Image (photos), File (generic), FilePdf (PDF documents), FileDoc (text documents)
  - Availability: CheckCircle (available), Clock (maybe), XCircle (unavailable)
  - Communication: Bell (notifications), PaperPlaneTilt (send message)
  - Status: Warning (conflicts), Info (announcements), Lock (permissions)

- **Spacing**:
  - Page Margins: px-4 md:px-6 lg:px-8
  - Card Padding: p-4 md:p-6
  - Section Gaps: space-y-6 md:space-y-8
  - Form Field Spacing: space-y-4
  - Button Groups: gap-2 md:gap-3
  - List Items: py-3 with border-b dividers

- **Mobile**:
  - Tab Navigation: Bottom fixed tab bar on mobile (<768px) with 5 tabs including Files, sidebar on desktop
  - Event Forms: Full-screen modal on mobile, centered dialog on desktop
  - File Upload: Full-screen dialog on mobile with simplified upload interface
  - File Grid: Single column on mobile, 2-column on tablet, 3-column on desktop
  - Image Preview: Full-screen on mobile with swipe gestures, modal on desktop
  - Calendar: Single day list view on mobile, week grid on tablet, month grid on desktop
  - Roster: Single column stack on mobile, 2-column grid on tablet, 3-column on desktop
  - Messages: Full viewport on mobile with back navigation, side panel on desktop
  - Quick Actions: Floating action button (FAB) on mobile bottom-right for primary add actions
  - Touch Targets: Minimum 44px height for all interactive elements including file cards
  - Typography: Scale down h1 to 24px on mobile, h2 to 20px, maintain body at 14px for readability
