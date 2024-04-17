import {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import GoogleFit, {Scopes} from 'react-native-google-fit';
export const useGoogleFit = () => {
  const [steps, setSteps] = useState(null);
  const [stepsLoaded, setStepsLoaded] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const options = {
    scopes: [
      Scopes.FITNESS_ACTIVITY_READ,
      Scopes.FITNESS_ACTIVITY_WRITE,
      Scopes.FITNESS_BODY_READ,
      Scopes.FITNESS_BODY_WRITE,
      Scopes.FITNESS_BLOOD_PRESSURE_READ,
      Scopes.FITNESS_BLOOD_PRESSURE_WRITE,
      Scopes.FITNESS_BLOOD_GLUCOSE_READ,
      Scopes.FITNESS_BLOOD_GLUCOSE_WRITE,
      Scopes.FITNESS_NUTRITION_WRITE,
      Scopes.FITNESS_SLEEP_READ,
    ],
  };

  const requestPermission = () => {
    if (Platform.OS === 'android') {
      GoogleFit.authorize(options)
        .then(authResult => {
          if (authResult.success) {
            console.log('Google Fit authorization success');
            setIsPermissionGranted(true);
          } else {
            setError(
              'Google Fit permission denied. Please enable permissions in the app settings.',
            );
          }
        })
        .catch(err => {
          setError('Error requesting Google Fit permission: ' + err);
        });
    }
  };

  const fetchStepsData = async () => {
    if (isPermissionGranted) {
      try {
        const today = new Date();
        const res = await GoogleFit.getDailySteps({
          startDate: today.toISOString(),
          endDate: today.toISOString(),
        });

        if (res.length > 0) {
          const stepsData = res.find(
            data => data.source === 'com.google.android.gms:estimated_steps',
          );
          if (stepsData) {
            setSteps(stepsData?.steps[0]?.value);
            setStepsLoaded(true);
            setError(null);
          }
        }
      } catch (error) {
        setError('Error fetching Google Fit step count: ' + error);
      }
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      GoogleFit.checkIsAuthorized().then(authorized => {
        if (authorized) {
          setIsPermissionGranted(true);
        } else {
          requestPermission();
        }
      });
    }
  }, []);

  useEffect(() => {
    if (isPermissionGranted) {
      fetchStepsData(); // Fetch initial data

      const interval = setInterval(() => {
        fetchStepsData(); // Fetch data at regular intervals
      }, 60000); // Fetch data every 1 minute (adjust interval as needed)

      return () => clearInterval(interval); // Clean up interval on component unmount
    }
  }, [fetchStepsData, isPermissionGranted]);

  useEffect(() => {
    setIsLoading(false);
  }, [isPermissionGranted, error]);

  return {
    steps,
    stepsLoaded,
    isPermissionGranted,
    requestPermission,
    error,
    isLoading,
  };
};
