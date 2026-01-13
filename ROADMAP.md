# Northstar Roadmap

## Product Vision

A beautiful, simple habit tracker that helps you build consistency across Mind, Body, and Soul. Visual progress through GitHub-style activity graphs that make showing up every day feel rewarding.

## Design Philosophy

- **Amazing UX without over-animation** - Thoughtful interactions, not overwhelming effects
- **No UI overload** - Clean, focused interface that respects user attention
- **Micro-animations for delight** - Confetti and celebration effects for meaningful moments (core idea)
- **Simplicity first** - Never complicate the core loop: open → check boxes → see progress

---

## Planned Features

### 🎯 Priority Features

#### 1. Streaks & Milestones

- Show current streak count for each habit
- Highlight longest streak achieved
- Visual celebration when hitting milestones (7, 30, 100, 365 days)
- Simple metric that drives powerful motivation

#### 2. Daily Completion Ring

- Circular progress indicator showing today's completion %
- Positioned prominently on home page
- Satisfying visual feedback for completing all habits

#### 3. Mood Tracker Card

**Dashboard Implementation:**

- Small survey card in dashboard grid
- User rates their mood today out of 5 stars/levels
- Features a smiley face visual
- **Smart transformation:** Once user completes input, card transforms into a ring/graph showing happiness average for the week
- **Toggle view:** Button to switch between week view and year view
- Subtle, non-intrusive wellness check-in

#### 5. Export Your Year

- Download activity graph as a beautiful image
- Share your consistency journey
- Great for personal reflection or social motivation

#### 6. Smooth Micro-interactions

- **Confetti/particle effect** when completing all daily habits (CORE FEATURE)
- Subtle haptic feedback on mobile
- Gentle sound toggle option for check-ins
- Thoughtful, not overwhelming

#### 7. Weekly Reflection View

- Simple 7-day summary each Sunday/Monday
- "You completed 85% of your habits this week"
- Encourages sustainable pacing vs daily anxiety

#### 8. Keyboard Shortcuts

- `1`, `2`, `3` to toggle first three habits
- `n` for new habit
- `Esc` to close modals
- Power user efficiency without complexity

#### 9. Habit Reordering

- Drag to reorder habits in your preferred sequence
- Do morning routines first, evening habits last
- Simple priority without complex scheduling

#### 10. Archive vs Delete

- Archive completed/paused habits instead of deleting
- Preserves history and data
- "I finished this 30-day challenge" → archive
- Clean UI without losing progress

#### 12. Month View Toggle

- Switch between yearly and monthly graph views
- Monthly gives more detail, yearly gives big picture
- Simple tab/button toggle

---

## What We're NOT Building

To keep Northstar simple and focused:

❌ Social features, leaderboards, friend comparisons  
❌ Complex point systems, levels, badges  
❌ Complex scheduling (M/W/F habits, specific frequencies)  
❌ Push notifications (keep it pull-based, intentional)  
❌ Third-party integrations (Apple Health, Strava, etc.)  
❌ Multiple users/accountability partners  
❌ Mandatory journaling or extensive text input

---

## Core Loop (Sacred)

1. User opens Northstar
2. User sees today's habits + progress graph
3. User checks off completed habits
4. User sees graph light up with color
5. User feels accomplished and motivated

**Everything we build must enhance, not complicate, this loop.**
