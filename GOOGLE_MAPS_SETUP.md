# Google Maps Integration Setup

This project uses Google Maps JavaScript API for location selection and geocoding.

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Places API** (optional, for better address suggestions)
4. Go to "Credentials" and create an API key
5. Restrict the API key (recommended):
   - Application restrictions: HTTP referrers
   - Add your domain (e.g., `localhost:3000/*`, `yourdomain.com/*`)
   - API restrictions: Select "Restrict key" and choose the APIs you enabled

### 2. Configure Environment Variable

Create a `.env.local` file in the root of your project (if it doesn't exist):

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual Google Maps API key.

### 3. Restart Development Server

After adding the environment variable, restart your Next.js development server:

```bash
npm run dev
```

## Features

The Google Maps integration provides:

- **Interactive Map**: Users can click or drag to select location
- **Current Location**: "Use My Location" button to get user's current position
- **Auto-fill Address**: Automatically fills address fields from selected location
- **Geocoding**: Converts coordinates to readable addresses
- **Reverse Geocoding**: Extracts city, state, and pincode from coordinates

## Usage

The `LocationPicker` component is used in:
- Customer Addresses page (`/customer/addresses`)
- Checkout page (`/checkout`)

When users select a location on the map or use their current location, the address fields are automatically populated.

## Troubleshooting

### Map not loading
- Check if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set correctly
- Verify the API key is enabled and has the correct APIs enabled
- Check browser console for error messages

### Location permission denied
- Users need to grant location permissions in their browser
- The component will show an error message if permission is denied

### API key restrictions
- If you're testing locally, make sure `localhost:3000/*` is in your API key restrictions
- For production, add your production domain to the restrictions

