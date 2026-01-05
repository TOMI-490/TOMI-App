import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: '40%',
    width: '100%',
  },
  map: {
    flex: 1,
  },
  noMapPlaceholder: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMapText: {
    fontSize: 60,
    marginBottom: 10,
  },
  trackingText: {
    fontSize: 16,
    color: '#4A90E2',
    marginTop: 10,
  },
  workoutTypeName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  statsContainer: {
    flex: 1,
    padding: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  xpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
  },
  xpValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E65100',
  },
  statusRow: {
    alignItems: 'center',
    marginTop: 20,
  },
  statusText: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: '600',
  },
  controlsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  controlButton: {
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  endButton: {
    backgroundColor: '#E74C3C',
  },
  controlButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
