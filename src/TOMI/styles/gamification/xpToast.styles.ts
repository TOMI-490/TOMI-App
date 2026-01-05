import { StyleSheet } from 'react-native';

export const xpToastStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  icon: {
    fontSize: 24,
    marginRight: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
