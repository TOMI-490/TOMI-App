import { StyleSheet } from 'react-native';

export const progressRingsStyles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    flex: 1,
  },
  svgContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  ringTarget: {
    fontSize: 12,
    color: '#999',
  },
  ringLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    marginTop: 4,
  },
  ringUnit: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
});
