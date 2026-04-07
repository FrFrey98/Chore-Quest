# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [1.1.0] - 2026-04-07

### Added
- Backup & restore: export and import full database as JSON
- User management with role system (admin, member, child)
- Role-based permission system with access control guards
- Multi-step setup wizard for family member creation
- Task assignment to specific users
- Calendar-based task scheduling with weekday patterns
- Schedule overrides (add/skip) for individual dates
- Calendar month view on tasks page
- PWA push notifications for task reminders
- Offline support with background sync
- Install prompt banner with iOS fallback
- PIN change and notification settings in user profile
- Yesterday backfill with streak recalculation
- Undo for task completions (until end of next day)
- Teamwork bonus scaling by number of partners
- Role badges on login page

### Fixed
- Children excluded from approval workflow
- Docker build compatibility with Prisma enums
- UTC consistency in calendar and scheduling

## [1.0.0] - 2026-04-04

### Added
- Task management with points and categories
- Streak system with tier bonuses
- Achievement system with unlockable badges
- Reward store for redeeming points
- Statistics page with charts and leaderboard
- Activity feed with shared completions
- Recurring tasks (daily, weekly, monthly)
- PIN-based authentication
- Setup wizard for first-run configuration
- Docker deployment with SQLite
- GitHub Actions CI/CD pipeline
- In-app settings for game configuration
