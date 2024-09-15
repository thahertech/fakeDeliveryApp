# React Native Navigation App

## Overview

This React Native application integrates a map view with Google Places Autocomplete to allow users to set destinations and view routes. It displays the current location and destination on the map and provides real-time updates on the route. The app also includes a night mode style for the map and interactive elements to enhance the user experience.

## Screenshots

  <img src="https://github.com/user-attachments/assets/bbb6a19b-ca44-47fe-bd6d-92423e511486" alt="Simulator Screenshot - iPhone 15 - 2024-09-15 at 18 55 38" width="30%" />
  <img src="https://github.com/user-attachments/assets/2dd4d4aa-d828-4e54-8ec7-f5d1d4ccc94a" alt="Simulator Screenshot - iPhone 15 - 2024-09-15 at 18 57 52" width="30%" />
  <img src="https://github.com/user-attachments/assets/c7b8afdf-57db-4a9e-b81f-0c74b3278c45" alt="Simulator Screenshot - iPhone 15 - 2024-09-15 at 18 59 41" width="30%" />

## Features

- **Map Integration**: Uses `react-native-maps` to display maps with custom night mode styling.
- **Current Location**: Displays the user's current location on the map with real-time updates.
- **Destination Search**: Allows users to search for and set a destination using `react-native-google-places-autocomplete`.
- **Route Display**: Shows the route between the current location and destination with a polyline.
- **Estimated Time**: Displays the estimated time of arrival based on the route.
- **Custom Marker**: Uses a custom car image as the marker for the current location.
- **Responsive Layout**: Adapts to keyboard visibility and screen size.

## Installation

1. **Clone the Repository**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2. **Install Dependencies**:
    Make sure you have `Node.js` and `npm` or `yarn` installed. Run:
    ```bash
    npm install
    # or
    yarn install
    ```

3. **Expo CLI**:
    If you don't have Expo CLI installed, install it globally:
    ```bash
    npm install -g expo-cli
    ```

4. **Start the Project**:
    ```bash
    expo start
    ```
    This will open a development server in your browser. You can use the Expo Go app on your mobile device to scan the QR code and view the app.

## API Key Configuration

Replace the placeholder API key in `App.js` with your own Google Maps API key:
```javascript
const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

```


```Usage

Set Current Location: The app will automatically request permission to access the user's location and show it on the map.
Search for Destination: Use the Google Places Autocomplete to search for and set a destination. The route will be calculated and displayed on the map.
View Route and Estimated Time: The app will show the route between the current location and the destination, along with the estimated time of arrival.
Components

MapView: Displays the map with custom night mode styling.
Marker: Shows the user's current location and destination on the map.
Polyline: Represents the route between the current location and destination.
GooglePlacesAutocomplete: Provides a search interface for entering destinations.
KeyboardAvoidingView: Adjusts the layout to avoid the keyboard overlapping the input fields.
Styling

The app uses custom styles for the map, input fields, result display, and buttons. Styles are defined in the styles object within App.js.

Troubleshooting

Location Permission Issues: Ensure that location permissions are granted for the app.
API Key Errors: Verify that your Google Maps API key is correct and has the necessary permissions for Directions API and Places API.
Contributing

Feel free to open issues or submit pull requests to contribute to the project. Please follow standard coding conventions and include tests where applicable.
