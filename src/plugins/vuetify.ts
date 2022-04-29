import '@mdi/font/css/materialdesignicons.css';
import { createVuetify } from 'vuetify';

export const vuetify = createVuetify({
  defaults: {
    VBtn: {
      elevation: 0,
      color: 'primary'
    },
    VCheckbox: {
      hideDetails: true
    },
    VTextField: {
      variant: 'filled',
      color: 'primary',
      bgColor: 'neutral-darken-4'
    },
    VTextarea: {
      variant: 'filled',
      color: 'primary',
      bgColor: 'neutral-darken-4'
    },
    VSheet: {
      color: 'transparent'
    }
  },
  theme: {
    defaultTheme: 'walletTheme',
    themes: {
      walletTheme: {
        dark: true,
        colors: {
          background: '#090A0B',

          secondary: '#fff',

          'primary-darken-4': '#323200',
          'primary-darken-3': '#606300',
          'primary-darken-2': '#8B9200',
          'primary-darken-1': '#B4C100',
          primary: '#D9EE00',
          'primary-lighten-1': '#DFF433',
          'primary-lighten-2': '#E5F866',
          'primary-lighten-3': '#ECFC99',
          'primary-lighten-4': '#F5FECC',

          'success-darken-4': '#0A2A13',
          'success-darken-3': '#155427',
          'success-darken-2': '#217D3C',
          'success-darken-1': '#2DA553',
          success: '#3ACC6C',
          'success-lighten-1': '#60D88B',
          'success-lighten-2': '#87E3AA',
          'success-lighten-3': '#AEEDC7',
          'success-lighten-4': '#D6F6E4',

          'info-darken-4': '#112A33',
          'info-darken-3': '#225366',
          'info-darken-2': '#347A98',
          'info-darken-1': '#479FC9',
          info: '#5BC3F9',
          'info-lighten-1': '#7ACDFC',
          'info-lighten-2': '#9AD8FE',
          'info-lighten-3': '#BBE4FF',
          'info-lighten-4': '#DDF1FF',

          'error-darken-4': '#290908',
          'error-darken-3': '#4B1914',
          'error-darken-2': '#7A211B',
          'error-darken-1': '#A12F26',
          error: '#C74031',
          'error-lighten-1': '#D46859',
          'error-lighten-2': '#D49384',
          'error-lighten-3': '#EBB5AA',
          'error-lighten-4': '#F5DAD4',

          'neutral-darken-4': '#090A0B',
          'neutral-darken-3': '#252626',
          'neutral-darken-2': '#404142',
          'neutral-darken-1': '#5C5D5D',
          neutral: '#787879',
          'neutral-lighten-1': '#939494',
          'neutral-lighten-2': '#AFAFB0',
          'neutral-lighten-3': '#CBCBCB',
          'neutral-lighten-4': '#E6E7E7'
        }
      }
    }
  }
});
