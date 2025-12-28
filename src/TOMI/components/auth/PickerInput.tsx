import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { pickerInputStyles } from '../../styles/auth/pickerInput.styles';

interface PickerInputProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: readonly { label: string; value: string }[];
  error?: string;
  disabled?: boolean;
}

export const PickerInput: React.FC<PickerInputProps> = ({
  label,
  value,
  onValueChange,
  items,
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedItem = items.find(item => item.value === value);

  return (
    <View style={pickerInputStyles.container}>
      <Text style={pickerInputStyles.label}>{label}</Text>
      <TouchableOpacity
        style={[pickerInputStyles.pickerContainer, error && pickerInputStyles.pickerError]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={pickerInputStyles.selectedText}>
          {selectedItem?.label || 'Select...'}
        </Text>
        <Text style={pickerInputStyles.arrow}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={pickerInputStyles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          style={pickerInputStyles.modalOverlay}
          onPress={() => setIsOpen(false)}
        >
          <Pressable style={pickerInputStyles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={pickerInputStyles.modalHeader}>
              <Text style={pickerInputStyles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={pickerInputStyles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    pickerInputStyles.optionItem,
                    item.value === value && pickerInputStyles.selectedOption,
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setIsOpen(false);
                  }}
                >
                  <Text
                    style={[
                      pickerInputStyles.optionText,
                      item.value === value && pickerInputStyles.selectedOptionText,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Text style={pickerInputStyles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
