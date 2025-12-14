// This file will be populated once translation files are created
// It will provide type-safe translation keys

type Messages = {
  common: any;
  home: any;
  auth: any;
  validation: any;
};

declare global {
  interface IntlMessages extends Messages {}
}

export {};
