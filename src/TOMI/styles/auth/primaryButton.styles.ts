import { StyleSheet } from 'react-native';

export const primaryButtonStyles = StyleSheet.create({
  button: {
    height: 50,
    backgroundColor: '#2C2C2C',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
