import { StyleSheet } from 'react-native';
import { F } from '../../constants/fonts';

export const passwordStrengthIndicatorStyles = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: F.semiBold,
    marginTop: 4,
  },
});
