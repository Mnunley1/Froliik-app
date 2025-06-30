# Froliik App

A mobile app for creating and completing side quests to make daily life more adventurous and engaging.

## Features

### Enhanced Home Page

- **Current Side Quest Display**: Prominently shows the user's active quest with detailed information
- **Community Updates**: Real-time feed of quest completions and achievements from other users
- **Pull-to-Refresh**: Easy refresh functionality to get the latest quests and community updates
- **Quest Progress Tracking**: Visual progress indicators and milestone tracking

### Quest Management

- Create personalized side quests with categories, difficulty levels, and rewards
- Track quest completion and progress
- Share completed quests with the community
- AI-powered quest generation

### Community Features

- View recent quest completions from the community
- See achievements and milestones earned by other users
- Get inspired by community activity
- Social engagement through quest sharing

## Technical Stack

- **Frontend**: React Native with Expo
- **Backend**: Convex (Database + Auth + Real-time)
- **Styling**: Custom design system with theme support
- **State Management**: React Context API

## Database Schema

### Core Tables

- `users`: User profiles and authentication
- `sideQuests`: Quest data with completion status
- `communityUpdates`: Community feed data
- `userSettings`: User preferences and settings

### Key Features

- Row Level Security (RLS) for data protection
- Real-time subscriptions for live updates
- Optimized queries with proper indexing
- Community views for efficient data access

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Convex project and configure environment variables
4. Run database migrations
5. Start the development server: `npm start`

## Recent Updates

### Home Page Enhancement (Latest)

- Added prominent current quest display with status indicators
- Implemented community updates feed with real-time data
- Enhanced UI with pull-to-refresh functionality
- Improved quest categorization and visual hierarchy
- Added achievement system for completed quests
