import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';

interface UserAvatarProps {
  avatarUrl?: string | null;
  displayName: string;
  size?: number;
  style?: ViewStyle;
}

const RADIUS_RATIO = 0.22;

const isHttpUrl = (url: unknown): url is string =>
  typeof url === 'string' && url.length > 4 && url.startsWith('http');

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  displayName,
  size = 44,
  style,
}) => {
  const [failed, setFailed] = useState(false);
  const r = size * RADIUS_RATIO;
  const box = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: r,
  };

  if (isHttpUrl(avatarUrl) && !failed) {
    return (
      <View style={[s.wrap, s.bg, box, style]}>
        <Image
          source={{ uri: avatarUrl }}
          style={[{ width: size, height: size, borderRadius: r }]}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      </View>
    );
  }

  return (
    <View style={[s.wrap, s.bg, box, style]}>
      <Text style={[s.initials, { fontSize: size * 0.36 }]}>
        {getInitials(displayName)}
      </Text>
    </View>
  );
};

const s = StyleSheet.create({
  wrap: {
    flexShrink: 0,
    flexGrow: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bg: {
    backgroundColor: '#FF6B35',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
});
