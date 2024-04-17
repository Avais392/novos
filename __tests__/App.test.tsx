import {Platform, Linking} from 'react-native';
import React from 'react';
import HealthKitTest from './HealthKitTest';
import {render, waitFor, fireEvent} from '@testing-library/react-native';

jest.mock('./src/useGoogleFit', () => ({
  useGoogleFit: jest.fn(() => ({
    steps: 1000,
    stepsLoaded: true,
    isPermissionGranted: true,
    requestPermission: jest.fn(),
    error: null,
    isLoading: false,
  })),
}));

jest.mock('./src/useAppleKit', () => ({
  useAppleHealthKit: jest.fn(() => ({
    steps: 1500,
    stepsLoaded: true,
    isPermissionGranted: true,
    requestPermission: jest.fn(),
    error: null,
    isLoading: false,
  })),
}));

describe('HealthKitTest', () => {
  it('renders step count data when loaded', async () => {
    const {getByText} = render(<HealthKitTest />);
    await waitFor(() => {
      const googleStepText = getByText('Google Fit Steps data: 1000');
      const appleStepText = getByText('Apple HealthKit Steps data: 1500');
      if (Platform.OS === 'ios') {
        expect(appleStepText).toBeTruthy();
      } else {
        expect(googleStepText).toBeTruthy();
      }
    });
  });

  it('renders loading indicator while asking for permissions', async () => {
    const {getByTestId} = render(<HealthKitTest />);
    const loadingIndicator = getByTestId('loading-indicator');
    expect(loadingIndicator).toBeTruthy();
  });

  it('displays error message and button to request permissions again for iOS', async () => {
    jest.spyOn(Platform, 'OS', 'get').mockReturnValue('ios');
    const {getByText, getByRole} = render(<HealthKitTest />);
    const errorMessage = getByText(
      'Error: Permission denied for Apple HealthKit',
    );
    const button = getByRole('button', {
      name: 'Enable Apple HealthKit Permissions',
    });
    expect(errorMessage).toBeTruthy();
    expect(button).toBeTruthy();
    fireEvent.press(button);
    expect(Linking.openURL).toHaveBeenCalledWith('app-settings:');
  });

  it('renders loading indicator while checking for step count', async () => {
    const {queryByTestId} = render(<HealthKitTest />);
    const loadingIndicator = queryByTestId('loading-indicator');
    expect(loadingIndicator).toBeNull();
  });

  it('requests permission if not provided when checking for step count', async () => {
    jest.spyOn(Platform, 'OS', 'get').mockReturnValue('android');
    const {getByRole} = render(<HealthKitTest />);
    const button = getByRole('button', {name: 'Enable Google Fit Permissions'});
    fireEvent.press(button);
    // Add assertions for the permission request action
  });

  it('displays error message in case of any error', async () => {
    const {getByText} = render(<HealthKitTest />);
    // Simulate an error condition in the mocked custom hooks
    // Verify that the error message is displayed
  });
});
