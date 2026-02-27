---
description: Add a new page to the servicestuff technician mobile app
---

# New Mobile Page Workflow

Step-by-step process for adding a new page/screen to the servicestuff technician app.

## 1. Add Route Path to `types.ts`
Open `d:\suzuky\servicestuff\types.ts` and add to the `RoutePath` enum:
```typescript
export enum RoutePath {
    // ... existing paths
    NEW_PAGE = '/new-page',
}
```

## 2. Create the Page Component
Create `d:\suzuky\servicestuff\pages\NewPage.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { TechnicianAPI } from '../services/api';
import { TopBar } from '../components/TopBar';

const NewPage: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const { data: response } = await TechnicianAPI.newEndpoint();
            setData(response);
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
            <TopBar title="New Page" />
            <div style={{ padding: '1rem' }}>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    // Render your data
                    <div>{JSON.stringify(data)}</div>
                )}
            </div>
        </div>
    );
};

export default NewPage;
```

## 3. Add Route in `App.tsx`
Open `d:\suzuky\servicestuff\App.tsx` and add the route:

```typescript
import NewPage from './pages/NewPage';

// Inside the router configuration:
<Route path={RoutePath.NEW_PAGE} element={<NewPage />} />
```

## 4. Add Navigation Link (if needed)
Open `d:\suzuky\servicestuff\components\Sidebar.tsx` and add a menu item:

```typescript
{ icon: <IconComponent size={20} />, label: 'New Page', path: RoutePath.NEW_PAGE },
```

## 5. Add API Endpoint (if needed)
If the page needs a new backend endpoint:
1. Follow the `/new-api-route` workflow to create the portal endpoint
2. Add the API method to `d:\suzuky\servicestuff\services\api.ts`:
   ```typescript
   newEndpoint: (params?: any) => api.get('/new-endpoint', { params }),
   ```

## 6. Add Types (if needed)
Add any new interfaces to `d:\suzuky\servicestuff\types.ts`:
```typescript
export interface NewDataType {
    id: string;
    name: string;
    // ... fields matching the API response
}
```

## 7. Test
1. Start all services (see `/local-dev` workflow)
2. Open `http://localhost:5173`
3. Navigate to the new page
4. Verify data loads correctly
5. Test on mobile (if Capacitor build):
   ```powershell
   cd d:\suzuky\servicestuff
   npm run build
   npx cap sync android
   npx cap open android
   ```
