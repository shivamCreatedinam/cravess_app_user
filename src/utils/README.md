# Utils - Common Utilities

## Toast Notifications

Global toast notification functions that can be called from anywhere in the app (not just React components).

### Usage

```typescript
import { showToast, showSuccessToast, showErrorToast, showInfoToast } from '../utils/common';

// Basic usage
showToast('Operation completed', 'success');
showToast('Something went wrong', 'error');
showToast('Information message', 'info');

// With custom title
showToast('User logged in successfully', 'success', 'Welcome Back');

// With custom duration
showToast('Message will show for 5 seconds', 'info', 'Info', 5000);

// Convenience functions
showSuccessToast('Data saved successfully');
showErrorToast('Failed to save data', 'Error');
showInfoToast('New update available', 'Update');
```

### API

#### `showToast(message, type, title?, duration?)`
Main function to show toast notifications.

- `message` (string, required): The message to display
- `type` ('success' | 'error' | 'info', default: 'info'): Type of toast
- `title` (string, optional): Custom title (defaults based on type)
- `duration` (number, optional): Duration in milliseconds (default: 4000)

#### `showSuccessToast(message, title?, duration?)`
Convenience function for success messages.

#### `showErrorToast(message, title?, duration?)`
Convenience function for error messages.

#### `showInfoToast(message, title?, duration?)`
Convenience function for info messages.

### Examples

```typescript
// In API calls
import { showErrorToast, showSuccessToast } from '../utils/common';

try {
  await saveData();
  showSuccessToast('Data saved successfully');
} catch (error) {
  showErrorToast('Failed to save data', 'Error');
}

// In utility functions
import { showInfoToast } from '../utils/common';

export const validateForm = (data) => {
  if (!data.email) {
    showErrorToast('Email is required');
    return false;
  }
  showSuccessToast('Form is valid');
  return true;
};

// In Redux actions/thunks
import { showToast } from '../utils/common';

export const fetchUserData = () => async (dispatch) => {
  try {
    const data = await api.getUser();
    dispatch(setUser(data));
    showToast('User data loaded', 'success');
  } catch (error) {
    showToast('Failed to load user data', 'error');
  }
};
```

### Notes

- Toast component must be in `App.tsx` (already added)
- These functions work globally - no need for hooks or context
- Can be called from anywhere: components, utilities, API calls, Redux, etc.

