import { useState, useEffect } from 'react';

// Hieroglyphic mapping system
const HIEROGLYPHIC_MAP: Record<string, string> = {
  // Arabic letters
  'ا': '𓂋', 'ب': '𓃀', 'ت': '𓏏', 'ث': '𓊃', 'ج': '𓈎', 'ح': '𓉔', 'خ': '𓐍',
  'د': '𓂧', 'ذ': '𓊃', 'ر': '𓂋', 'ز': '𓊃', 'س': '𓋴', 'ش': '𓈝', 'ص': '𓋴',
  'ض': '𓂧', 'ط': '𓏏', 'ظ': '𓊃', 'ع': '𓂝', 'غ': '𓈎', 'ف': '𓆑', 'ق': '𓈎',
  'ك': '𓂓', 'ل': '𓃭', 'م': '𓅓', 'ن': '𓈖', 'ه': '𓉔', 'و': '𓅱', 'ي': '𓇋',
  
  // English letters
  'a': '𓄿', 'b': '𓃀', 'c': '𓈎', 'd': '𓂧', 'e': '𓂝', 'f': '𓆑', 'g': '𓎼',
  'h': '𓉔', 'i': '𓇋', 'j': '𓆳', 'k': '𓂓', 'l': '𓃭', 'm': '𓅓', 'n': '𓈖',
  'o': '𓅱', 'p': '𓊪', 'q': '𓈎', 'r': '𓂋', 's': '𓋴', 't': '𓏏', 'u': '𓅱',
  'v': '𓆑', 'w': '𓅱', 'x': '𓐍', 'y': '𓇋', 'z': '𓊃',
  
  // Numbers
  '0': '𓏢', '1': '𓏤', '2': '𓏥', '3': '𓏦', '4': '𓏧', '5': '𓏨',
  '6': '𓏩', '7': '𓏪', '8': '𓏫', '9': '𓏬',
  
  // Special characters
  ' ': '𓈚', '.': '𓊃', '!': '𓋴', '?': '𓈎', ',': '𓊪', ':': '𓏏'
};

// Reverse mapping for decryption
const REVERSE_HIEROGLYPHIC_MAP = Object.fromEntries(
  Object.entries(HIEROGLYPHIC_MAP).map(([key, value]) => [value, key])
);

// AES-like encryption simulation
const simpleEncrypt = (text: string, key: string): string => {
  let encrypted = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const keyCode = key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(charCode ^ keyCode);
  }
  return btoa(encrypted);
};

const simpleDecrypt = (encrypted: string, key: string): string => {
  try {
    const decoded = atob(encrypted);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i);
      const keyCode = key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode ^ keyCode);
    }
    return decrypted;
  } catch {
    return encrypted;
  }
};

export type EncryptionMode = 'none' | 'basic' | 'hieroglyphic' | 'advanced';

export const useEncryption = () => {
  const [encryptionMode, setEncryptionMode] = useState<EncryptionMode>('none');
  const [encryptionKey, setEncryptionKey] = useState('');

  // Generate random encryption key
  useEffect(() => {
    const generateKey = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    
    if (!encryptionKey) {
      setEncryptionKey(generateKey());
    }
  }, [encryptionKey]);

  const encryptMessage = (message: string): string => {
    switch (encryptionMode) {
      case 'basic':
        return simpleEncrypt(message, encryptionKey);
      
      case 'hieroglyphic':
        return message
          .toLowerCase()
          .split('')
          .map(char => HIEROGLYPHIC_MAP[char] || char)
          .join('');
      
      case 'advanced':
        const hieroglyphic = message
          .toLowerCase()
          .split('')
          .map(char => HIEROGLYPHIC_MAP[char] || char)
          .join('');
        return simpleEncrypt(hieroglyphic, encryptionKey);
      
      default:
        return message;
    }
  };

  const decryptMessage = (encrypted: string): string => {
    switch (encryptionMode) {
      case 'basic':
        return simpleDecrypt(encrypted, encryptionKey);
      
      case 'hieroglyphic':
        return encrypted
          .split('')
          .map(char => REVERSE_HIEROGLYPHIC_MAP[char] || char)
          .join('');
      
      case 'advanced':
        const decrypted = simpleDecrypt(encrypted, encryptionKey);
        return decrypted
          .split('')
          .map(char => REVERSE_HIEROGLYPHIC_MAP[char] || char)
          .join('');
      
      default:
        return encrypted;
    }
  };

  const convertToHieroglyphic = (text: string): string => {
    return text
      .toLowerCase()
      .split('')
      .map(char => HIEROGLYPHIC_MAP[char] || char)
      .join('');
  };

  const convertFromHieroglyphic = (hieroglyphic: string): string => {
    return hieroglyphic
      .split('')
      .map(char => REVERSE_HIEROGLYPHIC_MAP[char] || char)
      .join('');
  };

  return {
    encryptionMode,
    setEncryptionMode,
    encryptionKey,
    setEncryptionKey,
    encryptMessage,
    decryptMessage,
    convertToHieroglyphic,
    convertFromHieroglyphic
  };
};