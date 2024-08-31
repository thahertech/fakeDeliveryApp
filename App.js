import React, { useState, useEffect, useRef } from 'react';
import { API_KEY } from 'react-native-dotenv';

const apiKey = API_KEY;

import {
  StyleSheet,
  View,
  TextInput,
  Text,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  Image,
} from 'react-native';
import MapView, { Marker, AnimatedRegion, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


const nightModeStyle = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#424242"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#424242"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  }
];

export default function App() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [destination, setDestination] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [carPosition, setCarPosition] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [showInputs, setShowInputs] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const { height: windowHeight } = useWindowDimensions();
  
  const mapRef = useRef(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      try {
        let location = await Location.getCurrentPositionAsync({});
        const currentCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setCurrentLocation(currentCoords);
        const animatedRegion = new AnimatedRegion(currentCoords);
        setCarPosition(animatedRegion);

        // Zoom to current position
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: currentCoords.latitude,
            longitude: currentCoords.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          }, 1000);
        }

        const watch = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (newLocation) => {
            const { latitude, longitude } = newLocation.coords;
            animatedRegion.timing({
              latitude,
              longitude,
              duration: 1000,
            }).start();
            setCurrentLocation({ latitude, longitude });
          }
        );
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  const handleSetDestination = async (data, details) => {
    const location = details.geometry.location;
    const destinationCoords = {
      latitude: location.lat,
      longitude: location.lng,
    };

    setDestination(destinationCoords);
    setAddress(data.description);
    setShowInputs(false);
    Keyboard.dismiss();

    try {
      const routeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${destinationCoords.latitude},${destinationCoords.longitude}&key=${API_KEY}`
      );
      const routeData = await routeResponse.json();

      if (routeData.routes.length) {
        const points = routeData.routes[0].overview_polyline.points;
        const routeCoords = decodePolyline(points);
        setRouteCoords(routeCoords);
        setEstimatedTime(routeData.routes[0].legs[0].duration.text);

      } else {
        Alert.alert('Error', 'No route found');
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const decodePolyline = (t, e = 5) => {
    let points = [];
    for (
      let step, index = 0, lat = 0, lng = 0;
      index < t.length;

    ) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (31 & b) << shift;
        shift += 5;
      } while (b >= 32);
      lat += result & 1 ? ~(result >> 1) : result >> 1;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (31 & b) << shift;
        shift += 5;
      } while (b >= 32);
      lng += result & 1 ? ~(result >> 1) : result >> 1;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={nightModeStyle} // Apply night mode style

        initialRegion={{
          latitude: 65.01236, // Default to Oulu
          longitude: 25.46816, // Default to Oulu
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
          
        }}
        region={
          currentLocation && {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }
        }
      >
        {currentLocation && carPosition && (
          <Marker.Animated
            coordinate={carPosition}
            title="Sijaintisi"
            tracksViewChanges={true}
          >
            <Image
              source={require('./pngtree-car.png')} //My Location Car image
              style={styles.customMarker}
            />
          </Marker.Animated>
        )}
        {destination && (
          <Marker
            coordinate={destination}
            title="Destination"
            pinColor="red"
          />
        )}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="blue"
            strokeWidth={3}
          />
        )}
      </MapView>

      <View
        style={[styles.bottomBar, { marginBottom: keyboardHeight }]}
      >
        <View style={styles.inputContainer}>
          {showInputs ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Nimi"
                placeholderTextColor="#aaa"
                value={name}
                onChangeText={setName}
              />
              <GooglePlacesAutocomplete
                placeholder="Osoite"
                minLength={2}
                fetchDetails={true}
                onPress={handleSetDestination}
                query={{
                  key: API_KEY,
                  language: 'en',
                  components: 'country:fi',
                }}
                styles={{
                  textInput: styles.input,
                  listView: { backgroundColor: 'white' },
                }}
                enablePoweredByContainer={false}
                nearbyPlacesAPI="GooglePlacesSearch"
                debounce={200}
              />
            </>
          ) : (
            <View style={styles.resultContainer}>
            <Text style={styles.resultText}>{'Tilaaja'}</Text><Text style={styles.resultLabel}>{name}</Text>
            <Text style={styles.resultText}>{'Osoite'}</Text><Text style={styles.resultLabel}>{address}</Text>
              <Text style={styles.resultText}>{'Saapumisaika'}</Text><Text style={styles.resultLabel}>{estimatedTime}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={() => Alert.alert('Numeroa ei ole saatavilla!')}
              >
                <Text style={styles.buttonText}>Soita tilaajalle</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#333',
    padding: 20,
    borderTopWidth: 3,
    maxHeight: 250,
    borderRadius:15,
    borderTopColor: '#555',
  },

  input: {
    height: 40,
    borderColor: '#555',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
    color: 'white',
    backgroundColor: '#444',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 15,
    marginTop: -2,
    color: 'white',
    marginBottom: 5,
    textAlign:'left',
    fontFamily:'arial',
    fontWeight:'500',
    letterSpacing:'0.3'
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: '300',
    color:'white',
    marginBottom: 10,
    fontFamily:'Arial'

  },
  button: {
    marginTop: 10,
    marginBottom: 40,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    textAlign: 'center',
    alignItems:'center',
    alignContent: 'center',
    justifyContent:'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    alignItems:'center',
    alignContent: 'center',
    justifyContent:'center',
  },
  customMarker: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
});
