import {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from 'react-native-health';
export const useAppleHealthKit = () => {
  const permissions = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.SleepAnalysis,
        AppleHealthKit.Constants.Permissions.AppleExerciseTime,
        AppleHealthKit.Constants.Permissions.Weight,
        AppleHealthKit.Constants.Permissions.StepCount,
      ],
    },
  } as HealthKitPermissions;

  const [steps, setSteps] = useState(null);
  const [stepsLoaded, setStepsLoaded] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const requestPermission = () => {
    if (Platform.OS === 'ios') {
      AppleHealthKit.initHealthKit(
        permissions,
        (initError: string, results) => {
          console.log('ios permission', initError, results);
          if (initError) {
            setError('Apple HealthKit initialization error: ' + initError);
          } else {
            setIsPermissionGranted(true);
          }
        },
      );
    }
  };

  const fetchStepsData = () => {
    if (isPermissionGranted) {
      try {
        const today = new Date();
        const lastWeekDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - 1,
        );
        const options = {
          startDate: lastWeekDate.toISOString(),
          endDate: today.toISOString(),
          bucketUnit: 'DAY',
          bucketInterval: 1,
        };

        AppleHealthKit.getDailyStepCountSamples(
          options,
          (fetchError: string, results: HealthValue[]) => {
            if (fetchError) {
              setError(
                'Error fetching Apple HealthKit step count: ' + fetchError,
              );
            } else {
              setSteps(results);
              setStepsLoaded(true);
              setError(null);
            }
          },
        );
      } catch (error) {
        setError('Error fetching Apple HealthKit step count: ' + error);
      }
    }
  };

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleHealthKit.getAuthStatus(permissions, (authError, results) => {
        console.log('ios auth', authError, results);
        if (results) {
          console.log('ios auth--', authError, results);
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
