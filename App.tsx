import React from 'react';
import {
  ActivityIndicator,
  Button,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Linking,
} from 'react-native';
import {useGoogleFit} from './src/useGoogleFit';
import {useAppleHealthKit} from './src/useAppleKit';

export default function HealthKitTest() {
  const {
    steps: googleSteps,
    stepsLoaded: googleStepsLoaded,
    isPermissionGranted: isGooglePermissionsGranted,
    requestPermission: requestGooglePermission,
    error: googleError,
    isLoading: isGoogleLoading,
  } = useGoogleFit();

  const {
    steps: appleSteps,
    stepsLoaded: appleStepsLoaded,
    isPermissionGranted: isApplePermissionsGranted,
    requestPermission: requestApplePermission,
    error: appleError,
    isLoading: isAppleLoading,
  } = useAppleHealthKit();

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    }
  };

  return (
    <SafeAreaView>
      {isGoogleLoading || isAppleLoading ? (
        <ActivityIndicator
          testID="loading-indicator"
          size="large"
          color="#0000ff"
        />
      ) : (
        <View style={styles.contianer}>
          {googleError && <Text>Error: {googleError}</Text>}
          {appleError && <Text>Error: {appleError}</Text>}
          {Platform.OS === 'ios' && isApplePermissionsGranted && (
            <Button
              title="Enable Apple HealthKit Permissions"
              onPress={() => {
                requestApplePermission();
                openAppSettings(); // Navigate to app settings
              }}
            />
          )}
          {Platform.OS === 'android' && !isGooglePermissionsGranted && (
            <Button
              title="Enable Google Fit Permissions"
              onPress={requestGooglePermission}
            />
          )}
          {Platform.OS === 'ios' &&
            isApplePermissionsGranted &&
            appleStepsLoaded && (
              <View>
                <Text style={styles.bold}>
                  Apple HealthKit Steps data:{' '}
                  {appleSteps && appleSteps[0]?.value
                    ? appleSteps[0].value
                    : 'No data'}
                </Text>
              </View>
            )}
          {Platform.OS === 'android' &&
            isGooglePermissionsGranted &&
            googleStepsLoaded && (
              <View>
                <Text style={styles.bold}>
                  Google Fit Steps data: {googleSteps ? googleSteps : 'No data'}
                </Text>
              </View>
            )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bold: {
    fontWeight: 'bold',
  },
  contianer: {
    padding: 12,
  },
});
