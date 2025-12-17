# Firebase Realtime Database Strings Setup

This document explains how to set up and manage app strings in Firebase Realtime Database.

## Firebase Database Structure

Create the following structure in your Firebase Realtime Database:

```
app_strings/
├── navigation/
│   ├── home: "Home"
│   ├── orders: "Orders"
│   ├── menu: "Menu"
│   └── profile: "Profile"
├── home/
│   ├── welcome: "Good Morning!"
│   ├── dashboardOverview: "Dashboard Overview"
│   ├── monthlyRevenue: "Monthly Revenue"
│   ├── revenueSubtext: "Revenue in last 30 days"
│   ├── inventorySummary: "Inventory Summary"
│   ├── activeItems: "Active Items"
│   ├── outOfStock: "Out of Stock"
│   ├── recentOrders: "Recent Orders"
│   ├── seeAll: "See All"
│   ├── noRecentOrders: "No recent orders"
│   ├── quickActions: "Quick Actions"
│   ├── manageMenu: "Manage Menu"
│   ├── viewOrders: "View Orders"
│   ├── settings: "Settings"
│   ├── onlineStatus: "Online - Accepting Orders"
│   ├── offlineStatus: "Offline - Not Accepting Orders"
│   └── loadingDashboard: "Loading dashboard..."
├── orders/
│   ├── totalOrders: "Total Orders"
│   ├── confirmed: "Confirmed"
│   ├── cancelled: "Cancelled"
│   ├── pending: "Pending"
│   ├── delivered: "Delivered"
│   ├── totalIncome: "Total Income"
│   ├── onlineIncome: "Online Income"
│   └── codIncome: "COD Income"
├── profile/
│   ├── editProfile: "Edit Profile"
│   ├── restaurantSettings: "Restaurant Settings"
│   ├── paymentSettings: "Payment Settings"
│   ├── orderHistory: "Order History"
│   ├── notifications: "Notifications"
│   ├── helpSupport: "Help & Support"
│   ├── about: "About"
│   ├── logout: "Logout"
│   ├── totalOrders: "Total Orders"
│   ├── totalRevenue: "Total Revenue"
│   ├── avgRating: "Avg Rating"
│   └── contactInformation: "Contact Information"
├── menu/
│   ├── myMenu: "My Menu"
│   ├── itemsAvailable: "items available"
│   ├── allItems: "All Items"
│   ├── addNewItem: "Add New Item"
│   ├── noItemsInCategory: "No items in this category"
│   └── loadingMenu: "Loading menu..."
└── common/
    ├── loading: "Loading..."
    ├── error: "Error"
    ├── success: "Success"
    ├── cancel: "Cancel"
    ├── save: "Save"
    ├── delete: "Delete"
    ├── edit: "Edit"
    ├── add: "Add"
    ├── update: "Update"
    ├── close: "Close"
    ├── back: "Back"
    ├── next: "Next"
    ├── done: "Done"
    ├── yes: "Yes"
    ├── no: "No"
    └── ok: "OK"
```

## How to Set Up in Firebase Console

1. Go to Firebase Console → Realtime Database
2. Click "Create Database" or select your existing database
3. Start in test mode (you can secure it later)
4. Create a new node called `app_strings`
5. Add all the nested nodes and values as shown above

## JSON Import Format

You can also import this JSON directly into Firebase:

```json
{
  "app_strings": {
    "navigation": {
      "home": "Home",
      "orders": "Orders",
      "menu": "Menu",
      "profile": "Profile"
    },
    "home": {
      "welcome": "Good Morning!",
      "dashboardOverview": "Dashboard Overview",
      "monthlyRevenue": "Monthly Revenue",
      "revenueSubtext": "Revenue in last 30 days",
      "inventorySummary": "Inventory Summary",
      "activeItems": "Active Items",
      "outOfStock": "Out of Stock",
      "recentOrders": "Recent Orders",
      "seeAll": "See All",
      "noRecentOrders": "No recent orders",
      "quickActions": "Quick Actions",
      "manageMenu": "Manage Menu",
      "viewOrders": "View Orders",
      "settings": "Settings",
      "onlineStatus": "Online - Accepting Orders",
      "offlineStatus": "Offline - Not Accepting Orders",
      "loadingDashboard": "Loading dashboard..."
    },
    "orders": {
      "totalOrders": "Total Orders",
      "confirmed": "Confirmed",
      "cancelled": "Cancelled",
      "pending": "Pending",
      "delivered": "Delivered",
      "totalIncome": "Total Income",
      "onlineIncome": "Online Income",
      "codIncome": "COD Income"
    },
    "profile": {
      "editProfile": "Edit Profile",
      "restaurantSettings": "Restaurant Settings",
      "paymentSettings": "Payment Settings",
      "orderHistory": "Order History",
      "notifications": "Notifications",
      "helpSupport": "Help & Support",
      "about": "About",
      "logout": "Logout",
      "totalOrders": "Total Orders",
      "totalRevenue": "Total Revenue",
      "avgRating": "Avg Rating",
      "contactInformation": "Contact Information"
    },
    "menu": {
      "myMenu": "My Menu",
      "itemsAvailable": "items available",
      "allItems": "All Items",
      "addNewItem": "Add New Item",
      "noItemsInCategory": "No items in this category",
      "loadingMenu": "Loading menu..."
    },
    "common": {
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",
      "cancel": "Cancel",
      "save": "Save",
      "delete": "Delete",
      "edit": "Edit",
      "add": "Add",
      "update": "Update",
      "close": "Close",
      "back": "Back",
      "next": "Next",
      "done": "Done",
      "yes": "Yes",
      "no": "No",
      "ok": "OK"
    }
  }
}
```

## How It Works

1. **StringsProvider**: Loads strings from Firebase on app start
2. **Caching**: Strings are cached in AsyncStorage for offline use
3. **Real-time Updates**: Changes in Firebase are reflected immediately in the app
4. **Fallback**: If Firebase is unavailable, cached or default strings are used
5. **Usage**: Use `getString('path.to.string')` in any component

## Usage in Components

```javascript
import { useAppStrings } from '../../hooks/useAppStrings';

const MyComponent = () => {
  const { getString } = useAppStrings();
  
  return (
    <Text>{getString('navigation.home')}</Text>
  );
};
```

## Adding New Strings

1. Add the string to Firebase Realtime Database under `app_strings`
2. Add it to the `defaultStrings` object in `StringsProvider.js` as a fallback
3. Use `getString('path.to.newString')` in your components

## Security Rules

Make sure your Firebase Realtime Database rules allow read access:

```json
{
  "rules": {
    "app_strings": {
      ".read": true,
      ".write": false  // Only allow writes from admin/console
    }
  }
}
```

