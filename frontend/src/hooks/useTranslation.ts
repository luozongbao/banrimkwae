import { useState, useEffect } from 'react';

interface TranslationData {
  [key: string]: string | TranslationData;
}

const translations = {
  en: {
    common: {
      language: 'Language',
      resortName: 'BANRIMKWAE RESORT',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
    },
    auth: {
      managementSystem: 'Management System',
      loginToSystem: 'LOGIN TO SYSTEM',
      emailOrUsername: 'Email/Username',
      password: 'Password',
      rememberMe: 'Remember me',
      login: 'Login',
      loggingIn: 'Logging in...',
      forgotPassword: 'Forgot Password?',
      needHelp: 'Need Help?',
      enterEmail: 'Enter your email',
      enterPassword: 'Enter your password',
      logout: 'Logout',
    },
    validation: {
      required: '{field} is required',
      invalidEmail: 'Please enter a valid email address',
      minLength: '{field} must be at least {length} characters',
    },
  },
  th: {
    common: {
      language: 'ภาษา',
      resortName: 'บ้านริมแคว รีสอร์ท',
      loading: 'กำลังโหลด...',
      save: 'บันทึก',
      cancel: 'ยกเลิก',
      edit: 'แก้ไข',
      delete: 'ลบ',
      add: 'เพิ่ม',
      search: 'ค้นหา',
      filter: 'กรอง',
      export: 'ส่งออก',
      import: 'นำเข้า',
    },
    auth: {
      managementSystem: 'ระบบจัดการ',
      loginToSystem: 'เข้าสู่ระบบ',
      emailOrUsername: 'อีเมล/ชื่อผู้ใช้',
      password: 'รหัสผ่าน',
      rememberMe: 'จดจำฉันไว้',
      login: 'เข้าสู่ระบบ',
      loggingIn: 'กำลังเข้าสู่ระบบ...',
      forgotPassword: 'ลืมรหัสผ่าน?',
      needHelp: 'ต้องการความช่วยเหลือ?',
      enterEmail: 'กรอกอีเมลของคุณ',
      enterPassword: 'กรอกรหัสผ่านของคุณ',
      logout: 'ออกจากระบบ',
    },
    validation: {
      required: 'กรุณากรอก{field}',
      invalidEmail: 'กรุณากรอกอีเมลที่ถูกต้อง',
      minLength: '{field}ต้องมีอย่างน้อย {length} ตัวอักษร',
    },
  },
};

export const useTranslation = () => {
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'th'>(() => {
    return (localStorage.getItem('language') as 'en' | 'th') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage];

    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value !== 'string') {
      return key; // Return key if translation not found
    }

    // Replace parameters
    if (params) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue));
      }, value);
    }

    return value;
  };

  const switchLanguage = (language: 'en' | 'th') => {
    setCurrentLanguage(language);
  };

  return {
    t,
    currentLanguage,
    switchLanguage,
  };
};
