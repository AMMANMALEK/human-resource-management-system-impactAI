# Dashboard Implementation Documentation

## 1. Overview

The dashboard system provides role-specific views for Administrators and Employees. It is built using a component-based architecture with shared UI elements to ensure consistency and maintainability.

## 2. Architecture

### Directory Structure
```
src/
  components/
    dashboard/
      StatsCard.tsx       # Reusable statistic card
      DashboardSkeleton.tsx # Loading states
  pages/
    admin/
      AdminDashboard.tsx  # Admin view
    employee/
      EmployeeDashboard.tsx # Employee view
  services/
    dashboardService.ts   # Mock API layer
```

### Data Flow
1. **Component Mount**: Dashboard page (`AdminDashboard` or `EmployeeDashboard`) mounts.
2. **Data Fetch**: `useEffect` hook calls `dashboardService.getAdminStats()` or `getEmployeeStats()`.
3. **Loading State**: `isLoading` is set to true; `DashboardSkeleton` is rendered.
4. **Service Layer**: `dashboardService` simulates network delay (800ms) and returns typed mock data.
5. **Render**: State is updated, and the dashboard renders `StatsCard` grid and Quick Actions.
6. **Error Handling**: Try-catch block catches errors and displays a retry button.

## 3. Component Usage

### StatsCard
Displays a single statistic with an icon, value, and optional trend.

```tsx
<StatsCard
  title="Total Requests"
  value={123}
  icon={FileText}
  variant="info" // 'default' | 'success' | 'warning' | 'danger' | 'info'
  trend={{ 
    value: 12, 
    label: "vs last month", 
    isPositive: true 
  }}
  onClick={() => console.log('Clicked')}
/>
```

### DashboardSkeleton
Provides a loading placeholder matching the dashboard layout.

```tsx
if (isLoading) return <DashboardSkeleton />;
```

## 4. Responsive Behavior

The dashboards use a mobile-first grid system:

- **Mobile (< 640px)**: 
  - Stats Cards: 1 column (stack vertically)
  - Quick Actions: 1 column
- **Tablet (640px - 1024px)**:
  - Stats Cards: 2 columns
  - Quick Actions: 2 columns
- **Desktop (> 1024px)**:
  - Stats Cards: 4 columns
  - Quick Actions: Side-by-side with Recent Activity

## 5. Mock Data Service

`src/services/dashboardService.ts` provides:

- `getAdminStats()`: Returns `AdminStats` interface.
- `getEmployeeStats()`: Returns `EmployeeStats` interface.

To connect to a real API, replace the `setTimeout` promise with an `axios` or `fetch` call.

## 6. Testing

Tests are located in `__tests__` directories co-located with components and pages.
- `StatsCard.test.tsx`: Verifies rendering and props.
- `AdminDashboard.test.tsx`: Verifies data fetching and loading states.
- `EmployeeDashboard.test.tsx`: Verifies employee-specific data rendering.
